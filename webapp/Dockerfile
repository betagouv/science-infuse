FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Create the public directory
RUN mkdir -p /app/public

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]