FROM node:22.4

WORKDIR /app
RUN mkdir -p /app/public

ENV PATH /app/node_modules/.bin:$PATH

COPY H5P-Nodejs-library .
# RUN cd packages/h5p-examples && ./download-core.sh 1.27.0

RUN npm install
# RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]