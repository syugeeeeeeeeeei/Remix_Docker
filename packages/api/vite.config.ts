import swc from 'unplugin-swc';
import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	server: {
		port: 3000,
	},
	plugins: [
		...VitePluginNode({
			adapter: 'nest',
			appPath: './src/main.ts',
			exportName: 'viteNodeApp',
			tsCompiler: 'swc',
		}),
		// SWCプラグインを追加
		swc.vite(),
		tsconfigPaths(),
	],
	optimizeDeps: {
		exclude: [
			'@nestjs/microservices',
			'@nestjs/websockets',
			// ... その他の除外モジュール
		],
	},
});