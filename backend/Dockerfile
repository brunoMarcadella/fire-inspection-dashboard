FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
RUN npm ci --ignore-scripts
RUN npx prisma generate

COPY src ./src
EXPOSE 3000
