export interface GameEvents {
    onGameCreated(userId: string, data: any): void;
    onMove(gameId: string, data: any): void;
    onGameOver(gameId: string, data: any): void;
}

export interface AcceptedGame {
    gameID: string;
    duration: number;
    gameState: any;
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
}

export interface GameMove {
    gameID: string;
    username: string;
    from: string;
    to: string;
    promotion: string;
}