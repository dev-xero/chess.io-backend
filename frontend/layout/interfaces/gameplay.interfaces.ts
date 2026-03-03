import { ChessState } from "@/interfaces/chess.game.state";

export interface WSStartMessage {
    type: string;
    game: WSGameMessage;
}

export interface WSGameMessage {
    startTime: number;
    duration: number;
    whitePlayer: string;
    blackPlayer: string;
    state: string;
}

export interface WSMoveMessage {
    type: string;
    state: ChessState;
    duration: number;
    startTime: number;
}

export interface PlayerInfo {
    gameID: string;
    userID: string;
    username: string;
}

export interface GameTimeState {
    white: number;
    black: number;
    isWhitePaused: boolean;
    isBlackPaused: boolean;
}