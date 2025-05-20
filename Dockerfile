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
RUN ncc build src/index.ts -o dist/

# プロダクション用
FROM node:20-alpine AS production
RUN apk update && apk add ffmpeg --no-cache

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist/index.js /usr/src/app/index.js
RUN npm install @discordjs/opus
RUN npm install --save sqlite3
RUN chown -R node:node ./node_modules && chown node:node ./index.js

USER node
CMD ["node", "index.js"]
