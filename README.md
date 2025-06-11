# Ada – Votre copilote pédagogique assisté par l'intelligence artificielle

Conçue pour faire gagner du temps aux enseignants, engager les élèves et valoriser le potentiel des ressources scientifiques existantes, **Ada est votre copilote pédagogique assisté par l'intelligence artificielle.**

**Explorez dès aujourd'hui des milliers de contenus et d'actualités scientifiques vérifiés !**

Ada vous donne accès à une vaste bibliothèque de ressources produites par **Universcience** (la Cité des sciences et de l'industrie et le Palais de la découverte).

Vous y trouverez notamment les vidéos captivantes de notre chaîne d'actualité scientifique [leblob.fr](https://leblob.fr/), des expériences interactives, des infographies et de nombreux autres formats multimédias de qualité.

Bien qu'elle propose déjà des cours de SVT (cycle 4), le véritable intérêt d'Ada réside dans sa capacité à vous aider à dénicher des **contenus inédits**, à les **rendre interactifs** et à les adapter précisément pour vos élèves, quelle que soit votre discipline. Nous comptons sur vous, enseignants, pour enrichir la plateforme avec des cours variés et adaptés à vos matières. Plus vous serez nombreux à publier, plus l'outil sera utile à tous !

## Découvrez les atouts d'Ada

Ada met la puissance de l'intelligence artificielle et la richesse des contenus scientifiques au service de votre pédagogie :

- **Recherche intelligente**

Accédez facilement à des milliers de contenus scientifiques Universcience grâce à une intelligence artificielle sémantique qui comprend vos intentions de recherche, simplifiant ainsi l'accès aux ressources multimédias.

- **Création simplifiée**

Générez en un clin d'œil des vidéos interactives, des quiz et des cours personnalisés à partir de contenus existants ou des vôtres.

- **Export compatible**

Exportez vos créations dans différents formats compatibles avec les ENT : **H5P**, **MBZ** ou **HTML**, pour une intégration fluide dans votre environnement numérique de travail.

## Pourquoi contribuer à Ada ?

Ada est une plateforme collaborative qui vit et s'enrichit grâce à l'apport de sa communauté pédagogique. Chaque contribution rend l'outil plus pertinent et utile pour tous. En partageant vos cours et vos ressources, vous participez activement à construire un outil au service de l'éducation, conçu par des enseignants pour des enseignants.

## Testez Ada dès maintenant

Curieux de voir Ada en action ? Vous pouvez accéder à une démonstration de l’outil ici :
[https://ada.beta.gouv.fr/](https://ada.beta.gouv.fr/)

## Vos retours sont essentiels

Ada est en constante évolution, et vos retours sont une source d'inspiration précieuse. En nous partageant votre expérience, vous aidez à orienter les prochaines évolutions de manière concrète et utile. Quelques minutes suffisent pour faire la différence !

[Remplir le formulaire de retours (2 min)](https://forms.office.com/e/W5AvbapPWF)

## Contact

olivier.rabet@universcience.fr

---

**Ada est une initiative d'Universcience et du ministère de la culture dans le cadre d'un appel à projet**

Cette plateforme est vouée à une **pérennité durable** et continue d'évoluer grâce à une collaboration étroite avec la communauté éducative.

Vos retours sont essentiels et nourrissent directement nos développements.

Merci pour votre participation !

---

## Aspect technique
<details>
<summary>
Dépliez pour voir la documentation technique
</summary>

### Lien vers la docuumentation technique

[Documentation technique](https://documentation.science-infuse.beta.gouv.fr/)

### Schema de l'architecture
```mermaid
%%{
  init: {
    "flowchart": {"defaultRenderer": "elk"},
    'theme': 'base',
    'themeVariables': {
      'primaryColor': '#BB2528',
      'primaryTextColor': '#000',
      'primaryBorderColor': '#7C0000',
      'lineColor': '#ff0000',
      'secondaryColor': '#006100',
      'tertiaryColor': '#fff'
    }
  }
}%%

flowchart TB
    %% Main components stacked vertically for better clarity
    webapp[WebApp<br>Next.js] <--> processing_microservice

    %% Processing API with AI Models as a combined group
    subgraph processing_microservice[Python Server]
        direction TB
        server[Processing Service / API]

        subgraph AI[AI Models running locally]
            direction TB
            whisper[<a target='_blank' href='https://github.com/openai/whisper'>Whisper<br>Speech Recognition</a>]
            florence[<a target='_blank' href='https://huggingface.co/microsoft/Florence-2-large-ft'>Florence-2<br>Image Analysis</a>]
            translation[<a target='_blank' href='https://huggingface.co/Areeb123/En-Fr_Translation_Model'>Areeb123/En-Fr<br>Translation Model</a>]
            surya[<a target='_blank' href='https://github.com/VikParuchuri/surya'>Surya<br>PDF Structure Analysis</a>]
            solon[<a target='_blank' href='https://huggingface.co/OrdalieTech/Solon-embeddings-base-0.1'>Solon<br>French Text Embeddings</a>]
        end

        server --> AI
    end

    %% Storage Services section
    subgraph "Storage Services"
        direction TB
        postgres[(PostgreSQL<br>Vector Database)]
        mariadb[(MariaDB<br>Moodle Database)]
    end


    %% Ollama as separate service
    subgraph ollama_microservice[Ollama Service]
        ollama[<a target='_blank' href='https://ollama.com/'>Ollama LLM Service<br>GPU-Accelerated</a>]
        llama[<a target='_blank' href='https://huggingface.co/meta-llama/Llama-3.1-8B'>LLaMa 3.1:8b<br>Text Generation</a>] --> ollama
    end
    %% External components with a parent node for external services
    subgraph external_services[External Services]
        direction TB
        s3[S3 Storage<br>OVH]
        groq["Groq API<br>(<a href='https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md' target='blank'>llama-3.3-70b-versatile)</a>"]
        youtube_api[YouTube<br>API]
    end

    %% YouTube Token Generator as micro-service
    youtube_token[YouTube Token<br>Generator]


    %% Educational Platform with merged Moodle
    subgraph education_platforms[Educational Platform]
        direction TB
        moodle[Moodle LMS<br>with Node Server]
        h5p[H5P<br>Interactive Content]
    end


    %% Connections reorganized for clarity
    webapp <--> postgres
    webapp <--> s3
    webapp <--> groq
    webapp <--> education_platforms

    youtube_api <--> server

    processing_microservice <--> ollama_microservice


    youtube_token <--> server

    h5p <--> s3
    moodle <--> mariadb

    classDef storage fill:#f9f,stroke:#333,stroke-width:2px
    classDef ai fill:#bbf,stroke:#333,stroke-width:2px
    classDef web fill:#bfb,stroke:#333,stroke-width:2px
    classDef edu fill:#fbf,stroke:#333,stroke-width:2px
    classDef backend fill:#fbb,stroke:#333,stroke-width:2px
    classDef external fill:#ff9,stroke:#333,stroke-width:2px
    classDef aimodel fill:#9cf,stroke:#333,stroke-width:2px
    classDef ollama fill:#d4a3ff,stroke:#333,stroke-width:2px
    classDef microservice fill:#fbb,stroke:#333,stroke-width:2px
    classDef processing_microservice fill:#fbf,stroke:#333,stroke-width:2px

    class postgres,mariadb storage
    class server backend
    class webapp, web
    class moodle,h5p edu
    class youtube_api,scw,groq,s3 external
    class whisper,florence,translation,surya,solon,llama aimodel
    class ollama ollama
    class youtube_token microservice
    class AI ai
    class processing_microservice processing_microservice

```

### Matrice de communication

| Source                  | Destination               | Protocol       | Port       | Type     |
| ----------------------- | ------------------------- | -------------- | ---------- | -------- |
| WebApp                  | Python processing / API   | HTTPS          | 443        | Internal |
| WebApp                  | PostgreSQL Vector DB      | PostgreSQL/TCP | 5432       | Internal |
| WebApp                  | S3 Storage (OVH)          | HTTPS          | 443        | External |
| WebApp                  | Groq API                  | HTTPS          | 443        | External |
| WebApp                  | Moodle LMS                | HTTP           | 8008, 8009 | Internal |
| WebApp                  | H5P                       | HTTPS          | 443        | External |
| WebApp                  | H5P                       | HTTP           | 8006       | Internal |
| Python processing / API | AI Models running locally | Internal       | N/A        | Internal |
| Python processing / API | Ollama Service            | HTTP           | 11434      | Internal |
| Python processing / API | YouTube API               | HTTPS          | 443        | External |
| Python processing / API | YouTube Token Generator   | HTTP           | 80         | Internal |
| Python processing / API | S3 Storage (OVH)          | HTTPS          | 443        | External |
| Moodle LMS              | MariaDB                   | SQL            | 3306       | Internal |
| H5P                     | S3 Storage (OVH)          | HTTPS          | 443        | External |

## Installation et utilisation

This monorepo is managed by docker compose, have it installed and run

```
docker compose up --build
```

then open your favorite web browser and go to [http://localhost:3000](http://localhost:3000)

</details>
