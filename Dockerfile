FROM node:latest
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

ENV COREPACK_INTEGRATY_KEYS=0
RUN corepack enable

RUN apt-get update -y

COPY . /app
WORKDIR /app

EXPOSE 9876

RUN pnpm install --force

ENV NODE_ENV=production

CMD ["pnpm", "start"]