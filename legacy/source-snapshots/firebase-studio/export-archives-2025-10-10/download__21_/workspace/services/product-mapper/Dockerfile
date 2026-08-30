# Use the official Node.js 18 image as a base.
# Using a specific version is good practice for reproducibility.
FROM node:18-slim

# Set the working directory in the container.
WORKDIR /usr/src/app

# Install Playwright's system-level dependencies.
# This is a crucial step for Playwright to work in a container.
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json (if available).
COPY package*.json ./

# Install application dependencies.
RUN npm install

# Copy the rest of the application's source code.
COPY . .

# Install Playwright's browsers.
RUN npx playwright install --with-deps

# The service will listen on the port defined by the
# PORT environment variable, which is automatically set by Cloud Run.
# We'll default to 8080 if it's not set.
ENV PORT 8080
EXPOSE 8080

# The command to run the service.
# This uses the Google Cloud Functions Framework to start the server.
CMD ["npm", "start"]
