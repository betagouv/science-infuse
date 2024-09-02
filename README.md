## Docker compose services
### postgres
using postgres as a SQL database, and as a vector database using pgvector

### t2v-custom
TODO: remove
text-to-vec, custom embeddings model (solon) to create vector embeddings of the text of the database

### nginx
used as an efficient way to serve stored files in folder documents (raw documents indexed by weaviate)

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

