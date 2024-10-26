import { BadRequestError } from '@core/errors';
import { dispatch } from '@core/events';
import { logger } from '@core/logging';
import { RedisClient } from '@core/providers';
import { WebSocketManager } from '@core/websocket';
import { Chess } from 'chess.js';

interface AcceptedGame {
    gameID: string;
    duration: number;
    gameState: any;
}

interface IGamePlayer {
    id: string;
    username: string;
}

interface GameState {
    fen: string;
    pgn: string;
    turn: 'w' | 'b';
    whiteTTP: number;
    blackTTP: number;
    inCheck: boolean;
    isCheckmate: boolean;
    isDraw: boolean;
    isGameOver: boolean;
}

interface FullGameData {
    whitePlayer: string;
    blackPlayer: string;
    state: GameState;
}

export class GameService {
    constructor(
        private redisClient: RedisClient,
        private wsManager: WebSocketManager
    ) {}

    // returns game state as is
    private async getGameState(gameID: string): Promise<GameState | null> {
        const gameData = await this.redisClient.hgetall(gameID);
        if (!gameData) return null;
        return JSON.parse(gameData.state);
    }

    private async setGameState(
        gameId: string,
        state: GameState
    ): Promise<void> {
        await this.redisClient.hset(gameId, 'state', JSON.stringify(state));
    }

    public async getFullGameData(gameID: string): Promise<FullGameData | null> {
        try {
            const gameData = await this.redisClient.hgetall(`game:${gameID}`);
            if (!gameData) return null;
            return {
                whitePlayer: gameData.whitePlayer,
                blackPlayer: gameData.blackPlayer,
                state: JSON.parse(gameData.state)
            };
        } catch (err) {
            logger.error(`Error getting game data: ${err}`);
            throw err;
        }
    }

    public async createGame(
        whitePlayer: IGamePlayer,
        blackPlayer: IGamePlayer,
        duration: number
    ) {
        const gameID = `game:${Date.now()}`;
        const chess = new Chess();
        const initialState: GameState = {
            fen: chess.fen(),
            pgn: chess.pgn(),
            whiteTTP: duration,
            blackTTP: duration,
            turn: 'w',
            isCheckmate: chess.isCheckmate(),
            inCheck: chess.inCheck(),
            isDraw: chess.isDraw(),
            isGameOver: chess.isGameOver()
        };

        const gameData = {
            gameID,
            whitePlayer: JSON.stringify(whitePlayer),
            blackPlayer: JSON.stringify(blackPlayer),
            state: JSON.stringify(initialState)
        }

        await this.redisClient.hmset(gameID, gameData);

        return gameData;
    }

    public async createPendingGame(
        challenger: IGamePlayer,
        challengeID: string,
        duration: number
    ) {
        await this.redisClient.hmset(`pending:${challengeID}`, {
            challenger: JSON.stringify(challenger),
            duration: duration,
            status: 'pending'
        });

        await this.redisClient.expire(`pending:${challengeID}`, 1800); // expire in 30 mins
        logger.info(`Generated pending challenge with ID: ${challengeID}`);
    }

    /**
     * NOTE ON FEN:
     * rnbqkbnr/ -> all of black's 8th rank army
     * pppppppp/ -> all of black's pawns, 7th rank
     * 8/8/8/8/ -> ranks 3 - 6 are empty
     * PPPPPPPP/ -> all of white's pawns, 2nd rank
     * RNBQKBNR -> all of white's 1st rank army
     * w -> currently white's turn
     * KQ -> white can castle both kings and queens side
     * kq -> black can castle both kings and queens side
     * --  -> en passant target
     * 0 -> half move counter
     * 1 -> full move counter
     */
    public async acceptPendingGame(
        challengeID: string,
        opponent: IGamePlayer
    ): Promise<AcceptedGame | null> {
        const pendingGame = await this.redisClient.hgetall(
            `pending:${challengeID}`
        );

        if (!pendingGame || pendingGame.status != 'pending') {
            return null;
        }

        const challenger: IGamePlayer = JSON.parse(pendingGame.challenger);

        // Challenger can't accept the game
        if (challenger.username == opponent.username) {
            throw new BadRequestError("Challenger can't accept the game.");
        }

        const gameID = `game:${Date.now()}`;
        const duration = parseInt(pendingGame.duration, 10);

        const gameState = await this.createGame(challenger, opponent, duration);
        if (!gameState) {
            throw new BadRequestError('Could not create this game.');
        }

        // Expire in 24 hours if abandoned
        await this.redisClient.expire(gameID, 3600 * 24);
        // Remove pending game
        await this.redisClient.del(`pending:${challengeID}`);

        // Broadcast game started event to target clients
        this.wsManager.broadcastToUser(
            challenger.id,
            JSON.stringify({ type: 'game_started', gameID, gameState })
        );
        this.wsManager.broadcastToUser(
            opponent.id,
            JSON.stringify({ type: 'game_started', gameID, gameState })
        );

        dispatch('game:started', [gameID]);
        return { gameID, duration, gameState };
    }

    public async makeMove(gameID: string, username: string, move: string) {
        try {
            const gameData = await this.getFullGameData(gameID);
            if (!gameData) return null;

            const chess = new Chess(gameData.state.fen);
            const playerColor = gameData.whitePlayer == username ? 'w' : 'b';

            logger.info(
                `player color: ${playerColor}, pending player color: ${gameData.state.turn}, chess js pending color: ${chess.turn()}`
            );

            // validate turn and move
            if (gameData.state.turn != playerColor)
                throw new BadRequestError('Not your turn');

            try {
                chess.move(move);
            } catch (_) {
                throw new BadRequestError('Invalid move');
            }

            const newState: GameState = {
                ...gameData.state,
                fen: chess.fen(),
                pgn: chess.pgn(),
                turn: chess.turn() as 'w' | 'b',
                inCheck: chess.inCheck(),
                isCheckmate: chess.isCheckmate(),
                isDraw: chess.isDraw(),
                isGameOver: chess.isGameOver()
            };

            await this.setGameState(`game:${gameID}`, newState);
            logger.info(`Game ${gameID} updated.`);

            this.wsManager.broadcastToGame(
                gameID,
                JSON.stringify({
                    type: 'move',
                    move: move,
                    state: newState
                })
            );

            return newState;
        } catch (err) {
            logger.error(`Error making move: ${err}`);
            throw err;
        }
    }

    public async handleGameTimeout(gameID: string): Promise<void> {
        try {
            const gameData = await this.getFullGameData(gameID);
            if (!gameData) return;

            const { state } = gameData;
            state.isGameOver = true;

            await this.setGameState(gameID, state);

            this.wsManager.broadcastToGame(
                gameID,
                JSON.stringify({
                    type: 'game_over',
                    reason: 'timeout',
                    winner: state.turn === 'w' ? 'black' : 'white'
                })
            );

            dispatch('game:ended', [gameID, 'timeout']);
        } catch (error) {
            logger.error(`Error handling game timeout: ${error}`);
        }
    }
}
