import { vitePlugin as remix } from "@remix-run/dev";
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
	plugins: [
		remix(),
		tsconfigPaths(),
	],
});