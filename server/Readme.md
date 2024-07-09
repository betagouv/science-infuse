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