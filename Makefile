# .envファイルから環境変数を読み込む
include .env
export

# 開発環境用のコマンド
# --------------------------------------------------
# 開発環境をバックグラウンドで起動
up-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 開発環境を停止
down-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# 開発用のイメージをビルド
build-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml build

# 開発環境のログを表示
logs-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# 本番環境用のコマンド
# --------------------------------------------------
# 本番環境をバックグラウンドで起動
up-prod:
	docker compose -f docker-compose.yml up -d

# 本番環境を停止
down-prod:
	docker compose -f docker-compose.yml down

# 本番用のイメージをビルド
build-prod:
	docker compose -f docker-compose.yml build

# 本番環境のログを表示
logs-prod:
	docker compose -f docker-compose.yml logs -f

# その他
# --------------------------------------------------
# 全てのコンテナ、ネットワーク、ボリュームを削除
prune:
	docker system prune --volumes -f

