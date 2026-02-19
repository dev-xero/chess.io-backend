'use client';

import IPlayer from '@/global/i.player';
import { Dispatch, SetStateAction, createContext } from 'react';

export interface IPlayerContext {
    player: IPlayer | null;
    setPlayer: Dispatch<SetStateAction<IPlayer | null>>;
}

export const PlayerContext = createContext<IPlayerContext>({
    player: null,
    setPlayer: () => {},
});
