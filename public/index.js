// 这个文件用于注入 <script type='module' />
// 这样就可以使用 vite 来开发
const script = document.createElement('script');
script.type = 'module';
// eslint-disable-next-line no-undef
script.src = chrome.extension.getURL('/assets/index.dht.js');
document.body.appendChild(script);

const loadStyle = url => {
	const link = document.createElement('link');
	link.type = 'text/css';
	link.rel = 'stylesheet';
	// eslint-disable-next-line no-undef
	link.href = chrome.extension.getURL(url);
	const head = document.getElementsByTagName('head')[0];
	head.appendChild(link);
};

loadStyle('/assets/index.dht.css');
loadStyle('/assets/index.dht2.css');
