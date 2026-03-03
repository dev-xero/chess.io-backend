'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

interface ChessClockProps {
    timeLimit: number;
    currentTime: number;
    label: string;
    shouldPause: boolean;
    onTimeElapsed: () => void;
    onTick: (ms: number) => void;
}

export default function ChessClock({
    timeLimit,
    currentTime,
    label,
    shouldPause,
    onTimeElapsed,
    onTick,
}: ChessClockProps) {
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
    const remainingTimeRef = useRef<number>(currentTime);
    const [displayTime, setDisplayTime] = useState(currentTime);
    const [isClient, setIsClient] = useState(false);

    // Format time into MM:SS.d
    const formatTime = (ms: number): string => {
        const totalSeconds = Math.max(0, Math.floor(ms / 1000));
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60);
        const decisecond = Math.floor((ms % 1000) / 100);

        return `${minutes}:${seconds
            .toString()
            .padStart(2, '0')}.${decisecond}`;
    };

    const updateTimer = () => {
        remainingTimeRef.current -= 100;

        setDisplayTime(remainingTimeRef.current);
        onTick(remainingTimeRef.current);

        if (remainingTimeRef.current <= 0) {
            onTimeElapsed();
            stopTimer();
        }
    };

    // Ticks every 100ms
    const startTimer = () => {
        if (!intervalIdRef.current) {
            intervalIdRef.current = setInterval(updateTimer, 100);
        }
    };

    const stopTimer = () => {
        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }
    };

    useEffect(() => {
        if (shouldPause) stopTimer();
        else startTimer();

        return stopTimer;
    }, [shouldPause]);

    // Sync with external time updates from server
    useEffect(() => {
        remainingTimeRef.current = currentTime;

        setDisplayTime(currentTime);
    }, [currentTime]);

    useEffect(() => setIsClient(true), []);

    const timeDisplay = isClient
        ? formatTime(displayTime)
        : formatTime(timeLimit);

    return (
        <section className="w-full py-2 rounded-md font-bold text-2xl text-center sm:text-left">
            <p className="font-bold text-xs text-faded mb-1">
                {label.toUpperCase()}
            </p>
            <h2
                className={clsx(
                    'text-3xl transition-all',
                    shouldPause ? 'opacity-60' : 'opacity-100'
                )}
            >
                {timeDisplay}
            </h2>
        </section>
    );
}
