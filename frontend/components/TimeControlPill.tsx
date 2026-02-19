import { TIME_CONTROL } from '@/config/controls';
import clsx from 'clsx';

interface IControl {
    name: string;
    control: TIME_CONTROL;
}

interface ITimeControlPillProps {
    variant: IControl;
    onClick: () => void;
    selected: TIME_CONTROL;
    isDisabled: boolean;
}

export default function TimeControlPill(props: ITimeControlPillProps) {
    return (
        <div
            className={clsx(
                'text-sm w-full flex-grow p-4 border-2 border-base rounded-md bg-base cursor-pointer transition-all font-bold text-center select-none',
                props.selected == props.variant.control
                    ? '!border-primary !bg-base'
                    : 'bg-base',
                props.isDisabled
                    ? 'cursor-default hover:!border-base'
                    : 'hover:border-lighter'
            )}
            onClick={!props.isDisabled ? props.onClick : () => {}}
        >
            {props.variant.control} mins | {props.variant.name}
        </div>
    );
}
