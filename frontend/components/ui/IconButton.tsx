import spinnerAnimation from '@/animated/spinner.json';
import clsx from 'clsx';
import Lottie from 'lottie-react';

interface IIconButtonProps {
    label: string;
    icon: React.ReactNode;
    secondary: boolean;
    pendingText?: string;
    isDisabled: boolean;
    onClick: () => void;
}

export default function IconButton(props: IIconButtonProps) {
    return (
        <button
            className={clsx(
                'w-full my-2 p-3 rounded-md font-bold hover:opacity-90 transition-all active:scale-[.98] text-xl flex gap-2 items-center justify-center border-2 border-transparent',
                props.secondary ? 'bg-transparent !hover:opacity-100 hover:border-primary hover:bg-base' : 'bg-primary',
                props.isDisabled
                    ? 'disabled:opacity-70 disabled:!scale-100'
                    : ''
            )}
            onClick={props.onClick}
            disabled={props.isDisabled}
        >
            {props.isDisabled ? (
                <div className="w-8 max-w-8 h-8 max-h-8">
                    <Lottie animationData={spinnerAnimation} loop={true} />
                </div>
            ) : (
                <div>{props.icon}</div>
            )}
            <span className="text-white">
                {props.isDisabled && props.pendingText
                    ? props.pendingText
                    : props.label}
            </span>
        </button>
    );
}
