// 这个文件用于注入 <script type='module' />
// 这样就可以使用 vite 来开发
const script = document.createElement('script');
script.type = 'module';
// eslint-disable-next-line no-undef
script.src = chrome.extension.getURL('/assets/index.dht.js');
document.body.appendChild(script);

// eslint-disable-next-line no-undef
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
// 	console.log(request.info);
// 	// 这里是返回给bg的内容
// 	sendResponse('get the message');
// });
