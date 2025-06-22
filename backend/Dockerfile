FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY .env ./
COPY . .
RUN npm install --production
EXPOSE 5000
CMD ["node", "server.js"] 