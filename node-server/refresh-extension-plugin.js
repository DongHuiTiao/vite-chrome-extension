// 可以刷新目标页上的插件
export const refreshExtensionPlugin = () => {
	return {
		name: 'build-plugin',
		handleHotUpdate({ server }) {
			server.ws.send({
				type: 'custom',
				event: 'refresh-extension',
				data: {},
			});
			console.log('我发送信息给前端');
			return [];
		},
	};
};
