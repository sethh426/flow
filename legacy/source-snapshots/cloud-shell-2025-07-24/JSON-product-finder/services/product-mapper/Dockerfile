FROM node:18-slim

WORKDIR /app

# install only prod deps first (leverages layer cache)
COPY package*.json ./
RUN npm install --production

# copy the rest
COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["node","index.js"]
