import { dispatch } from '@core/events';
import { logger } from '@core/logging';
import { RedisClient } from '@core/providers';
import { WebSocketManager } from '@core/websocket';
import { Chess } from 'chess.js';

interface AcceptedGame {
    gameID: string;
    duration: number;
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

export class GameServie {
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

    private async getFullGameData(
        gameID: string
    ): Promise<FullGameData | null> {
        try {
            const gameData = await this.redisClient.hgetall(gameID);
            if (!gameData) return null;
            return {
                whitePlayer: gameData.whitePlayer,
                blackPlayer: gameData.blackPlayer,
                state: JSON.parse(gameData.state)
            };
        } catch (err) {
            logger.error(`Error making move: ${err}`);
            throw err;
        }
    }

    private async setGameState(
        gameId: string,
        state: GameState
    ): Promise<void> {
        await this.redisClient.hset(gameId, 'state', JSON.stringify(state));
    }

    public async createGame(
        whiteID: string,
        blackID: string,
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

        await this.redisClient.hmset(gameID, {
            whitePlayer: whiteID,
            blackPlayer: blackID,
            state: JSON.stringify(initialState)
        });
    }

    public async createPendingGame(
        challengerUsername: string,
        challengeID: string,
        duration: number
    ) {
        await this.redisClient.hmset(`pending:${challengeID}`, {
            challenger: challengerUsername,
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
        acceptingUsername: string
    ): Promise<AcceptedGame | null> {
        const pendingGame = await this.redisClient.hgetall(
            `pending:${challengeID}`
        );

        if (!pendingGame || pendingGame.status != 'pending') {
            return null;
        }

        if (pendingGame.challenger == acceptingUsername) {
            return null;
        }

        const gameID = `game:${Date.now()}`;
        const duration = parseInt(pendingGame.duration, 10);

        await this.createGame(
            pendingGame.challenger,
            acceptingUsername,
            duration
        );
        await this.redisClient.expire(gameID, 3600 * 24); // Expire in 24 hours if abandoned

        await this.redisClient.del(`pending:${challengeID}`); // Remove pending game

        // Broadcast game started event to target clients
        this.wsManager.broadcastToUser(
            pendingGame.challenger,
            JSON.stringify({ type: 'game_started', gameID })
        );
        this.wsManager.broadcastToUser(
            acceptingUsername,
            JSON.stringify({ type: 'game_started', gameID })
        );

        dispatch('game:started', [gameID]);
        return { gameID, duration };
    }

    public async makeMove(gameID: string, playerID: string, move: string) {
        try {
            const gameData = await this.getFullGameData(gameID);
            if (!gameData) return null;

            const chess = new Chess(gameData.state.fen);
            const playerColor = gameData.whitePlayer == playerID ? 'w' : 'b';

            // validate turn and move
            if (chess.turn() != playerColor) throw new Error('Not your turn');
            if (!chess.move(move)) throw new Error('Invalid move');

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

            await this.setGameState(gameID, newState);

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
