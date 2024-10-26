import { IncomingMessage } from 'http';
import { WebSocket, Server as WebSocketServer } from 'ws';
import { logger } from '@core/logging';
import { RedisClient } from '@core/providers';
import { dispatch } from '..';
import {
    FullGameData,
    GameMove,
    GameState
} from '@app/game/interfaces/game.interfaces';
import { Chess } from 'chess.js';
import { number } from 'joi';

export interface ExtendedWebSocket extends WebSocket {
    userId?: string;
}

export class WebSocketManager {
    private wss: WebSocketServer;
    private gameConnections: Map<string, ExtendedWebSocket[]> = new Map();
    private userConnections: Map<string, ExtendedWebSocket[]> = new Map();
    private playerReadyStates: Map<string, Set<string>> = new Map();

    constructor(private redisClient: RedisClient) {
        this.wss = new WebSocketServer({ noServer: true });
        this.init();
    }

    public handleUpgrade(req: IncomingMessage, ws: ExtendedWebSocket) {
        this.wss.emit('connection', ws, req);
        logger.info('WebSocket connection established.');

        ws.on('message', (message: string) => {
            try {
                const msg = JSON.parse(message);
                switch (msg.type) {
                    case 'auth':
                        this.authenticateUser(ws, msg.userId);
                        console.log(
                            `User with id: ${msg.userId} has been authenticated.`
                        );
                        break;

                    case 'join_game':
                        this.addToGame(msg.gameID, ws);
                        console.log(
                            `Game with id: ${msg.gameID} has been added.`
                        );
                        break;

                    case 'player_ready':
                        this.handlePlayerReady(ws, msg.gameID);
                        break;

                    case 'move':
                        this.handleMove(ws, msg.data);
                        break;

                    default:
                        console.log('Invalid message.');
                }
            } catch (error) {
                logger.error('Failed to read message data.');
                logger.error(error);
            }
        });

        ws.on('close', () => {
            logger.info('WebSocket connection closed.');
            this.removeFromGames(ws);
            this.removeFromUsers(ws);
        });
    }

    private async init() {
        // Connect and subscribe to games with redis
        await this.redisClient.connect();
        await this.redisClient.subscribe('game_updates', (message) => {
            const update = JSON.parse(message);
            dispatch('game:update');
            this.broadcastToGame(update.gameId, JSON.stringify(update));
        });
    }

    private authenticateUser(ws: ExtendedWebSocket, userId: string) {
        ws.userId = userId;
        if (userId) {
            if (!this.userConnections.has(userId)) {
                this.userConnections.set(userId, []);
            }
            this.userConnections.get(userId)!.push(ws);
            this.broadcastToUser(userId, 'successfully authenticated.');
        }
    }

    private addToGame(gameID: string, ws: ExtendedWebSocket) {
        if (!this.gameConnections.has(gameID)) {
            this.gameConnections.set(gameID, []);
        }
        if (!this.gameConnections.get(gameID)!.includes(ws)) {
            // they can't be added more than twice
            this.gameConnections.get(gameID)!.push(ws);
        } else {
            logger.info('This user is already present, skipping.');
        }
    }

    // remove ws connections from games
    private removeFromGames(ws: ExtendedWebSocket) {
        this.gameConnections.forEach((connections, gameId) => {
            const index = connections.indexOf(ws);
            if (index !== -1) {
                connections.splice(index, 1);
                if (connections.length === 0) {
                    this.gameConnections.delete(gameId);
                }
            }
        });
    }

    // removes from users map if it exists
    private removeFromUsers(ws: ExtendedWebSocket) {
        if (ws.userId) {
            const userConnections = this.userConnections.get(ws.userId);
            if (userConnections) {
                const index = userConnections.indexOf(ws);
                if (index !== -1) {
                    userConnections.splice(index, 1);
                    if (userConnections.length === 0) {
                        this.userConnections.delete(ws.userId);
                    }
                }
            }
        }
    }

    // general purpose broadcasts
    public broadcast(message: string) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    public broadcastToGame(gameId: string, message: string) {
        const connections = this.gameConnections.get(gameId);
        if (connections) {
            connections.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    }

    public broadcastToUser(userId: string, message: string) {
        const connections = this.userConnections.get(userId);
        if (connections) {
            connections.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    }

    private async handlePlayerReady(ws: ExtendedWebSocket, gameID: string) {
        if (!ws.userId) return;

        if (!gameID) {
            ws.send(
                JSON.stringify({
                    type: 'error',
                    message: 'Provide a valid game ID.'
                })
            );
            return;
        }

        try {
            // Get game data from Redis first
            const cache = await this.redisClient.hgetall(`game:${gameID}`);
            if (!cache) {
                ws.send(
                    JSON.stringify({
                        type: 'error',
                        message: 'Game not found'
                    })
                );
                return;
            }

            const gameData = cache;

            if (!this.playerReadyStates.has(gameID)) {
                this.playerReadyStates.set(gameID, new Set());
            }

            const readyPlayers = this.playerReadyStates.get(gameID)!;
            readyPlayers.add(ws.userId);

            const whitePlayer = JSON.parse(gameData.whitePlayer);
            const blackPlayer = JSON.parse(gameData.blackPlayer);

            // Check if both correct players are ready
            if (
                readyPlayers.size === 2 &&
                readyPlayers.has(whitePlayer.id) &&
                readyPlayers.has(blackPlayer.id)
            ) {
                this.broadcastToGame(
                    gameID,
                    JSON.stringify({
                        type: 'game_start',
                        game: {
                            duration: parseInt(gameData.duration),
                            state: gameData.state,
                            whitePlayer: gameData.whitePlayer,
                            blackPlayer: gameData.blackPlayer
                        }
                    })
                );
            } else {
                this.broadcastToGame(
                    gameID,
                    JSON.stringify({
                        type: 'waiting_for_opponent',
                        readyPlayers: Array.from(readyPlayers)
                    })
                );
            }
            logger.info('Done with player ready message.');
        } catch (err) {
            logger.error(err);
            ws.send(
                JSON.stringify({
                    type: 'error',
                    message: 'Failed to handle ready state.'
                })
            );
        }
    }

    private async handleMove(ws: ExtendedWebSocket, data: GameMove) {
        if (!ws.userId) {
            ws.send(
                JSON.stringify({
                    type: 'error',
                    message: 'Unauthenticated.'
                })
            );
            return;
        }

        if (data && data.gameID) {
            try {
                console.log(data);
                const gameData = await this.redisClient.hgetall(
                    `game:${data.gameID}`
                );
                if (!gameData) {
                    ws.send(
                        JSON.stringify({
                            type: 'error',
                            message: 'Game not found'
                        })
                    );
                    return;
                }

                console.log(gameData);

                const parsedState: GameState = JSON.parse(gameData.state);
                const whitePlayer = JSON.parse(gameData.whitePlayer);

                const chess = new Chess(parsedState.fen);
                const playerColor =
                    whitePlayer.username === data.username ? 'w' : 'b';

                // validate turn
                if (parsedState.turn != playerColor) {
                    ws.send(
                        JSON.stringify({
                            type: 'error',
                            message: 'Not your turn.'
                        })
                    );
                    return;
                }

                // Attempt to make chess move
                try {
                    const newMove = chess.move({
                        from: data.from,
                        to: data.to,
                        promotion: data.promotion
                    });

                    const newState = {
                        ...parsedState,
                        fen: chess.fen(),
                        pgn: chess.pgn(),
                        turn: chess.turn(),
                        inCheck: chess.inCheck(),
                        isCheckmate: chess.isCheckmate(),
                        isDraw: chess.isDraw(),
                        isGameOver: chess.isGameOver(),
                        whiteTTP: data.whiteTTP,
                        blackTTP: data.blackTTP
                    };

                    await this.redisClient.hset(
                        `game:${data.gameID}`,
                        'state',
                        JSON.stringify(newState)
                    );

                    // Notify players
                    this.broadcastToGame(
                        data.gameID,
                        JSON.stringify({
                            type: 'move',
                            move: newMove,
                            state: newState,
                            duration: parseInt(gameData.duration)
                        })
                    );

                    // Acknowledge move to sender
                    ws.send(
                        JSON.stringify({
                            type: 'move_accepted',
                            gameId: data.gameID,
                            state: newState,
                            duration: parseInt(gameData.duration)
                        })
                    );
                } catch (error) {
                    ws.send(
                        JSON.stringify({
                            type: 'error',
                            message: 'Invalid move'
                        })
                    );
                    return;
                }
            } catch (err) {
                logger.error(err);
                ws.send(
                    JSON.stringify({
                        type: 'error',
                        message: err.message ?? 'This move could not be made'
                    })
                );
            }
        }
    }

    private handleDisconnect(ws: ExtendedWebSocket) {
        if (!ws.userId) return;

        // Remove from ready states for all games
        this.gameConnections.forEach((connections, gameId) => {
            const readyPlayers = this.playerReadyStates.get(gameId);
            if (readyPlayers?.has(ws.userId!)) {
                readyPlayers.delete(ws.userId!);
                // Notify other players
                this.broadcastToGame(
                    gameId,
                    JSON.stringify({
                        type: 'player_disconnected',
                        userId: ws.userId
                    })
                );
            }
        });

        this.removeFromGames(ws);
        this.removeFromUsers(ws);
    }
}
