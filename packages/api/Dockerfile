# 1. ビルダーステージ: 依存関係のインストールとビルドを行う
FROM node:22-alpine AS builder
WORKDIR /app

# 依存関係のインストールを効率化するため、package.jsonとlockファイルを先にコピー
COPY package.json yarn.lock ./
COPY packages/database/package.json ./packages/database/
COPY packages/api/package.json ./packages/api/

# Corepackを有効化し、Yarnのバージョンと設定を行う
RUN corepack enable && \
	yarn set version stable && \
	yarn config set nodeLinker node-modules && \
	yarn install --frozen-lockfile

# 全てのソースコードをコピー
COPY . .

# APIパッケージのみをビルド
RUN yarn workspace api build

# 2. 本番ステージ: 実行に必要なファイルのみをコピー
FROM node:22-alpine AS prod
WORKDIR /app

# 実行に必要なnode_modulesとビルド成果物のみをコピー
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/api/package.json ./packages/api/package.json

# ポートを公開
EXPOSE 3000

# アプリケーションを起動
CMD ["node", "packages/api/dist/main.js"]