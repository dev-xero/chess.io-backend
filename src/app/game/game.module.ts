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
     * -  -> en passant target
     * 0 -> half move counter
     * 1 -> full move counter
     */
    public async createGame(
        player1ID: string,
        player2ID: string,
        duration: number
    ): Promise<string> {
        const gameID = `game:${Date.now()}`;
        const gameData = {
            players: { white: player1ID, black: player2ID },
            board: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            currentTurn: 'white',
            status: 'in_progress',
            moves: [],
            duration: duration,
            timeSpent: { white: 0, black: 0 }
        };

        return gameID;
    }
}
