import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'ChessIO | Challenge and Play Others!',
    description: 'ChessIO is a hobby 1v1 chess challenge web app for friends.',
    openGraph: {
        title: 'ChessIO | Challenge and Play Others!',
        description:
            'ChessIO is a hobby 1v1 chess challenge web app for friends.',
        locale: 'en_US',
        type: 'website',
        images: {
            url: 'https://chessio.vercel.app/og.png',
            width: 1200,
            height: 630,
        },
    },
    metadataBase: new URL('https://chessio.vercel.app'),
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased`}>{children}</body>
        </html>
    );
}
