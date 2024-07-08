## Docker compose services
### weaviate
Weaviate is an open source vector search engine that allows you to store data objects and query them by semantic meaning. It uses machine learning models to create vector embeddings of your data and can find similar objects based on their vector representations.

### t2v-custom
text-to-vec, custom embeddings model (solon) to create vector embeddings of the text of the database


### weaviate-console
Run weaviate console to query data using GraphQL (debugging purpose)

### nginx
used as an efficient way to serve stored files in folder documents (raw documents indexed by weaviate)

### webapp
A NextJS client to query the database

### server *
A Python3 / FastAPI server to handle database queries


### ftp_processing *
A Python3 script that listens to file writes in `ftp-data` (see ftp section), and index them using Machine Learning technics.

### ftp
A ftp server that write files to `ftp-data`

**\*** These services use the same Docker image, but with different entry points.

