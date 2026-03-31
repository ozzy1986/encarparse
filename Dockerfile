FROM node:22-bookworm-slim

ENV NEXT_TELEMETRY_DISABLED=1
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

RUN apt-get update           && apt-get install -y --no-install-recommends ca-certificates openssl           && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci
RUN npx playwright install --with-deps chromium

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start"]
