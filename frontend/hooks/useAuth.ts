'use client';

import { keys } from '@/config/keys';
import { hasCookie } from 'cookies-next';
import { useEffect, useState } from 'react';

const checkSession = () => {
    return hasCookie(keys.auth) && localStorage.getItem(keys.user) != null;
};

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = () => {
            setTimeout(() => {
                setIsAuthenticated(checkSession());
                setIsLoading(false);
            }, 1000);
        };
        checkAuthStatus();
    }, []);

    return { isAuthenticated, isLoading };
};
