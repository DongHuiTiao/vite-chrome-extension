import { createApp } from 'vue';
import App from './App.vue';
import VueLazyload from 'vue3-lazyload';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

const id = `app_vue_${Date.now()}`;
const root = document.createElement('div');
root.id = id;
document.body.appendChild(root);
const app = createApp(App);
app.use(ElementPlus, {
	locale: zhCn,
});
app.use(VueLazyload, {
	preLoad: 1,
	attempt: 1,
});
app.mount(`#${id}`);
