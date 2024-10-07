type EventHandler = (...args: any[]) => void;

type EvMapParam = {
    [event: string]: EventHandler[];
};

export { EvMapParam };
