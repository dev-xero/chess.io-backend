export interface GameEvents {
    onGameCreated(userId: string, data: unknown): void;
    onMove(gameId: string, data: unknown): void;
    onGameOver(gameId: string, data: unknown): void;
}

export interface AcceptedGame {
    gameID: string;
    duration: number;
    gameState: unknown;
}

export interface GamePlayer {
    id: string;
    username: string;
}

export interface GameState {
    fen: string;
    pgn: string;
    turn: 'w' | 'b';
    gameType: string;
    whiteTTP: number;
    blackTTP: number;
    inCheck: boolean;
    isCheckmate: boolean;
    isDraw: boolean;
    isGameOver: boolean;
}

export interface FullGameData {
    whitePlayer: string;
    blackPlayer: string;
    state: GameState;
    duration: number;
}

export interface GameMove {
    gameID: string;
    username: string;
    from: string;
    to: string;
    whiteTTP: number;
    blackTTP: number;
    promotion: string;
}
