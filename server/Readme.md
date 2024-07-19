## Build the custom text2vec
follow https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers#build-a-model

commands

```sh
# if using solon embeddings
docker build -f solon.Dockerfile -t solon-inference .

docker compose up
```

## apply migrations
After runing the app (main.py) from docker or from cli to create the first database object, we can run the migrations.

```sh
python app/migration.py migrate
```

## create new migration
```sh
python app/migration.py create migration_name
```

## index data
#### [cite-sante](https://www.cite-sciences.fr/fr/au-programme/lieux-ressources/cite-de-la-sante/une-question-en-sante/questions-sante/toutes-les-questions)
python app/data_indexing/health_questions.py
#### [ressources-juniors](https://www.cite-sciences.fr/fr/ressources/juniors)
python app/data_indexing/ressources_juniors.py
#### [@leblob_fr](https://www.youtube.com/@leblob_fr) | [@citedesscience](https://www.youtube.com/@citedessciences) | [palaisdeladécouverte](https://www.youtube.com/c/palaisdelad%C3%A9couverte)
python app/data_indexing/youtube_videos.py
#### all pdfs from custom directory (recursive)
python app/data_indexing/pdf_documents.py

## backup data
```python
from SIWeaviateClient import SIWeaviateClient
with SIWeaviateClient() as client:
    result = client.backup.create(
        backup_id="my-backup-id",
        backend="filesystem",
        include_collections=["Document", "DocumentChunk"],
        wait_for_completion=True,
    )
```

## restore data
```python
client.collections.delete("Document")
client.collections.delete("DocumentChunk")
result = client.backup.restore(
    backup_id="my-backup-id",
    backend="filesystem",
    wait_for_completion=True,
)
```

### NOTES
Need to use S3 for file storage, but s3 does not provide direct link to see access file.
Need to use `s3_client.generate_presigned_url` with `Key={OBJECT_PATH}` to get a temporary file path
But we don't want links to expire.
So do a nginx / or fastapi route that takes the file_path (OBJECT_PATH) (which is the thing we store in the db) and returns the public path (redirect / pipe ?) created by `s3_client.generate_presigned_url`