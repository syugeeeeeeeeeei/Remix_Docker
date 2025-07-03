# 1. ビルダーステージ: 依存関係のインストールとビルドを行う
FROM node:22-alpine AS builder
WORKDIR /app

# 依存関係のインストールを効率化
COPY package.json yarn.lock ./
COPY packages/database/package.json ./packages/database/
COPY packages/remix/package.json ./packages/remix/

# Corepackを有効化し、Yarnのバージョンと設定を行う
RUN corepack enable && \
	yarn set version stable && \
	yarn config set nodeLinker node-modules && \
	yarn install --frozen-lockfile

# 全てのソースコードをコピー
COPY . .

# Remixパッケージのみをビルド
RUN yarn workspace remix-app build

# 2. 本番ステージ: 実行に必要なファイルのみをコピー
FROM node:22-alpine AS prod
WORKDIR /app

# 実行に必要なファイル群をコピー
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/remix/build ./packages/remix/build
COPY --from=builder /app/packages/remix/public ./packages/remix/public
COPY --from=builder /app/packages/remix/package.json ./packages/remix/package.json

# ポートを公開
EXPOSE 3000

# アプリケーションを起動 (remix-serveのデフォルトポートは3000)
CMD ["yarn", "workspace", "remix-app", "start"]