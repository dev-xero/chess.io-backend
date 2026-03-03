import { CheckCircle } from '@phosphor-icons/react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

type NotificationCardProps = {
    type: 'Success' | 'Error';
    text: string;
    className?: string;
};

export default function NotificationCard(props: NotificationCardProps) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    duration: 100,
                }}
                style={{ originX: 0.5 }}
                className={clsx(props.className, "w-full flex items-center justify-center")}
            >
                <div
                    className={clsx(
                        'flex gap-2 items-center p-2 rounded-md border-2 border-background bg-opacity-40 w-[220px]',
                        props.type == 'Success'
                            ? '!border-green bg-[#0e2414]'
                            : '!border-[#e0402b] bg-[#140b0a]'
                    )}
                >
                    <CheckCircle size={24} weight="fill" className="text-green" />
                    <span className="text-sm">{props.text}</span>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
