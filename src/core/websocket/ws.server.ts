import { IncomingMessage } from 'http';
import { WebSocket, Server as WebSocketServer } from 'ws';
import { logger } from '@core/logging';
import { RedisClient } from '@core/providers';
import { dispatch } from '..';

export interface ExtendedWebSocket extends WebSocket {
    userId?: string;
}

export class WebSocketManager {
    private wss: WebSocketServer;
    private gameConnections: Map<string, ExtendedWebSocket[]> = new Map();
    private userConnections: Map<string, ExtendedWebSocket[]> = new Map();

    constructor(private redisClient: RedisClient) {
        this.wss = new WebSocketServer({ noServer: true });
        this.init();
    }

    public handleUpgrade(req: IncomingMessage, ws: ExtendedWebSocket) {
        this.wss.emit('connection', ws, req);
        logger.info('WebSocket connection established.');

        ws.on('message', (message: string) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'auth') {
                    this.authenticateUser(ws, data.userId);
                    console.log(
                        `User with id: ${data.userId} has been authenticated.`
                    );
                } else if (data.type === 'join_game') {
                    this.addToGame(data.gameId, ws);
                    console.log(`Game with id: ${data.gameId} has been added.`);
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
        if (!this.userConnections.has(userId)) {
            this.userConnections.set(userId, []);
        }
        this.userConnections.get(userId)!.push(ws);
    }

    private addToGame(gameId: string, ws: ExtendedWebSocket) {
        if (!this.gameConnections.has(gameId)) {
            this.gameConnections.set(gameId, []);
        }
        this.gameConnections.get(gameId)!.push(ws);
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
}
