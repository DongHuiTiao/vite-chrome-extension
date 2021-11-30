import { createApp } from 'vue'
import App from './App.vue'

const id = `app_vue_${Date.now()}`;
const root = document.createElement('div');
root.id = id;
document.body.appendChild(root);

createApp(App).mount(`#${id}`)
