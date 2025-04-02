# ビルド用
FROM node:20-alpine AS builder

COPY --from=mwader/static-ffmpeg:7.1 /ffmpeg /usr/local/bin/
COPY --from=mwader/static-ffmpeg:7.1 /ffprobe /usr/local/bin/

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
COPY --from=mwader/static-ffmpeg:7.1 /ffmpeg /usr/local/bin/
COPY --from=mwader/static-ffmpeg:7.1 /ffprobe /usr/local/bin/

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist/index.js /usr/src/app/index.js
CMD ["node", "index.js"]