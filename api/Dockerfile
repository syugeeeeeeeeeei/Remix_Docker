# ステージ0: Corepackを有効化した共通ベースイメージ
FROM node:lts-alpine AS base
RUN corepack enable
RUN yarn set version stable

# -----------------------------------------------
# ステージ1: 依存関係のインストール
# -----------------------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock* ./
# Yarn v2+ (Berry)がPnPモードの場合でもnode_modulesを生成するように設定
RUN yarn config set nodeLinker node-modules
RUN yarn install --frozen-lockfile

# -----------------------------------------------
# ステージ2: 開発環境 (target: dev)
# -----------------------------------------------
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 開発サーバーを起動
CMD ["yarn", "start:dev"]

# -----------------------------------------------
# ステージ3: 本番ビルド
# -----------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# -----------------------------------------------
# ステージ4: 本番環境 (target: prod)
# -----------------------------------------------
FROM base AS prod
WORKDIR /app
COPY --from=builder /app/dist ./dist
# 本番に必要な依存関係のみをインストール
COPY package.json yarn.lock* ./
# Yarn v2+ (Berry)がPnPモードの場合でもnode_modulesを生成するように設定
RUN yarn config set nodeLinker node-modules
RUN yarn install --frozen-lockfile --production
# アプリケーションを起動
CMD ["node", "dist/main"]
