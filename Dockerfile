FROM node:20-alpine

RUN apk update
RUN apk add
RUN apk add ffmpeg

WORKDIR /usr/src/app
COPY src/ src/
COPY tsconfig.json .
COPY package.json .
RUN npm install -g corepack
RUN --mount=type=cache,target=/root/.npm \
    yarn install

CMD yarn production
