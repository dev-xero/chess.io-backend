'use client';

import ClickableChessboard from '@/components/ClickableChessboard';
import GameHistoryBar from '@/components/GameHistoryBar';
import ChessIO from '@/components/ChessIO';
import GameStatsBar from '@/components/GameStatsBar';
import { useEffect, useState } from 'react';
import config from '@/config/config';
import { usePathname } from 'next/navigation';
import { keys } from '@/config/keys';
import ChessGame, {
    BoardMove,
    ChessState,
    Player,
} from '@/interfaces/chess.game.state';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { getCookie } from 'cookies-next';
import axios from 'axios';
import {
    GameTimeState,
    PlayerInfo,
    WSMoveMessage,
    WSStartMessage,
} from './interfaces/gameplay.interfaces';
import CenteredGrid from './CenteredGrid';

export default function GamePlayLayout() {
    const pathname = usePathname();
    const [fen, setFen] = useState('');
    const [isReady, setIsReady] = useState(false);
    const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
    const [game, setGame] = useState<ChessGame | null>(null);

    const { sendJsonMessage, lastJsonMessage, lastMessage, readyState } =
        useWebSocket(config.ws, {
            share: false,
            shouldReconnect: () => true,
        });

    const [playerColor, setPlayerColor] = useState<string | null>(null);
    const [whoseTurn, setWhoseTurn] = useState<'w' | 'b'>('w');
    const [gameTime, setGameTime] = useState({
        white: 180000,
        black: 180000,
        isWhitePaused: true,
        isBlackPaused: true,
    });

    // update this later
    const [movePairs, setMovePairs] = useState<string[][]>([]);
    const [moveCount, setMoveCount] = useState(0);

    // Account for time lag from the client
    function syncTime(duration: number) {
        const now = Date.now();
        return duration - (now - (game ? game.startTime : 0));
    }

    function updateMoveHistory(move: string[]) {
        if (move.length != 0) {
            if (moveCount == 0) {
                movePairs.push(move);
                setMoveCount(1);
                return;
            } else {
                const pairs: string[][] = [...movePairs];

                if (moveCount % 2 == 0) pairs.push(move);
                else pairs[movePairs.length - 1].push(...move);

                setMoveCount((moveCount) => moveCount + 1);
                setMovePairs(pairs);
            }
        }
    }

    function isValidGameTime(time: GameTimeState): boolean {
        return (
            !isNaN(time.white) &&
            !isNaN(time.black) &&
            time.white > 0 &&
            time.black > 0
        );
    }

    function makeMove(move: BoardMove) {
        if (playerInfo) {
            // pausing right before sending
            setGameTime((prev) => ({
                ...prev,
                isWhitePaused: true,
                isBlackPaused: true,
            }));

            setTimeout(() => {
                sendJsonMessage({
                    type: 'move',
                    data: {
                        gameID: playerInfo.gameID,
                        username: playerInfo?.username,
                        whiteTTP: gameTime.white,
                        blackTTP: gameTime.black,
                        ...move,
                    },
                });
            }, 500);
        }
    }

    // Game state synchronization
    const handleGameStateUpdate = (
        newState: ChessState,
        shouldSync = false
    ) => {
        setFen(newState.fen);

        setGameTime((prev) => ({
            ...prev,
            white: shouldSync ? syncTime(newState.whiteTTP) : newState.whiteTTP,
            black: shouldSync ? syncTime(newState.blackTTP) : newState.blackTTP,
            isWhitePaused: newState.turn === 'b',
            isBlackPaused: newState.turn === 'w',
        }));

        setWhoseTurn(newState.turn);
    };

    useEffect(() => {
        if (game) {
            setGameTime((prev) => ({
                ...prev,
                white: game.state.whiteTTP,
                black: game.state.blackTTP,
                isWhitePaused: game.state.turn === 'b',
                isBlackPaused: game.state.turn === 'w',
            }));
        }
    }, [game]);

    // User authentication
    useEffect(() => {
        const currentUser = localStorage.getItem(keys.user);
        if (!currentUser) {
            window.location.href = '/auth/login';
            return;
        }

        const userData = JSON.parse(currentUser);
        setPlayerInfo({
            userID: userData.id,
            username: userData.username,
            gameID: pathname.split('/')[2],
        });
    }, []);

    // Websocket authentication
    useEffect(() => {
        console.log('Connection state changed.');
        if (readyState == ReadyState.OPEN && playerInfo) {
            sendJsonMessage({
                type: 'auth',
                userId: playerInfo.userID,
            });
        }
    }, [readyState]);

    // Synchronization + broadcast game ready event
    useEffect(() => {
        const initialize = async () => {
            const gameID = playerInfo?.gameID;
            if (gameID) {
                const accessToken = getCookie(keys.auth);
                if (!accessToken) {
                    window.location.href = '/auth/login';
                    return;
                }

                try {
                    await axios.get(`${config.api}/game/state/${gameID}`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });

                    sendJsonMessage({
                        type: 'join_game',
                        gameID,
                    });
                    sendJsonMessage({
                        type: 'player_ready',
                        gameID,
                    });
                } catch (err) {
                    console.warn(err);
                    // window.location.location = '/challenge/create'
                }
            }
        };

        initialize();
    }, [playerInfo]);

    // Listen for any new messages
    useEffect(() => {
        if (lastMessage) {
            console.log(`Got a new message: ${lastMessage?.data}`);
        }

        if (
            playerInfo &&
            lastJsonMessage != null &&
            Object.keys(lastJsonMessage as WSStartMessage).length != 0
        ) {
            const socketMessage = lastJsonMessage as WSStartMessage;

            // console.log(`Got new json message:`, socketMessage);

            if (socketMessage.type == 'game_start') {
                const game = socketMessage.game;

                const parsedGame: ChessGame = {
                    startTime: game.startTime,
                    whitePlayer: JSON.parse(game.whitePlayer) as Player,
                    blackPlayer: JSON.parse(game.blackPlayer) as Player,
                    state: JSON.parse(game.state),
                    duration: game.duration,
                };

                setPlayerColor(
                    parsedGame.whitePlayer.username == playerInfo.username
                        ? 'w'
                        : 'b'
                );

                setGame(parsedGame);
                handleGameStateUpdate(parsedGame.state, true);
                setIsReady(true);
            } else if (
                socketMessage.type == 'move' ||
                socketMessage.type == 'move_accepted'
            ) {
                setGameTime((prev) => ({
                    ...prev,
                    isWhitePaused: true,
                    isBlackPaused: true,
                }));

                const moveMsg = lastJsonMessage as WSMoveMessage;

                const newGameState: ChessGame = {
                    startTime: moveMsg.startTime,
                    duration: moveMsg.duration,
                    whitePlayer: game!.whitePlayer,
                    blackPlayer: game!.blackPlayer,
                    state: moveMsg.state,
                }; // forcing this assertion might be problematic

                console.log('new state', newGameState);

                setGame(newGameState);
                handleGameStateUpdate(moveMsg.state);
            }
        }
    }, [lastMessage, lastJsonMessage]);

    return (
        <>
            {!playerInfo ||
            !isReady ||
            !game ||
            !fen ||
            !playerColor ||
            !isValidGameTime(gameTime) ? (
                <CenteredGrid>
                    <h3>
                        waiting
                    </h3>
                </CenteredGrid>
            ) : (
                <>
                    <header className="w-full flex items-center justify-center mt-4">
                        <ChessIO />
                    </header>
                    <section className="flex flex-col md:grid grid-cols-4 gap-2 mx-auto w-[calc(100%-16px)] py-2 !max-w-[1400px]">
                        <GameStatsBar
                            whoseTurn={whoseTurn}
                            gameType={game.state.gameType}
                            duration={game.state.duration}
                            gameTime={gameTime}
                            setGameTime={setGameTime}
                            whitePlayerName={game.whitePlayer.username}
                            blackPlayerName={game.blackPlayer.username}
                        />

                        <ClickableChessboard
                            playerColor={playerColor}
                            onMoveCompleted={(history) =>
                                updateMoveHistory(history)
                            }
                            setWhoseTurn={(color) => setWhoseTurn(color)}
                            onMoveComplete={(move) => makeMove(move)}
                            fen={fen}
                        />
                        <GameHistoryBar
                            moveHistoryPairs={movePairs}
                            whoseTurn={whoseTurn}
                        />
                    </section>
                </>
            )}
        </>
    );
}
