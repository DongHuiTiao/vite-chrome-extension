// 这个文件用于注入 <script type='module' />
// 这样就可以使用 vite 来开发
const script = document.createElement('script');
script.type = 'module';
script.src = chrome.extension.getURL('/assets/index.dht.js');
document.body.appendChild(script);