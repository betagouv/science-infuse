FROM node:22.4

# Create a non-root user
RUN useradd -m appuser

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

# install chrome for selenium
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    curl \
    unzip

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable

# Install ChromeDriver
RUN CHROMEDRIVER_VERSION=131.0.6778.106 \
    && wget -q https://chromedriver.storage.googleapis.com/${CHROMEDRIVER_VERSION}/chromedriver_linux64.zip \
    && unzip chromedriver_linux64.zip \
    && mv chromedriver /usr/local/bin/chromedriver \
    && chmod +x /usr/local/bin/chromedriver \
    && rm chromedriver_linux64.zip

RUN apt-get install -y chromium

COPY package.json ./
COPY package-lock.json ./
COPY .npmrc ./
RUN npm install
ENV PATH /app/node_modules/.bin:$PATH

COPY tsconfig.json ./tsconfig.json
COPY public ./public
COPY src ./src
COPY next.config.mjs ./next.config.mjs
COPY tailwind.config.ts ./tailwind.config.ts
COPY postcss.config.mjs ./postcss.config.mjs
COPY .eslintrc.json ./.eslintrc.json


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
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL

ARG SCW_ACCESS_KEY
ENV SCW_ACCESS_KEY=$SCW_ACCESS_KEY

ARG SCW_SECRET_KEY
ENV SCW_SECRET_KEY=$SCW_SECRET_KEY

ARG SCW_PROJECT_ID
ENV SCW_PROJECT_ID=$SCW_PROJECT_ID

ARG SCW_REGION
ENV SCW_REGION=$SCW_REGION

ARG H5P_URL
ENV H5P_URL=$H5P_URL
ARG MOODLE_NODE_SERVER_URL
ENV MOODLE_NODE_SERVER_URL=$MOODLE_NODE_SERVER_URL
ARG MOODLE_URL
ENV MOODLE_URL=$MOODLE_URL
ARG MOODLE_TOKEN
ENV MOODLE_TOKEN=$MOODLE_TOKEN

ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma client
RUN npx prisma generate

RUN npm run build

# Copy and set permissions for entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Change ownership of the app directory to appuser
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser
RUN npx puppeteer browsers install

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]