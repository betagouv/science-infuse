FROM node:22.4

WORKDIR /app
RUN mkdir -p /app/public

COPY package.json ./
COPY package-lock.json ./
COPY .npmrc ./
RUN npm install
#RUN npm i -g prisma
ENV PATH /app/node_modules/.bin:$PATH

COPY tsconfig.json ./tsconfig.json
COPY public ./public
COPY src ./src
COPY next.config.mjs ./next.config.mjs
COPY tailwind.config.ts ./tailwind.config.ts
COPY postcss.config.mjs ./postcss.config.mjs
COPY .eslintrc.json ./.eslintrc.json

ARG NEXT_PUBLIC_FILE_SERVER_URL
ENV NEXT_PUBLIC_FILE_SERVER_URL $NEXT_PUBLIC_FILE_SERVER_URL

ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SERVER_URL $NEXT_PUBLIC_SERVER_URL

ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

ARG OLLAMA_URL
ENV OLLAMA_URL $OLLAMA_URL

ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET NEXTAUTH_SECRET

ARG NEXTAUTH_URL
ENV NEXTAUTH_URL NEXTAUTH_URL

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