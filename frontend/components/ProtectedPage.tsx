'use client';

import { useAuth } from '@/hooks/useAuth';
import React, { useEffect } from 'react';
import LoadingFragment from '../fragments/LoadingFragment';

interface IProtectedPageProps {
    children: React.ReactNode;
}

export default function ProtectedPage(props: IProtectedPageProps) {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            window.location.href = '/auth/login';
        }
    }, [isAuthenticated, isLoading]);

    if (isLoading) return <LoadingFragment />;
    if (!isAuthenticated) return <></>;
    return <>{props.children}</>;
}
