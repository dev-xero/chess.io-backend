'use client';

import ChallengeIcon from '@/components/ui/ChallengeIcon';
import IconButton from '@/components/ui/IconButton';
import TimeControlPill from '@/components/TimeControlPill';
import Error from '@/components/ui/Error';
import { TIME_CONTROL } from '@/config/controls';
import CenteredGrid from '@/layout/CenteredGrid';
import { ErrorResponse } from '@/util/error';
import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import NetworkConfig from '@/config/http';
import { getCookie } from 'cookies-next';
import { keys } from '@/config/keys';
import config from '@/config/config';

export default function Page() {
    const [selectedControl, setSelectedControl] = useState(TIME_CONTROL.RAPID);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState('');
    const timeControls = [
        { name: 'Rapid', control: TIME_CONTROL.RAPID },
        { name: 'Blitz', control: TIME_CONTROL.BLITZ },
        { name: 'Bullet', control: TIME_CONTROL.BULLET },
    ];

    const displayError = (msg: string) => {
        setError(msg);
        setIsPending(false);
    };

    const handleNewChallengeCreation = async () => {
        setIsPending(true);
        try {
            const loggedInUser = JSON.parse(
                localStorage.getItem(keys.user) ?? '{}'
            );
            if (!loggedInUser) {
                console.warn('Invalid login state.');
                displayError('Invalid login state, please log in again.');
                return;
            }

            const gameDuration = parseInt(selectedControl) * 60;
            console.log('game duration:', gameDuration);

            const accessToken = getCookie(keys.auth);
            if (!accessToken) {
                displayError('Session has expired, log in again.');
                setTimeout(() => {
                    window.location.href = '/auth/login';
                }, 500);
                return;
            }
            localStorage.removeItem(keys.game.pending); // remove any previously pending games
            
            const { data } = await axios.post(
                `${config.api}/challenge/create?duration=${gameDuration}`,
                {
                    username: '',
                },
                {
                    headers: {
                        ...NetworkConfig.headers,
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            
            const { expiresIn, link } = data.payload;
            
            localStorage.setItem(
                keys.game.pending,
                JSON.stringify({
                    expiresIn,
                    link,
                    id: link.split("/")[2],
                    challenger: loggedInUser.username,
                })
            );

            const parts = link.split('/');
            const challenger = parts[1];
            const challengeID = parts[2];
            
            window.location.href = `/challenge/pending/${challenger}/${challengeID}`;
        } catch (err) {
            const axiosError = err as AxiosError;
            if (axiosError.response) {
                console.warn(axiosError.response);
                const error =
                    ((err as AxiosError).response?.data as ErrorResponse)?.[
                        'error'
                    ] ?? 'Could not generate a challenge link.';
                displayError(error);
            } else {
                displayError('An unknown error occurred.');
            }
        } finally {
            setIsPending(false);
        }
    };

    return (
        <CenteredGrid>
            <section className="w-screen md:w-[512px] max-w-lg flex flex-col items-center py-2 px-4 relative">
                <section className="text-center flex flex-col mt-8">
                    <h2 className="font-bold mb-2 text-2xl">
                        Create a Challenge
                    </h2>
                    <p className="text-faded">
                        A unique game link will be generated.
                    </p>
                </section>
                {/* TIME CONTROL */}
                <section className="mt-4">
                    <h4 className="text-faded font-bold text-sm text-center mt-4">
                        TIME CONTROL
                    </h4>

                    <section className="w-[calc(100vw-32px)] max-w-lg md:w-[512px] my-4 flex md:flex-row flex-col gap-2 px-2 sm:px-4">
                        {timeControls.map((tc, idx) => (
                            <TimeControlPill
                                key={idx}
                                variant={tc}
                                onClick={() => setSelectedControl(tc.control)}
                                selected={selectedControl}
                                isDisabled={isPending}
                            />
                        ))}
                    </section>
                    <p className="text-center text-sm text-faded mt-8 mb-2">
                        Challengers play White by default.
                    </p>
                </section>
                {/* CREATE CHALLENGE BUTTON */}
                <IconButton
                    label="Create Game"
                    icon={<ChallengeIcon size={24} />}
                    secondary={false}
                    isDisabled={isPending}
                    onClick={handleNewChallengeCreation}
                    pendingText="Creating"
                />
                <Error err={error} />
            </section>
        </CenteredGrid>
    );
}
