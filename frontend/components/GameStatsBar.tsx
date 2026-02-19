import {
    Asterisk,
    Clock,
    FlagBannerFold,
    Handshake,
    Lightning,
    Timer,
} from '@phosphor-icons/react';
import React from 'react';
import ChessClock from './ChessClock';

type Game = 'Rapid' | 'Blitz' | 'Bullet';

interface IGameStatsBarProps {
    gameType: Game;
    whoseTurn: 'w' | 'b';
    duration: number;
    gameTime: {
        white: number;
        black: number;
        isWhitePaused: boolean;
        isBlackPaused: boolean;
    };
    setGameTime: (time: {
        white: number;
        black: number;
        isWhitePaused: boolean;
        isBlackPaused: boolean;
    }) => void;
    whitePlayerName: string;
    blackPlayerName: string;
}

export default function GameStatsBar(props: IGameStatsBarProps) {
    return (
        <aside className="col-span-1 order-2 md:order-1">
            <Card>
                <div className="flex sm:block gap-2 flex-row justify-center items-center">
                    <h3 className="flex gap-2 items-center text-foreground">
                        <div>
                            {props.gameType == 'Rapid' ? (
                                <Lightning size={24} weight="fill" />
                            ) : props.gameType == 'Blitz' ? (
                                <Timer size={24} weight="fill" />
                            ) : (
                                <Asterisk size={24} weight="fill" />
                            )}
                        </div>
                        <span className="font-bold">{props.gameType} Game</span>
                    </h3>
                    <p className="flex gap-2 sm:mt-2 text-faded items-center">
                        <Clock size={18} weight="fill" />
                        {props.gameType == 'Rapid'
                            ? '10'
                            : props.gameType == 'Blitz'
                            ? '5'
                            : '3'}{' '}
                        mins
                    </p>
                </div>
            </Card>
            <Card>
                <h3 className="w-full text-xs font-bold text-faded mb-2 text-center">
                    CLOCK
                </h3>
                <div className="flex items-center justify-center flex-row sm:flex-col gap-2">
                    <ChessClock
                        label={props.whitePlayerName}
                        timeLimit={props.duration}
                        currentTime={props.gameTime.white}
                        shouldPause={props.gameTime.isWhitePaused}
                        onTimeElapsed={() => alert('White Time Up!')}
                        onTick={(ms) =>
                            props.setGameTime({
                                ...props.gameTime,
                                white: ms,
                            })
                        }
                    />
                    <ChessClock
                        label={props.blackPlayerName}
                        timeLimit={props.duration}
                        currentTime={props.gameTime.black}
                        shouldPause={props.gameTime.isBlackPaused}
                        onTimeElapsed={() => alert('Black Time Up!')}
                        onTick={(ms) =>
                            props.setGameTime({
                                ...props.gameTime,
                                black: ms,
                            })
                        }
                    />
                </div>
            </Card>
            <Card>
                <h3 className="w-full text-xs font-bold text-faded mb-2 text-center">
                    ACTIONS
                </h3>
                <p
                    onClick={() => {}}
                    className="w-full flex items-center gap-2 cursor-pointer hover:underline underline-offset-4 mb-2 text-faded hover:text-foreground transition-all"
                >
                    <FlagBannerFold size={18} weight="fill" />
                    <span>Resign</span>
                </p>
                <p
                    onClick={() => {}}
                    className="w-full flex items-center gap-2 cursor-pointer hover:underline underline-offset-4 mb-2 text-faded hover:text-foreground transition-all"
                >
                    <Handshake size={18} weight="fill" />
                    <span>Draw</span>
                </p>
            </Card>
        </aside>
    );
}

interface ICardProps {
    children: React.ReactNode;
}

function Card({ children }: ICardProps) {
    return <div className="bg-base rounded-md p-4 w-full mb-2">{children}</div>;
}
