# Build stage
FROM node:23-slim AS builder

WORKDIR /app

# Environment setup for build
ENV NODE_ENV=development
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install pnpm
RUN corepack prepare pnpm@latest --activate

# Copy package.json and lockfile
COPY package.json pnpm-lock.yaml ./

RUN pnpm i --shamefully-hoist --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm run build

#################################################
# Production stage
FROM node:23-slim AS runner

WORKDIR /app

# Environment setup for production
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install pnpm
RUN corepack prepare pnpm@latest --activate

# Copy necessary files from builder stage
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/prisma ./prisma

# Install only production dependencies
RUN pnpm install --prod

# Set environment variables
ENV PORT=3000

# Expose port
EXPOSE 3000

# Run the application
CMD ["node", ".output/server/index.mjs"]