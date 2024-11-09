import { BadRequestError } from '@core/errors';
import { dispatch } from '@core/events';
import { logger } from '@core/logging';
import { RedisClient } from '@core/providers';
import { WebSocketManager } from '@core/websocket';
import { Chess } from 'chess.js';
import {
    AcceptedGame,
    FullGameData,
    GamePlayer,
    GameState
} from './interfaces/game.interfaces';

type ChessGameDuration = 600000 | 300000 | 180000;

export class GameService {
    constructor(
        private redisClient: RedisClient,
        private wsManager: WebSocketManager
    ) {}

    public async createPendingChallenge(
        challenger: GamePlayer,
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
    public async acceptPendingChallenge(
        challengeID: string,
        opponent: GamePlayer
    ): Promise<AcceptedGame | null> {
        const pendingGame = await this.redisClient.hgetall(
            `pending:${challengeID}`
        );

        if (!pendingGame || pendingGame.status != 'pending') {
            return null;
        }

        const challenger: GamePlayer = JSON.parse(pendingGame.challenger);

        // Challenger can't accept the game
        if (challenger.username == opponent.username) {
            throw new BadRequestError("Challenger can't accept the game.");
        }

        const gameID = `game:${Date.now()}`;
        const duration = parseInt(pendingGame.duration, 10);

        const gameState = await this.createChessGame(
            challenger,
            opponent,
            (duration * 1000) as ChessGameDuration // to ms
        );

        if (!gameState) {
            throw new BadRequestError('Could not create this game.');
        }

        // Expire in 24 hours if abandoned
        await this.redisClient.expire(gameID, 3600 * 24);

        // Set started games & expire later
        await this.redisClient.hmset(`challenge:${challengeID}`, {
            started: true,
            gameID
        });
        await this.redisClient.expire(`challenge:${challengeID}`, 3600 * 24);

        // Remove pending game
        await this.redisClient.del(`pending:${challengeID}`);

        // Broadcast game started event to target clients
        this.wsManager.broadcastToUser(challenger.id, {
            type: 'challenge_accepted',
            gameID,
            gameState
        });

        this.wsManager.broadcastToUser(opponent.id, {
            type: 'challenge_accepted',
            gameID,
            gameState
        });

        dispatch('game:accepted', [gameID]);

        return { gameID, duration, gameState };
    }

    public async createChessGame(
        whitePlayer: GamePlayer,
        blackPlayer: GamePlayer,
        duration: ChessGameDuration
    ) {
        const validDurations = [600000, 300000, 180000] as const;

        if (
            !validDurations.includes(
                duration as (typeof validDurations)[number]
            )
        ) {
            return null;
        }

        const gameID = `game:${Date.now()}`;
        const chess = new Chess();
        const initialState: GameState = {
            fen: chess.fen(),
            pgn: chess.pgn(),
            gameType:
                duration == 600000
                    ? 'Rapid'
                    : duration == 300000
                      ? 'Blitz'
                      : 'Bullet',
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
            state: JSON.stringify(initialState),
            duration
        };

        await this.redisClient.hmset(gameID, gameData);

        return gameData;
    }

    public async getFullGameData(gameID: string): Promise<FullGameData | null> {
        try {
            const gameData = await this.redisClient.hgetall(`game:${gameID}`);
            if (!gameData) return null;
            return {
                whitePlayer: gameData.whitePlayer,
                blackPlayer: gameData.blackPlayer,
                state: JSON.parse(gameData.state),
                duration: parseInt(gameData.duration)
            };
        } catch (err) {
            logger.error(`Error getting game data: ${err}`);
            throw err;
        }
    }

    public async getChallengeState(
        challengeID: string
    ): Promise<IGameStateRequest> {
        try {
            const state = await this.redisClient.hgetall(
                `challengeID:${challengeID}`
            );

            if (!state) {
                return {
                    started: false,
                    gameID: null
                };
            }

            return {
                started: state.started == 'true',
                gameID: state.gameID
            };
        } catch (err) {
            logger.error(`Error confirming game state: ${err}`);
            throw err;
        }
    }
}

interface IGameStateRequest {
    started: boolean;
    gameID: string | null;
}
