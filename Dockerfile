FROM node:20-alpine

RUN apk update
RUN apk add
RUN apk add ffmpeg

WORKDIR /usr/src/app
COPY src/ src/
COPY tsconfig.json .
COPY package.json .
RUN --mount=type=cache,target=/root/.npm \
    npm install


RUN npm run build
CMD node lib/index.js