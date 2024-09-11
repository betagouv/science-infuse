## index data
#### [cite-sante](https://www.cite-sciences.fr/fr/au-programme/lieux-ressources/cite-de-la-sante/une-question-en-sante/questions-sante/toutes-les-questions)
python app/data_indexing/health_questions.py
#### [ressources-juniors](https://www.cite-sciences.fr/fr/ressources/juniors)
python app/data_indexing/ressources_juniors.py
#### [@leblob_fr](https://www.youtube.com/@leblob_fr) | [@citedesscience](https://www.youtube.com/@citedessciences) | [palaisdeladécouverte](https://www.youtube.com/c/palaisdelad%C3%A9couverte)
python app/data_indexing/youtube_videos.py
`/!\ if you get 400 or video require Login error, try setting use_oauth to True. But this require a google account, and access to shell to enter the code.`

#### all pdfs from custom directory (recursive)
python app/data_indexing/pdf_documents.py


### NOTES
Need to use S3 for file storage, but s3 does not provide direct link to see access file.
Need to use `s3_client.generate_presigned_url` with `Key={OBJECT_PATH}` to get a temporary file path
But we don't want links to expire.
So do a nginx / or fastapi route that takes the file_path (OBJECT_PATH) (which is the thing we store in the db) and returns the public path (redirect / pipe ?) created by `s3_client.generate_presigned_url`