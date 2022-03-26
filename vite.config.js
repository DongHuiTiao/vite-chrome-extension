import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';
import { resolve } from 'path';
import styleImport from 'vite-plugin-style-import';
import ViteComponents, { ElementPlusResolver } from 'vite-plugin-components';
import alias from '@rollup/plugin-alias';
// import AutoImport from 'unplugin-auto-import/vite';
// import Components from 'unplugin-vue-components/vite';
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: [{ find: '@', replacement: resolve(__dirname, 'src') }],
	},
	plugins: [
		alias(),
		vue(),
		eslintPlugin({
			include: ['src/**/*.vue', 'src/**/*.js'], // 检查的文件
		}),
		ViteComponents({
			customComponentResolvers: [ElementPlusResolver()],
		}),
		styleImport({
			libs: [
				{
					libraryName: 'element-plus',
					esModule: true,
					resolveStyle: name => {
						return `element-plus/lib/theme-chalk/${name}.css`;
					},
				},
			],
		}),
		// AutoImport({
		// 	resolvers: [ElementPlusResolver()],
		// }),
		// Components({
		// 	resolvers: [ElementPlusResolver()],
		// }),
	],
	build: {
		rollupOptions: {
			output: {
				entryFileNames: `assets/index.dht.js`,
				chunkFileNames: `assets/chunk.dht.js`,
				assetFileNames: `assets/index.dht.css`,
			},
		},
	},
});
