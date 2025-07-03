import path from 'path'; // <--- この行を追加
import swc from 'unplugin-swc';
import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	server: {
		port: 3000,
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
		...VitePluginNode({
			adapter: 'nest',
			appPath: './src/main.ts',
			exportName: 'viteNodeApp',
			tsCompiler: 'swc',
		}),
		swc.vite(),
		tsconfigPaths(),
	],
	optimizeDeps: {
		exclude: [
			'@nestjs/microservices',
			'@nestjs/websockets',
		],
	},
});