import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";

export default function BreadcrumbNoLink(props: { list: string[], className?: string }) {
    const last = props.list.pop();
    return (
        <Breadcrumb
            className={props.className}
            currentPageLabel={last}
            segments={props.list.map(elem => ({
                label: elem,
                linkProps: {
                    href: ''
                }
            }))}
        />
    )
}
