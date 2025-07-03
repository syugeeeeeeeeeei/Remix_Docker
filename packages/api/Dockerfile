# -----------------
# 1. Builder Stage
# -----------------
FROM node:22-alpine AS builder

# 作業ディレクトリを設定
WORKDIR /app

# ビルドに必要な設定ファイルと、全てのpackage.jsonをコピー
COPY package.json .yarnrc.yml tsconfig.base.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/database/package.json ./packages/database/
COPY packages/remix/package.json ./packages/remix/

# Corepackを有効化し、Yarnをセットアップして依存関係をインストール
RUN corepack enable && \
	yarn set version stable && \
	yarn config set nodeLinker node-modules && \
	yarn install

# 必要なソースコードをコピー
COPY packages/database/ ./packages/database/
COPY packages/api/ ./packages/api/


# 【重要】依存関係の順にビルドを実行する
RUN yarn workspace api build

# -----------------
# 2. Production Stage
# -----------------
FROM node:22-alpine

WORKDIR /app

# 本番環境で必要なpackage.jsonのみコピー
COPY package.json .yarnrc.yml tsconfig.base.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/database/package.json ./packages/database/

# Corepackを有効化し、Yarnをセットアップして依存関係をインストール
RUN corepack enable && \
	yarn set version stable && \
	yarn config set nodeLinker node-modules && \
	yarn install
# Builder Stageからビルド成果物をコピー
COPY --from=builder /app/packages/api/dist ./packages/api/dist


# アプリケーションの実行コマンド
CMD ["yarn", "workspace", "api", "start:prod"]