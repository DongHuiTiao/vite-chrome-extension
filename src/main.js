import { createApp } from 'vue';
import App from './App.vue';

const id = `app_vue_${Date.now()}`;
const root = document.createElement('div');
root.id = id;
root.style = `
    position: fixed;
    top: 50%;
    left: 0;
`;
document.body.appendChild(root);
createApp(App).mount(`#${id}`);

if (import.meta.hot) {
	import.meta.hot.on('refresh-extension', data => {
		console.log('那边已经构建好了，这边开始刷新吧！');
		// eslint-disable-next-line no-undef
		const res = chrome.runtime.reload();
		console.log('刷新好了', res);
	});
}
