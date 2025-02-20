import React from "react";
import Image from 'next/image';
import styled from "@emotion/styled";
import Card from "@codegouvfr/react-dsfr/Card";
import Button from "@codegouvfr/react-dsfr/Button";

const StyledCard = styled(Card)`
    height: 100%;
    display: flex;
    flex-direction: column;

    border-bottom: 3px solid black;

    .fr-card__body {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .fr-card__img {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: 2rem;
        height: 100px;
    }
    
    .fr-card__title {
        display: flex;
        align-items: center;
        text-align: center;
        justify-content: center;
        font-size: 1.125rem;
        min-height: 4rem;
        margin-bottom: 0rem;
    }

    .fr-card__desc {
        flex: 1;
        display: flex;
        align-items: flex-start;
    }
`;

const CardContainer = styled.div`
    display: flex;
    gap: 2rem;
    /* max-width: 1200px; */
    margin: 0 auto;
    padding: 0;

    @media (max-width: 1024px) {
        flex-direction: column;
        align-items: center;
    }
`;

const CardWrapper = styled.div`
    flex: 1;
    /* min-width: 300px; */
    /* max-width: 360px; */
    width: 100%;
`;

export default function AlignedCards() {
    const cards = [
        {
            title: "Génération automatique de quiz par IA",
            image: <Image
                src="/images/community.svg"
                height={80}
                width={80}
                alt="Génération de quiz"
                className="object-contain mix-blend-multiply"
            />,
            content: "Créez des quiz pertinents en un clic. Notre IA analyse vos contenus et génère automatiquement des questions pour stimuler la participation de vos élèves."
        },
        {
            title: "Cours « prêts à personnaliser »",
            image: <Image
                src="/images/book.svg"
                height={80}
                width={80}
                alt="Cours personnalisables"
                className="object-contain mix-blend-multiply"
            />,
            content: "Gagnez du temps avec nos cours clés en main. Accédez à un catalogue de contenus validés par des enseignants de SVT, et adaptez-les facilement à vos besoins."
        },
        {
            title: "Export vers votre Environnement Numérique de Travail",
            image: <Image
                src="/images/ecosystem.svg"
                height={80}
                width={80}
                alt="Export ENT"
                className="object-contain mix-blend-multiply"
            />,
            content: "Intégrez facilement vos contenus à votre ENT. Exportez en quelques clics vers les formats standards (H5P, PDF, MP4...) compatibles avec tous les environnements numériques."
        },
    ];

    return (
        <div style={{
            background: "linear-gradient(135.4deg, #f5f5fe 0%, #e3e3fd 99.31%)"
        }} className="w-full m-0 fr-grid-row fr-grid-row--gutters fr-grid-row--center bg-[#f6f6f6] py-16">
            <div className="fr-col-12 fr-col-md-9 main-content-item">
                <div className="flex flex-col items-center">
                    <h2 className="text-[40px]font-bold m-0 text-center text-[#161616]">
                        Des cours captivants grâce aux autres services d’Ada
                    </h2>

                    <div className="w-full py-16">
                        <CardContainer>
                            {cards.map((card, index) => (
                                <CardWrapper key={index}>
                                    <StyledCard
                                        background
                                        border
                                        desc={card.content}
                                        imageComponent={card.image}
                                        size="small"
                                        title={card.title}
                                        titleAs="h3"
                                    />
                                </CardWrapper>
                            ))}
                        </CardContainer>
                    </div>
                    <Button
                        className="w-full justify-center md:w-auto"
                        linkProps={{
                            href: "/catalogue/all",
                        }}
                        priority="secondary">Accéder au catalogue de cours</Button>

                </div>

            </div>
        </div>
    );
}