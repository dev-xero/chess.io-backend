export interface ChessState {
    fen: string;
    pgn: string;
    duration: number;
    whiteTTP: number;
    blackTTP: number;
    gameType: 'Rapid' | 'Bullet' | 'Blitz';
    inCheck: boolean;
    isCheckmate: boolean;
    isDraw: boolean;
    isGameOver: boolean;
    turn: 'w' | 'b';
}

export interface Player {
    id: string;
    username: string;
}

export interface ChessMove {
    gameID: string;
    username: string;
    from: string;
    to: string;
    promotion: string;
}

export interface BoardMove {
    from: string;
    to: string;
    promotion: string;
}

export default interface ChessGame {
    startTime: number;
    duration: number;
    whitePlayer: Player;
    blackPlayer: Player;
    state: ChessState;
}
