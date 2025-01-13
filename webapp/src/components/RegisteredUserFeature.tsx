import Button from "@codegouvfr/react-dsfr/Button"
import CallOut from "@codegouvfr/react-dsfr/CallOut"
import styled from "@emotion/styled"

const StyledCallout = styled(CallOut)`
    .fr-callout__text {
        display: flex;
        flex-flow: column;
    }
`
export default (props: {message?: React.ReactNode}) => {
    return   <StyledCallout
    iconId="ri-information-line"
    className="flex flex-col [&.fr-callout__text]:flex-col"
>
    <span>
        {props.message || "Vous devez vous connecter pour accéder à ce contenu."}
    </span>
    <span className="flex flex-row gap-4">
        <Button priority="secondary"><a href="/connexion">Connexion</a></Button>
        <Button><a href="/connexion">Créer un compte</a></Button>
    </span>
</StyledCallout>
}