'use client';

import { BoardMove } from '@/interfaces/chess.game.state';
import { Chess, Square, Move, PieceSymbol } from 'chess.js';
import { useCallback, useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { PromotionPieceOption } from 'react-chessboard/dist/chessboard/types';

type ChessSquareStyle = Record<string, string | number>;
type CustomSquareStyles = Record<string, ChessSquareStyle>;

const INITIAL_SQUARE_STYLES: CustomSquareStyles = {};

interface IChessBoardInterface {
    fen: string;
    onMoveCompleted(history: string[]): void;
    setWhoseTurn(color: 'w' | 'b'): void;
    playerColor: string;
    onMoveComplete(move: BoardMove): void;
}

interface SquareState {
    moveSquares: CustomSquareStyles;
    optionSquares: CustomSquareStyles;
    rightClickedSquares: CustomSquareStyles;
}

export default function ClickableChessboard(props: IChessBoardInterface) {
    const [gameInstance, setGameInstance] = useState<Chess>(
        new Chess(props.fen)
    );
    const [moveFrom, setMoveFrom] = useState<Square | ''>('');
    const [moveTo, setMoveTo] = useState<Square | null>(null);
    const [showPromotionDialog, setShowPromotionDialog] =
        useState<boolean>(false);
    const [boardPosition, setBoardPosition] = useState<string>(props.fen);

    const [squareStyles, setSquareStyles] = useState<SquareState>({
        moveSquares: INITIAL_SQUARE_STYLES,
        optionSquares: INITIAL_SQUARE_STYLES,
        rightClickedSquares: INITIAL_SQUARE_STYLES,
    });

    useEffect(() => {
        console.log('New FEN received:', props.fen);
        const newGame = new Chess(props.fen);

        updateCheckHighlights(newGame);
        setGameInstance(newGame);
        setBoardPosition(props.fen);
    }, [props.fen]);

    const findKingSquare = useCallback(
        (color: 'w' | 'b'): Square | null => {
            const board = gameInstance.board();
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    const piece = board[i][j];
                    if (piece && piece.type === 'k' && piece.color === color) {
                        return `${String.fromCharCode(97 + j)}${
                            8 - i
                        }` as Square;
                    }
                }
            }
            return null;
        },
        [gameInstance]
    );

    const updateCheckHighlights = useCallback(
        (game: Chess) => {
            const newMoveSquares = { ...INITIAL_SQUARE_STYLES };

            if (game.isCheck()) {
                const kingSquare = findKingSquare(game.turn());
                if (kingSquare) {
                    newMoveSquares[kingSquare] = {
                        backgroundColor: 'rgba(255, 0, 0, 0.4)',
                    };
                }
            }

            setSquareStyles((prev) => ({
                ...prev,
                moveSquares: newMoveSquares,
            }));
        },
        [findKingSquare]
    );

    const isPlayersTurn = useCallback(() => {
        return gameInstance.turn() === props.playerColor;
    }, [props.playerColor, gameInstance]);

    const getMoveOptions = useCallback(
        (square: Square) => {
            if (!isPlayersTurn()) {
                return false;
            }

            const moves = gameInstance.moves({ square, verbose: true });

            if (moves.length === 0) {
                setSquareStyles((prev) => ({
                    ...prev,
                    optionSquares: {},
                }));
                return false;
            }

            const newSquares: CustomSquareStyles = {};
            moves.forEach((move: Move) => {
                const targetPiece = gameInstance.get(move.to as Square);
                const isCapture =
                    targetPiece &&
                    targetPiece.color !== gameInstance.get(square)?.color;

                newSquares[move.to] = {
                    background: isCapture
                        ? 'rgba(252,181,100,0.75)'
                        : 'radial-gradient(circle, rgba(0,0,0,.2) 20%, transparent 20%)',
                    borderRadius: isCapture ? '0' : '50',
                };
            });

            newSquares[square] = {
                background: 'rgba(100,252,108,0.75)',
            };

            setSquareStyles((prev) => ({
                ...prev,
                optionSquares: newSquares,
            }));

            return true;
        },
        [isPlayersTurn, gameInstance]
    );

    const makeMove = useCallback(
        (from: Square, to: Square, promotion?: PieceSymbol) => {
            const game = gameInstance;
            try {
                const move = game.move({ from, to, promotion });
                if (move) {
                    const newFen = game.fen();
                    setBoardPosition(newFen);
                    updateCheckHighlights(game);

                    props.setWhoseTurn(game.turn());
                    props.onMoveCompleted(game.history());
                    props.onMoveComplete({
                        from,
                        to,
                        promotion: promotion ?? 'q',
                    });

                    return true;
                }
            } catch (err) {
                console.warn(err);
            }
            return false;
        },
        [props, findKingSquare, updateCheckHighlights, gameInstance]
    );

    const onSquareClick = useCallback(
        (square: Square) => {
            if (!isPlayersTurn()) {
                return;
            }

            const game = gameInstance;
            setSquareStyles((prev) => ({
                ...prev,
                rightClickedSquares: { ...INITIAL_SQUARE_STYLES },
            }));

            const piece = game.get(square);
            const isCurrentTurnPiece = piece && piece.color === game.turn();

            if (!moveFrom) {
                if (isCurrentTurnPiece) {
                    const hasMoveOptions = getMoveOptions(square);
                    if (hasMoveOptions) setMoveFrom(square);
                }
                return;
            }

            if (!moveTo) {
                const moves = game.moves({ square: moveFrom, verbose: true });
                const foundMove = moves.find(
                    (m) => m.from === moveFrom && m.to === square
                );

                if (!foundMove) {
                    if (isCurrentTurnPiece) {
                        const hasMoveOptions = getMoveOptions(square);
                        setMoveFrom(hasMoveOptions ? square : '');
                    }
                    return;
                }

                setMoveTo(square);

                if (
                    foundMove &&
                    ((foundMove.color === 'w' &&
                        foundMove.piece === 'p' &&
                        square[1] === '8') ||
                        (foundMove.color === 'b' &&
                            foundMove.piece === 'p' &&
                            square[1] === '1'))
                ) {
                    setShowPromotionDialog(true);
                    return;
                }

                if (makeMove(moveFrom, square)) {
                    setMoveFrom('');
                    setMoveTo(null);
                    setSquareStyles((prev) => ({
                        ...prev,
                        optionSquares: { ...INITIAL_SQUARE_STYLES },
                    }));
                }
            }
        },
        [
            moveFrom,
            moveTo,
            getMoveOptions,
            makeMove,
            props.playerColor,
            isPlayersTurn,
            gameInstance,
        ]
    );

    const onPromotionPieceSelect = useCallback(
        (piece?: PromotionPieceOption) => {
            if (piece && moveFrom && moveTo) {
                makeMove(
                    moveFrom,
                    moveTo,
                    piece[1].toLowerCase() as PieceSymbol
                );
            }
            setMoveFrom('');
            setMoveTo(null);
            setShowPromotionDialog(false);
            setSquareStyles((prev) => ({
                ...prev,
                optionSquares: { ...INITIAL_SQUARE_STYLES },
            }));
            return true;
        },
        [moveFrom, moveTo, makeMove]
    );

    const onPieceDrop = useCallback(
        (sourceSquare: string, targetSquare: string, piece: string) => {
            if (
                !isPlayersTurn() ||
                piece.charAt(0).toLowerCase() !== props.playerColor
            ) {
                return false;
            }

            return makeMove(
                sourceSquare as Square,
                targetSquare as Square,
                piece.toLowerCase().charAt(1) as PieceSymbol
            );
        },
        [makeMove, props.playerColor, isPlayersTurn]
    );

    return (
        <div className="w-full max-w-screen-lg mx-auto col-span-2 order-1 md:order-2">
            <Chessboard
                boardOrientation={props.playerColor == 'w' ? 'white' : 'black'}
                position={boardPosition}
                animationDuration={200}
                arePiecesDraggable={isPlayersTurn()}
                onPieceDrop={onPieceDrop}
                onSquareClick={onSquareClick}
                onPromotionPieceSelect={onPromotionPieceSelect}
                showPromotionDialog={showPromotionDialog}
                customDropSquareStyle={{
                    boxShadow: 'inset 0 0 1px 6px rgba(100,252,108,0.75)',
                }}
                customDarkSquareStyle={{ backgroundColor: '#485A75' }}
                customLightSquareStyle={{ backgroundColor: '#ADC0DC' }}
                customSquareStyles={{
                    ...(squareStyles.moveSquares as CustomSquareStyles),
                    ...(squareStyles.optionSquares as CustomSquareStyles),
                    ...(squareStyles.rightClickedSquares as CustomSquareStyles),
                }}
                promotionToSquare={moveTo}
            />
        </div>
    );
}
