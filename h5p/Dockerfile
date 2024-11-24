FROM node:22.4

WORKDIR /app
RUN mkdir -p /app/public

ENV PATH /app/node_modules/.bin:$PATH

COPY H5P-Nodejs-library .

RUN npm install

EXPOSE 8080

CMD ["npm", "start"]