# .envファイルから環境変数を読み込む
include .env
export

# 開発環境用のコマンド
# --------------------------------------------------
up-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

down-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

build-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml build

logs-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# --- 👇 ここから追加 ---
# データベースマイグレーションを実行する
migrate-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api yarn prisma migrate dev

# apiコンテナのbashに入る
exec-api:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml exec api bash
# --- 👆 ここまで追加 ---


# 本番環境用のコマンド
# --------------------------------------------------
up-prod:
	docker compose -f docker-compose.yml up -d

down-prod:
	docker compose -f docker-compose.yml down

build-prod:
	docker compose -f docker-compose.yml build

logs-prod:
	docker compose -f docker-compose.yml logs -f

# その他
# --------------------------------------------------
prune:
	docker system prune --volumes -f
