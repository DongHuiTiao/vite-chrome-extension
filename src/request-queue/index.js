const sleep = async time => {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(`延迟执行 ${time} ms`);
		}, time);
	});
};

class RequestQueue {
	queue = [];
	add(promiseConfig) {
		this.queue.push(promiseConfig);
		if (this.queue.length === 1) {
			this.getNextPromise();
		}
	}

	async getNextPromise() {
		const promiseConfig = this.queue[0];
		const { promise, done } = promiseConfig;
		try {
			const data = await promise();
			done(data);
			this.queue.shift();

			if (this.queue.length === 0) {
				return;
			}
			await sleep(1000);
			await this.getNextPromise();
		} catch (error) {
			console.log(error);
		}
	}
}

const requestQueue = new RequestQueue();

const addRequest = async promise => {
	let done = null;

	const lisnter = new Promise(resolve => {
		done = resolve;
	});

	requestQueue.add({
		promise,
		done,
	});

	return lisnter;
};

const promiseMock = (second, name) => {
	return () =>
		new Promise(resolve => {
			setTimeout(() => {
				resolve(`我是 ${name}，用 ${second} 秒钟完成了`);
			}, second * 1000);
		});
};

addRequest(promiseMock(1, '小猫'));
addRequest(promiseMock(2, '小狗'));
addRequest(promiseMock(3, '小龟'));
addRequest(promiseMock(4, '小兔'));
