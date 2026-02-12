# Build stage
FROM node:lts-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# Runtime stage
FROM node:lts-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/.output .
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts .

ENV NODE_ENV=production

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node server/index.mjs"]