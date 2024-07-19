FROM node:22-alpine

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./
COPY .npmrc ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application code
COPY . .

# Set environment variables
ARG NEXT_PUBLIC_FILE_SERVER_URL
ENV NEXT_PUBLIC_FILE_SERVER_URL $NEXT_PUBLIC_FILE_SERVER_URL

ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SERVER_URL $NEXT_PUBLIC_SERVER_URL

ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

ENV NEXT_TELEMETRY_DISABLED 1

# Install global dependencies
RUN npm i -g prisma

# Generate Prisma client
RUN npx prisma generate

# Add node_modules/.bin to PATH
ENV PATH /app/node_modules/.bin:$PATH

# Debug information
RUN echo "Node version: $(node -v)"
RUN echo "NPM version: $(npm -v)"
RUN echo "PATH: $PATH"
RUN npm ls @codegouvfr/react-dsfr
RUN ls -la /app/node_modules/.bin

# Build the application
RUN npm run build

EXPOSE 3000

# Use a shell script as entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]