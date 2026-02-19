import Lottie from 'lottie-react';
import ChessIO from '../components/ChessIO';
import spinnerAnimation from '@/animated/spinner.json';

export default function LoadingFragment() {
    return (
        <section className="w-screen h-[100dvh] grid grid-cols-1 place-items-center">
            <div className="flex flex-col gap-8 items-center justify-center">
                <ChessIO />
                <h1 className="flex gap-2 items-center">
                    <div className="w-8 max-w-8 h-8 max-h-8">
                        <Lottie animationData={spinnerAnimation} loop={true} />
                    </div>
                    <span>Just a moment</span>
                </h1>
            </div>
        </section>
    );
}
