FROM node:22.4

# Create app directory
WORKDIR /app

# Copy download script first
COPY download-core.sh ./
RUN chmod +x ./download-core.sh
RUN ./download-core.sh 1.27.0 1.25

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Build the app
RUN npm run build

# Start the app
CMD ["npm", "start"]
