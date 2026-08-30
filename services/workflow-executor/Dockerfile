FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Copy service account key from parent directory
COPY ../../serviceAccountKey.json ./serviceAccountKey.json

EXPOSE 8080

CMD ["node", "index.js"]
