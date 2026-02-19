import Image from 'next/image';

export default function Marker() {
    return (
        <>
            <Image
                width={128}
                height={128}
                src="/marker.svg"
                alt=""
                className="absolute top-[32px] left-[32px] -translate-x-1/2 -translate-y-1/2 z-[-99] select-none"
            />
            <Image
                width={128}
                height={128}
                src="/marker.svg"
                alt=""
                className="absolute bottom-[24px] right-[24px] translate-x-1/2 translate-y-1/2 z-[-99] select-none"
            />
        </>
    );
}
