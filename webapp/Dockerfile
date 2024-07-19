FROM node:21-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install --force

ENV PATH /app/node_modules/.bin:$PATH

COPY tsconfig.json ./
COPY public ./
COPY src ./

ARG NEXT_PUBLIC_FILE_SERVER_URL
ENV NEXT_PUBLIC_FILE_SERVER_URL $NEXT_PUBLIC_FILE_SERVER_URL

ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SERVER_URL $NEXT_PUBLIC_SERVER_URL

ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma client
RUN ls
RUN ls src
RUN ls src/prisma
RUN npx prisma generate

RUN npm run build

EXPOSE 3000

# Use a shell script as entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]