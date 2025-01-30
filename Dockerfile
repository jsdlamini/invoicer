# syntax=docker.io/docker/dockerfile:1

# Stage 1: Base image with system dependencies
FROM node:18-alpine AS base
RUN apk add --no-cache openssl openssl-dev
RUN npm install -g corepack
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
COPY prisma/ ./prisma/

# Install dependencies including Prisma
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Stage 3: Build application
FROM base AS builder
WORKDIR /app

# Copy dependencies first
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Generate Prisma Client inside node_modules
RUN npx prisma generate

# Copy application source
COPY . .

# Build application
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  elif [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Stage 4: Final production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary dependencies for production
COPY --from=builder --chown=nextjs:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma /app/prisma
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Ensure Prisma Client works in production
ENV PRISMA_GENERATE_SKIP=true

USER nextjs
EXPOSE 3006
ENV PORT=3006 HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
