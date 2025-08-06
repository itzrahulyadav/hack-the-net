FROM node:22-alpine AS builder
WORKDIR /app


RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile --prod

COPY . .
RUN pnpm run build


FROM node:22-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# --- INSTALL PACKAGES ---
# Install 'dig' (from bind-tools) and bash before creating the non-root user.
# --no-cache avoids storing the package index, keeping the image small.
RUN apk add --no-cache bind-tools bash

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary standalone output files from the builder stage
# These folders are created by the `output: 'standalone'` option
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

EXPOSE 3000
ENV PORT 3000

# The standalone output creates a minimal server.js file to run the app
CMD ["node", "server.js"]