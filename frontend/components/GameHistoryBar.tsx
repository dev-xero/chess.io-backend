import clsx from 'clsx';
import Image from 'next/image';

interface IGameHistoryBar {
    moveHistoryPairs: string[][];
    whoseTurn: 'w' | 'b';
}

export default function GameHistoryBar(props: IGameHistoryBar) {
    return (
    <aside className="col-span-1 order-3">
            <section className=" bg-base rounded-md p-2">
                <h3 className="text-lg font-bold text-center">Move History</h3>
                <ul className="flex md:flex-col gap-2 md:h-[360px] max-h-[360px] overflow-x-auto md:overflow-y-auto py-2">
                    {props.moveHistoryPairs.length > 0 ? (
                        props.moveHistoryPairs.map((movePair, idx) => {
                            return (
                                <li
                                    key={idx}
                                    className="md:grid grid-cols-5"
                                >
                                    <span className="col-span-1 text-primary">
                                        {idx + 1}.
                                    </span>
                                    <span className="col-span-2 font-bold">
                                        {movePair[0]}
                                    </span>
                                    <span className="col-span-2 font-bold">
                                        {movePair[1] ?? ''}
                                    </span>
                                </li>
                            );
                        })
                    ) : (
                        <li className="text-center">No History</li>
                    )}
                </ul>
            </section>
            <section className="mt-2 rounded-md p-2 bg-base w-full h-[128px] flex items-center justify-center">
                <h3 className="flex items-center gap-2">
                    <Image
                        src="/pieces/wK.png"
                        alt=""
                        width={64}
                        height={64}
                        priority={true}
                        className={clsx(props.whoseTurn == 'b' ? 'invert' : '')}
                    />
                    <div>
                        <p
                            className={clsx(
                                'font-bold text-xl',
                                props.whoseTurn == 'w'
                                    ? 'text-white'
                                    : 'text-foreground'
                            )}
                        >
                            {props.whoseTurn == 'w' ? 'White' : 'Black'}&apos;s
                            Turn
                        </p>
                        <p className="text-faded text-sm">
                            Find the best move and play calmly.
                        </p>
                    </div>
                </h3>
            </section>
        </aside>
    );
}
