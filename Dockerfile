# ── MBXchange production image ─────────────────────────────────────────
# Multi-stage: build the Vite frontend + bundle the API, run on slim Node.
# The single container serves both the REST API and the static frontend.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Only production dependencies (the API bundle keeps native/runtime deps external)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server

# Run as non-root
RUN addgroup -S mbx && adduser -S mbx -G mbx && chown -R mbx:mbx /app
USER mbx

ENV API_PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:8080/api/health || exit 1

CMD ["node", "dist-server/index.js"]
