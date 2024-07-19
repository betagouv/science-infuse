FROM node:21-alpine

WORKDIR /app
RUN mkdir -p /app/public

COPY package.json ./
COPY package-lock.json ./
COPY .npmrc ./

COPY . .

RUN npm install --force
RUN npm install prisma -g
RUN npm install  @codegouvfr/react-dsfr --force

ARG NEXT_PUBLIC_FILE_SERVER_URL
ENV NEXT_PUBLIC_FILE_SERVER_URL $NEXT_PUBLIC_FILE_SERVER_URL

ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SERVER_URL $NEXT_PUBLIC_SERVER_URL

ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma client
RUN npx prisma generate

RUN npm run build

EXPOSE 3000

# Use a shell script as entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]