import swc from 'unplugin-swc';
import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	server: {
		port: 3000,
	},
	//【重要】このセクションを追加
	resolve: {
		preserveSymlinks: true,
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