import React from 'react';

interface ICenteredGridProps { 
    children: React.ReactNode;
}

export default function CenteredGrid({ children }: ICenteredGridProps) {
    return <main className="w-full h-[100dvh] grid place-items-center overflow-x-hidden">{children}</main>;
}
