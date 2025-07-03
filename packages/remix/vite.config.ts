import { vitePlugin as remix } from "@remix-run/dev";
import path from 'path'; // <--- この行を追加
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		host: "0.0.0.0", // Dockerコンテナ内で外部からのアクセスを受け付ける
		port: 5173,
		hmr: {
			clientPort: 5173, // ブラウザがアクセスするポート
		},
	},
	resolve: {
		preserveSymlinks: true,
		// ▼▼▼ このalias設定をここに追加 ▼▼▼
		alias: {
			'@my-app/database': path.resolve(__dirname, '../database/src/index.ts'),
		},
		// ▲▲▲ ここまで ▲▲▲
	},
	plugins: [
		remix(),
		tsconfigPaths(),
	],
});