FROM semitechnologies/transformers-inference:custom
RUN USE_SENTENCE_TRANSFORMERS_VECTORIZER=true MODEL_NAME=OrdalieTech/Solon-embeddings-base-0.1 ./download.py