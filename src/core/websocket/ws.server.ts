import { Server as HTTPServer } from 'http';
import { WebSocket, Server as WebSocketServer } from 'ws';
import { logger } from '@core/logging';
import { RedisClient } from '@core/providers';
import { dispatch } from '..';

export class WebSocketManager {
    private wss: WebSocketServer;
    private gameConnections: Map<string, WebSocket[]> = new Map();

    constructor(
        server: HTTPServer,
        private redisClient: RedisClient
    ) {
        this.wss = new WebSocketServer({ server });
        this.init();
    }

    private init() {
        this.wss.on('connection', (ws: WebSocket) => {
            logger.info('Websocket connection initialized.');

            ws.on('message', (message: string) => {
                const data = JSON.parse(message);
                // add to games
                if (data.type === 'join_game') {
                    this.addToGame(data.gameId, ws);
                }
            });

            ws.on('close', () => {
                logger.info('Websocket connection closed.');
                this.removeFromGames(ws);
            });

            // subscribe to games with redis
            this.redisClient.subscribe('game_updates', (message) => {
                const update = JSON.parse(message);
                dispatch("game:update");
                this.broadcastToGame(update.gameId, JSON.stringify(update));
            });
        });
    }

    // get this game id and append to game conns
    private addToGame(gameId: string, ws: WebSocket) {
        if (!this.gameConnections.has(gameId)) {
            this.gameConnections.set(gameId, []);
        }
        this.gameConnections.get(gameId)!.push(ws);
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

    // broadcast ws messages to open connections
    public broadcast(message: string) {
        this.wss.clients.forEach((client) => {
            if (client.readyState == WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    // remove ws conn from its game id
    private removeFromGames(ws: WebSocket) {
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
}
