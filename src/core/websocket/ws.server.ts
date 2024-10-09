import { Server as HTTPServer } from 'http';
import { WebSocket, Server as WebSocketServer } from 'ws';
import { logger } from '@core/logging';
import { RedisClient } from '@core/providers';

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
            });

            ws.on('close', () => {
                logger.info('Websocket connection closed.');
                this.removeFromGames(ws);
            });
        });
    }

    // subscribe to games with redis

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

    public broadcast(message: string) {
        this.wss.clients.forEach((client) => {
            if (client.readyState == WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
}
