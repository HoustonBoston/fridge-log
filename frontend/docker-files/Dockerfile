FROM oven/bun:latest

WORKDIR /app

COPY ../* .

EXPOSE 3000
RUN bun install
RUN bun run build

ENTRYPOINT ["bun", "run", "start"]
