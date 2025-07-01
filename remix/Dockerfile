# ステージ0: Corepackを有効化した共通ベースイメージ
# これにより、以降のステージで正しいYarnのバージョンが使われる
FROM node:lts-alpine AS base
RUN corepack enable

# -----------------------------------------------
# ステージ1: 依存関係のインストール
# -----------------------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock* ./
# package.jsonで指定されたバージョンのYarnでインストールが実行される
RUN yarn install --frozen-lockfile

# -----------------------------------------------
# ステージ2: 開発環境 (target: dev)
# -----------------------------------------------
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 開発サーバーを起動
CMD ["yarn", "dev"]

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
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
# 本番に必要な依存関係のみをインストール
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile --production
# 本番サーバーを起動
CMD ["yarn", "start"]
