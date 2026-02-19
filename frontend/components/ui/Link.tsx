interface ILinkProps {
    href: string;
    label: string;
    external: boolean;
}

export default function Link(props: ILinkProps) {
    return (
        <a
            href={props.href}
            className="text-sm text-faded hover:underline underline-offset-4 hover:text-foreground"
            target={props.external ? '_blank' : '_self'}
        >
            {props.label}
        </a>
    );
}
