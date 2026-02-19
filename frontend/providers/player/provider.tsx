'use client';

import { keys } from '@/config/keys';
import IPlayer from '@/global/i.player';
import React, { useEffect, useState } from 'react';
import { PlayerContext } from './context';

interface IPlayerProviderProps {
    children: React.ReactNode;
}

export const PlayerProvider = ({ children }: IPlayerProviderProps) => {
    const [player, setPlayer] = useState<IPlayer | null>(null);

    useEffect(() => {
        const storedPlayer = localStorage.getItem(keys.user);
        if (storedPlayer) {
            setPlayer(JSON.parse(storedPlayer));
        }
    }, []);

    return (
        <PlayerContext.Provider value={{ player, setPlayer }}>
            {children}
        </PlayerContext.Provider>
    );
};
