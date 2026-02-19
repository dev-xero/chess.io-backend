import Image from 'next/image';

export default function ChessIO() {
    return (
        <Image
            width={140}
            height={24}
            src="/monochrome.svg"
            alt="chess.io"
            className="mb-2 select-none"
            priority={true}
        />
    );
}
