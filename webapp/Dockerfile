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

RUN npm i -g prisma
# Generate Prisma client
RUN npx prisma generate
# List files in the current directory
RUN ls -la

RUN npm run build

EXPOSE 3000

# Use a shell script as entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]