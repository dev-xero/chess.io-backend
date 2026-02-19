'use client';

import ChessIO from '@/components/ChessIO';
import Marker from '@/components/ui/Marker';
import CenteredGrid from '@/layout/CenteredGrid';
import IPlayer from '@/global/i.player';
import { useContext, useState, useEffect } from 'react';
import { PlayerContext } from '@/providers/player/context';
import LoadingFragment from '@/fragments/LoadingFragment';
import IconButton from '@/components/ui/IconButton';
import ChallengeIcon from '@/components/ui/ChallengeIcon';
import { ChartLineUp, SignOut } from '@phosphor-icons/react';
import config from '@/config/config';
import axios from 'axios';
import NetworkConfig from '@/config/http';
import { deleteCookie, getCookie } from 'cookies-next';
import { keys } from '@/config/keys';

export default function HomeFragment() {
    const { player } = useContext(PlayerContext);
    const [isLoading, setIsLoading] = useState(true);
    const [isLogoutLoading, setIsLogoutLoading] = useState(false);

    useEffect(() => {
        if (player !== null) {
            setIsLoading(false);
        }
    }, [player]);

    if (isLoading) {
        return <LoadingFragment />;
    }

    const handleLogOut = async () => {
        try {
            setIsLogoutLoading(true);
            await axios.get(`${config.api}/auth/logout`, {
                headers: {
                    ...NetworkConfig.headers,
                    Authorization: `Bearer ${getCookie(keys.auth)}`,
                },
            });
            localStorage.clear();
            deleteCookie(keys.auth);
            window.location.href = '/auth/login';
        } catch (err) {
            console.error(err);
        } finally {
            setIsLogoutLoading(false);
        }
    };

    return (
        <CenteredGrid>
            <main className="w-full md:w-[512px] max-w-lg flex flex-col items-center py-2 px-4 relative">
                <Marker />
                <ChessIO />
                {/* INFO SECTION */}
                <section className="text-center flex items-center gap-2 mt-8">
                    <p className="font-bold mb-2 text-faded">
                        Logged in as:{' '}
                        <span className="!font-normal text-primary">
                            @{(player as IPlayer).username}
                        </span>
                    </p>
                    <p className="font-bold mb-2 text-faded">
                        Rating:{' '}
                        <span className="!font-normal text-primary">
                            {(player as IPlayer).rating}
                        </span>
                    </p>
                </section>
                {/* CHALLENGE / ANALYTICS / LOGOUT */}
                <section className="w-full my-4 flex flex-col gap-1">
                    <IconButton
                        label="New Challenge"
                        onClick={() =>
                            (window.location.href = '/challenge/create')
                        }
                        isDisabled={false}
                        icon={<ChallengeIcon size={24} />}
                        secondary={false}
                    />
                    <IconButton
                        label="Analytics"
                        onClick={() => {}}
                        isDisabled={false}
                        icon={<ChartLineUp size={24} />}
                        secondary={true}
                    />
                    <IconButton
                        label="Logout"
                        onClick={handleLogOut}
                        isDisabled={isLogoutLoading}
                        pendingText="Logging Out"
                        icon={<SignOut size={24} />}
                        secondary={true}
                    />
                </section>
                <p className="my-2 text-xs text-faded">
                    Version: {config.version}
                </p>
            </main>
        </CenteredGrid>
    );
}
