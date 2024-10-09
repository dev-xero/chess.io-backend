import { RedisClient } from '@core/providers';
import { WebSocketManager } from '@core/websocket';

export class GameModule {
    constructor(
        private redisClient: RedisClient,
        private wsManager: WebSocketManager
    ) {}

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
        acceptingUsername: string,
        duration: number
    ): Promise<string | null> {
        const pendingGame = await this.redisClient.hgetall(
            `pending:${challengeID}`
        );

        if (!pendingGame || pendingGame.status != 'null') {
            return null;
        }

        const gameID = `game:${Date.now()}`;
        const gameData = {
            players: {
                white: pendingGame.challenger,
                black: acceptingUsername
            },
            board: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            currentTurn: 'white',
            status: 'in_progress',
            duration: duration,
            timeSpent: { white: 0, black: 0 }
        };

        await this.redisClient.hmset(gameID, gameData);
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

        return gameID;
    }

    public async createPendingGame(
        challengerUsername: string,
        challengeID: string
    ) {
        await this.redisClient.hmset(`pending:${challengeID}`, {
            challenger: challengerUsername,
            status: 'pending'
        });

        await this.redisClient.expire(`pending:${challengeID}`, 1800); // expire in 30 mins
    }
}
