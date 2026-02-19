import { EventEmitter2 as EventManager } from 'eventemitter2';
import { EvMapParam } from './events.map';
import registry from './events.registry';

// Responsible for managing event notifications across the system
class AppEventManager extends EventManager {
    constructor(evMap: EvMapParam) {
        super();
        this.register(evMap).then(() =>
            this.dispatch('event:registration:successful')
        );
    }

    private async register(events: EvMapParam) {
        Object.keys(events).map((event) => {
            const listeners = events[event];
            if (Array.isArray(listeners)) {
                listeners.forEach((listener) => {
                    this.on(event, listener);
                });
            } else {
                this.on(event, listeners);
            }
        });
    }

    public dispatch(event: string, ...values: any[]) {
        this.emit(event, ...values);
    }
}

const appEventManager = new AppEventManager(registry);
export const dispatch = appEventManager.dispatch.bind(appEventManager);
