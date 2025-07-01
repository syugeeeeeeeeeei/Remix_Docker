# ステージ1: 依存関係のインストール
FROM node:lts-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# -----------------------------------------------
# ステージ2: 開発環境 (target: dev)
# -----------------------------------------------
FROM node:lts-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 開発サーバーを起動
CMD ["yarn", "dev"]

# -----------------------------------------------
# ステージ3: 本番ビルド
# -----------------------------------------------
FROM node:lts-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# -----------------------------------------------
# ステージ4: 本番環境 (target: prod)
# -----------------------------------------------
FROM node:lts-alpine AS prod
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
# 本番に必要な依存関係のみをインストール
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile --production
# 本番サーバーを起動
CMD ["yarn", "start"]
