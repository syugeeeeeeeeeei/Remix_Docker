# .envファイルから環境変数を読み込む
include .env
export

# 開発環境用のコマンド
# --------------------------------------------------
up-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

up-build-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build 	
 

down-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

build-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml build

logs-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# データベースマイグレーションを実行する
migrate-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api yarn prisma migrate dev

# --- 👇 ここから追加 ---
# Prisma Clientの型定義を生成する
generate-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api yarn prisma generate
# --- 👆 ここまで追加 ---

# apiコンテナのbashに入る
exec-api:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api bash

# (以下、本番環境用のコマンドなど)