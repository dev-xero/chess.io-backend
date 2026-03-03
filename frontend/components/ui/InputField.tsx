import React from 'react';
import clsx from 'clsx';

interface IInputFieldProps {
    name: string;
    icon: React.ReactNode;
    placeholder: string;
    text: string;
    onChange: (text: string) => void;
    type: 'text' | 'password';
}

export default function InputField(props: IInputFieldProps) {
    return (
        <div className="w-full relative">
            <input
                name={props.name}
                placeholder={props.placeholder}
                value={props.text}
                onChange={(ev) => props.onChange(ev.target.value)}
                className={clsx(
                    'w-full px-4 py-2 rounded-md bg-base outline-none border-2 border-lighter text-foreground focus:border-primary transition-all',
                    props.icon ? 'pl-10' : ''
                )}
                type={props.type}
            />
            <div className="text-primary absolute left-2 top-1/2 -translate-y-1/2">
                {props.icon}
            </div>
        </div>
    );
}
