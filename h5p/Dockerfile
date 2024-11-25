FROM node:18-bullseye

WORKDIR /app

# Create necessary directories
RUN mkdir -p /app/public /app/h5p/libraries /app/h5p/content /app/h5p/temporary-storage

# Set environment variables
ENV PATH /app/node_modules/.bin:$PATH
ENV H5P_DIR=/app/h5p

# Copy project files
COPY H5P-Nodejs-library .

# Install dependencies
RUN npm install
RUN npm run build

# Set proper permissions
RUN chmod -R 755 /app/h5p

EXPOSE 8080

CMD ["npm", "start"]