import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';
import { resolve } from 'path';

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
	],
	build: {
		rollupOptions: {
			output: {
				entryFileNames: `assets/index.dht.js`,
			},
		},
	},
});
