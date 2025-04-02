FROM node:20-alpine

RUN apk update
RUN apk add
RUN apk add ffmpeg

WORKDIR /usr/src/app
COPY src/ src/
COPY tsconfig.json .
COPY package.json .
RUN npm install -g pnpm@latest-10
RUN --mount=type=cache,target=/root/.npm \
    pnpm install


RUN pnpm build
CMD node lib/index.js
