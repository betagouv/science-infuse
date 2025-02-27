# Science Infuse
Le projet [Science Infuse](https://science-infuse.beta.gouv.fr/) a pour but d'accompagner le corps enseignant dans la création de contenus pédagogiques scientifiques
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
        s3[S3 Storage]
        groq[Groq API]
        youtube_api[YouTube API]
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

## Installation et utilisation
This monorepo is managed by docker compose, have it installed and run 
```
docker compose up --build
```
then open your favorite web browser and go to [http://localhost:3000](http://localhost:3000)

### postgres

using postgres as a SQL database, and as a vector database using pgvector

since vector is not supported by prisma, we need to do things behind his back...
to prevent prisma drift, we have to remove index (which are not supported for vectors) before doing the db migration and re-crate them after the migration with this command:
```
SET maintenance_work_mem TO '2GB';
CREATE INDEX idx_document_chunk_text_embedding 
ON "DocumentChunk" USING hnsw ("textEmbedding" vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```


### webapp
A NextJS client to query the database

### server *
TODO: becomes processing
A Python3 / FastAPI server to handle database queries


### ftp_processing *
A Python3 script that listens to file writes in `ftp-data` (see ftp section), and index them using Machine Learning technics.

### ftp
A ftp server that write files to `ftp-data`

**\*** These services use the same Docker image, but with different entry points.

