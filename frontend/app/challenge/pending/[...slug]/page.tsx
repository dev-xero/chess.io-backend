'use client';

import ProtectedPage from '@/components/ProtectedPage';
import NotificationCard from '@/components/ui/NotificationCard';
import config from '@/config/config';
import { keys } from '@/config/keys';
import CenteredGrid from '@/layout/CenteredGrid';
import { CookieValueTypes, getCookie } from 'cookies-next';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

interface IPendingChallenge {
    link: string;
    challenger: string;
    expiresIn: number;
}

export default function Page() {
    const [pendingChallenge, setPendingChallenge] =
        useState<IPendingChallenge | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [userID, setUserID] = useState<string | null>(null);
    const [challengeLink, setChallengeLink] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    const { sendJsonMessage, lastMessage, readyState } = useWebSocket(
        config.ws,
        {
            share: false,
            shouldReconnect: () => true,
        }
    );

    async function handleLinkShare(link: string) {
        try {
            await navigator.clipboard.writeText(link);

            setIsVisible(true);

            const timer = setTimeout(() => {
                setIsVisible(false);
                clearTimeout(timer);
            }, 1000);
        } catch (err) {
            console.error(err);
            alert('Failed to copy to clipboard.');
        }
    }

    async function checkChallengeState(token: CookieValueTypes) {
        const savedChallenge = localStorage.getItem(keys.game.pending) ?? '{}';
        const stored = JSON.parse(savedChallenge);

        const res = await fetch(`${config.api}/game/challenge/${stored.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (data.started) {
            window.location.href = `/game${data.gameID}`;
        }
    }

    useEffect(() => setIsMounted(true), []);

    // Check if the challenge has been accepted on load
    useEffect(() => {
        if (challengeLink) {
            const authToken = getCookie(keys.auth);
            checkChallengeState(authToken);
        }
    }, [challengeLink]);

    // Gather user data, then accept challenge link
    useEffect(() => {
        const currentUser = localStorage.getItem(keys.user);
        if (!currentUser) {
            window.location.href = '/auth/login';
            return;
        }

        const userData = JSON.parse(currentUser);
        setUserID(userData.id);

        const createdChallenge = JSON.parse(
            localStorage.getItem(keys.game.pending) ?? '{}'
        );

        if (!createdChallenge) {
            window.location.href = '/';
            return;
        }

        // TODO: check that the challenge still exists here

        setPendingChallenge(createdChallenge);
        setChallengeLink(`${config.url}/challenge/${createdChallenge.link}`);
    }, []);

    // Websocket authentication
    useEffect(() => {
        console.log('Connection state changed.');
        if (readyState == ReadyState.OPEN && userID) {
            sendJsonMessage({
                type: 'auth',
                userId: userID,
            });
        }
    }, [readyState]);

    useEffect(() => {
        console.log(`Got a new message: ${lastMessage?.data}`);
        try {
            const socketMsg = JSON.parse(lastMessage?.data);

            if (socketMsg.type == 'challenge_accepted') {
                const gameID = socketMsg.gameID.split(':')[1];

                localStorage.setItem(
                    keys.game.active,
                    JSON.stringify(socketMsg.gameState)
                );

                console.log('game started successfully.');
                window.location.href = `/game/${gameID}`;
            }
        } catch {
            console.warn('Not JSON parsable.');
        }
    }, [lastMessage]);

    return (
        <ProtectedPage>
            <CenteredGrid>
                {isMounted && (
                    <section className="w-screen md:w-[512px] max-w-lg flex flex-col items-center py-2 px-4 relative">
                        <section className="text-center flex flex-col mt-8">
                            <h2 className="font-bold mb-2 text-2xl">
                                Challenge Pending
                            </h2>
                            <p className="text-faded">
                                Waiting for someone to accept this challenge.
                                Refresh this page if it doesn&apos;t redirect
                                automatically.
                            </p>
                            {pendingChallenge && (
                                <>
                                    <p
                                        className="my-4 underline underline-offset-4 text-sm text-primary cursor-pointer select-none"
                                        onClick={async () =>
                                            await handleLinkShare(challengeLink)
                                        }
                                    >
                                        copy challenge link
                                    </p>
                                    <p className="mt-6 text-faded text-xs">
                                        This challenge will expire in{' '}
                                        {pendingChallenge.expiresIn}
                                    </p>
                                </>
                            )}
                        </section>

                        <AnimatePresence 
                            mode="wait"
                            initial={false}
                            onExitComplete={() => null}
                        >
                            {isVisible && (
                                <NotificationCard
                                    type="Success"
                                    text="Successfully copied."
                                    className="fixed bottom-4"
                                    key="notification"
                                />
                            )}
                        </AnimatePresence>
                    </section>
                )}
            </CenteredGrid>
        </ProtectedPage>
    );
}
