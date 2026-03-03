interface ISuccessProps {
    msg: string;
}

export default function Success(props: ISuccessProps) {
    return props.msg ? (
        <p className="text-center text-sm text-green-400 my-4">{props.msg}</p>
    ) : (
        <></>
    );
}
