'use client';

import { keys } from '@/config/keys';
import { useState, useEffect, useCallback } from 'react';
import CenteredGrid from '@/layout/CenteredGrid';
import Error from '@/components/ui/Error';
import ProtectedPage from '@/components/ProtectedPage';
import { usePathname } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { ErrorResponse } from '@/util/error';
import config from '@/config/config';
import { getCookie } from 'cookies-next';
import NetworkConfig from '@/config/http';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import FilledButton from '@/components/ui/FilledButton';
import ChessIO from '@/components/ChessIO';

export default function Page() {
    const pathname = usePathname();
    const [userID, setUserID] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { sendJsonMessage, readyState } = useWebSocket(config.ws, {
        share: false,
        shouldReconnect: () => true,
    });

    const acceptChallenge = useCallback(async (gameId: string) => {
        setIsLoading(false);
         
        const accessToken = getCookie(keys.auth);

        if (!accessToken) {
            setError('Session has expired, log in again.');
            window.location.href = '/auth/login';
            return;
        }

        try {
            setIsLoading(true);

            const { data } = await axios.post(
                `${config.api}/challenge/accept/${gameId}`,
                {},
                {
                    headers: {
                        ...NetworkConfig.headers,
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const { payload } = data;
            const gameID = payload.gameState.gameID.split(':')[1];

            localStorage.setItem(
                keys.game.active,
                JSON.stringify(payload.gameState)
            );

            console.log('game started successfully.');
            window.location.href = `/game/${gameID}`;
        } catch (err) {
            const axiosError = err as AxiosError;
            if (axiosError.response) {
                console.warn(axiosError.response);
                const error =
                    ((err as AxiosError).response?.data as ErrorResponse)?.[
                        'message'
                    ] ?? 'Could not accept this challenge link.';
                setError(error);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    function handleChallengeAccepted() {
        const parts = pathname.split('/');

        if (parts.length != 5) {
            window.location.href = '/challenge/create';
            return;
        }

        const gameID = parts[4];

        if (userID && gameID) acceptChallenge(gameID);
    }

    useEffect(() => {
        const currentUser = localStorage.getItem(keys.user);
        if (!currentUser) {
            window.location.href = '/auth/login';
            return;
        }

        const userData = JSON.parse(currentUser);
        setUserID(userData.id);
    }, []);

    useEffect(() => {
        console.log('Connection state changed.');
        if (readyState == ReadyState.OPEN && userID) {
            sendJsonMessage({
                type: 'auth',
                userId: userID,
            });
        }
    }, [readyState, sendJsonMessage, userID]);

    return (
        <ProtectedPage>
            <CenteredGrid>
                <section className="w-screen md:w-[512px] max-w-lg flex flex-col items-center py-2 px-4 relative">
                    <section className="text-center flex flex-col mt-8">
                        <div className="flex justify-center items-center mb-4">
                            <ChessIO />
                        </div>
                        <p className='text-faded mt-4  my-8'>
                            <b className="text-foreground">{pathname.split('/')[3]}</b> is challenging you to a
                            chess game.<br /> May the best player win.
                        </p>
                        <FilledButton
                            label="Accept Challenge"
                            pendingText="Accepting"
                            isDisabled={isLoading}
                            onClick={() => handleChallengeAccepted()}
                        />
                        <Error err={error} />
                    </section>
                </section>
            </CenteredGrid>
        </ProtectedPage>
    );
}
