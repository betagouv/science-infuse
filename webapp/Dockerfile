FROM node:22.4

WORKDIR /app
RUN mkdir -p /app/public

RUN apt-get update && apt-get install -y \
libx11-xcb1 \
libxcb1 \
libxcomposite1 \
libxcursor1 \
libxdamage1 \
libxext6 \
libxi6 \
libxtst6 \
libnss3 \
libcups2 \
libxss1 \
libxrandr2 \
libasound2 \
libatk1.0-0 \
libgtk-3-0 \
libgbm-dev \
libxshmfence1 \
libdrm2


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

ARG NEXT_PUBLIC_WEBAPP_URL
ENV NEXT_PUBLIC_WEBAPP_URL $NEXT_PUBLIC_WEBAPP_URL

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ARG S3_ACCESS_KEY
ENV S3_ACCESS_KEY=$S3_ACCESS_KEY

ARG S3_SECRET_KEY
ENV S3_SECRET_KEY=$S3_SECRET_KEY

ARG S3_ENDPOINT
ENV S3_ENDPOINT=$S3_ENDPOINT

ARG S3_REGION
ENV S3_REGION=$S3_REGION

ARG S3_BUCKET
ENV S3_BUCKET=$S3_BUCKET

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