FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Create the public directory
RUN mkdir -p /app/public

RUN npm install

COPY . .

ARG NEXT_PUBLIC_FILE_SERVER_URL
ENV NEXT_PUBLIC_FILE_SERVER_URL $NEXT_PUBLIC_FILE_SERVER_URL

ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SERVER_URL $NEXT_PUBLIC_SERVER_URL

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]