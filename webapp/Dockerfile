FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY .npmrc ./

# Create the public directory
RUN mkdir -p /app/public

# Debug: List contents before npm install
RUN echo "Contents of /app before npm install:" && ls -la /app

# Verbose npm install
RUN npm install --force --verbose

# Debug: List contents after npm install
RUN echo "Contents of /app after npm install:" && ls -la /app
RUN echo "Contents of /app/node_modules (if it exists):" && ls -la /app/node_modules || echo "node_modules does not exist"

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

# Add debugging information
RUN echo "Node version: $(node -v)"
RUN echo "NPM version: $(npm -v)"
RUN echo "PATH: $PATH"
RUN npm ls @codegouvfr/react-dsfr
RUN ls -la /app/node_modules/.bin || echo "/app/node_modules/.bin does not exist"
RUN which only-include-used-icons || echo "only-include-used-icons not found in PATH"

ENV PATH /app/node_modules/.bin:$PATH

# Try to run the script directly
RUN /app/node_modules/.bin/only-include-used-icons || echo "Failed to run only-include-used-icons directly"

RUN npm run build

EXPOSE 3000

# Use a shell script as entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]