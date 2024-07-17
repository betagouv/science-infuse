FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY .npmrc ./

# Create the public directory
RUN mkdir -p /app/public

RUN npm install --force

COPY . .

ARG NEXT_PUBLIC_FILE_SERVER_URL
ENV NEXT_PUBLIC_FILE_SERVER_URL $NEXT_PUBLIC_FILE_SERVER_URL

ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SERVER_URL $NEXT_PUBLIC_SERVER_URL

ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

ENV NEXT_TELEMETRY_DISABLED 1
RUN npx prisma db push
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]