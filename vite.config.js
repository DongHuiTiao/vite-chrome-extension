import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';
import { resolve } from 'path';
import { refreshExtensionPlugin } from './node-server/refresh-extension-plugin';

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: [{ find: '@', replacement: resolve(__dirname, 'src') }],
	},
	plugins: [
		vue(),
		eslintPlugin({
			include: ['src/**/*.vue', 'src/**/*.js'], // 检查的文件
		}),
		refreshExtensionPlugin(),
	],
	build: {
		rollupOptions: {
			output: {
				entryFileNames: `assets/index.dht.js`,
			},
		},
	},
	server: {
		open: 'http://localhost:3000/',
	},
});
