TODO

```bash
./download-core.sh 1.27.0 1.25

# run dev
env $(grep -v '^#' ../.env | xargs) npm run build; env $(grep -v '^#' ../.env | xargs) npm run start

```

1.27.0 being last h5p-php-library https://github.com/h5p/h5p-php-library/tags
1.25 being last h5p-editor-php https://github.com/h5p/h5p-editor-php-library/tags