import registry from './events.registry';

type EventHandler = () => void;

type EvMapParam = {
    [event: string]: EventHandler[];
};

export { EvMapParam };
