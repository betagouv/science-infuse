## Build the custom text2vec
follow https://weaviate.io/developers/weaviate/modules/retriever-vectorizer-modules/text2vec-transformers#build-a-model

commands

```sh
# if using solon embeddings
docker build -f solon.Dockerfile -t solon-inference .

docker compose up
python app/main.py
```

## index data
### index cite-sante
python app/data_indexing/health_questions.py
python app/data_indexing/ressources_juniors.py
python app/data_indexing/youtube_videos.py


### NOTES
Need to use S3 for file storage, but s3 does not provide direct link to see access file.
Need to use `s3_client.generate_presigned_url` with `Key={OBJECT_PATH}` to get a temporary file path
But we don't want links to expire.
So do a nginx / or fastapi route that takes the file_path (OBJECT_PATH) (which is the thing we store in the db) and returns the public path (redirect / pipe ?) created by `s3_client.generate_presigned_url`