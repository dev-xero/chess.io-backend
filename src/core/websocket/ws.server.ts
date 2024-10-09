import { EventEmitter } from 'events';
import { Server as HTTPServer } from 'http';
import { Server as WebSocketServer } from 'ws';
import { logger } from '@core/logging';

export class WebSocketManager extends EventEmitter {
    private wss: WebSocketServer;

    constructor(server: HTTPServer) {
        super();
        this.wss = new WebSocketServer({ server });
        this.init();
    }

    private init() {
        this.wss.on('connection', (ws) => {
            logger.info('Websocket connection initialized.');

            ws.on('close', () => {
                logger.info('Websocket connection closed.');
            });
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
