# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY .env ./
COPY public ./public
COPY src ./src
RUN npm install && npm run build

# Stage 2: Serve
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/build ./build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"] 