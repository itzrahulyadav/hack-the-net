FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

ENV NEXT_TELEMETRY_DISABLED 1

RUN apk add --no-cache bind-tools bash

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]