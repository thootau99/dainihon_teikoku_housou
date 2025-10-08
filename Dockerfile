# ビルド用
FROM node:20-alpine AS builder

RUN apk update && apk add ffmpeg --no-cache

WORKDIR /usr/src/app

## COPYコマンドをまとめてイメージのレイヤーを減らす
COPY tsconfig.json package.json ./
RUN npm install -g corepack @vercel/ncc && \
    npm i

## node_modules などを一つのJSに格納する
COPY src/ src/
COPY types/ types/
RUN echo 'declare module "tiktok-tts";' > ./node_modules/tiktok-tts/index.d.ts
RUN ncc build src/index.ts -o dist/

# プロダクション用
FROM node:20-alpine AS production
RUN apk update && apk add ffmpeg --no-cache

# WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist/index.js /usr/src/app/index.js
WORKDIR /usr/src/app
RUN npm install @discordjs/opus --verbose
RUN npm install --save sqlite3
RUN mkdir -p /usr/src/app/build/Release
RUN cp /usr/src/app/node_modules/sqlite3/build/Release/node_sqlite3.node /usr/src/app/build/Release
RUN chown -R node:node /usr/src/app

# USER node
CMD ["node", "index.js"]
