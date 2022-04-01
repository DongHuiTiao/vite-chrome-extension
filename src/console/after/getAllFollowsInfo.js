const sleep = async time => {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(`延迟执行 ${time} ms`);
		}, time);
	});
};
const Delay = 1000;
// 队列请求
class RequestQueueClass {
	queue = [];
	isRequesting = false;
	add(promiseConfig) {
		this.queue.push(promiseConfig);
		if (!this.isRequesting) {
			this.requestLoop();
		}
	}

	async reaquest(promiseFn) {
		let done = null;

		const lisnter = new Promise(resolve => {
			done = resolve;
		});

		this.add({
			promiseFn,
			done,
		});

		return lisnter;
	}

	async requestLoop() {
		try {
			if (this.queue.length !== 0) {
				this.isRequesting = true;
				const promiseConfig = this.queue.shift();
				const { promiseFn, done } = promiseConfig;
				const data = await promiseFn();
				done(data);
				await sleep(Delay);
				this.requestLoop();
			} else {
				this.isRequesting = false;
			}
		} catch (error) {
			console.log(error);
		}
	}
}

// 创建一个请求队列实例
const RequestQueue = new RequestQueueClass();

// 转化关注时间
const formatDateToChinese = timestamp => {
	const time = new Date(timestamp * 1000);
	return `${time.getFullYear()}年${
		time.getMonth() + 1
	}月${time.getDate()}日${time.getHours()}点${time.getMinutes()}分`;
};

// 获取一批我关注的人
const getOneGroupFollows = async (mid, currentPage) => {
	return fetch(`https://api.bilibili.com/x/relation/followings?vmid=${mid}&pn=${currentPage}&ps=50&order=desc`, {
		mode: 'cors',
		credentials: 'include',
	})
		.then(res => res.json())
		.then(res => res.data.list);
};

// 获取我的关注列表
const getAllFollowsInfoList = async mid => {
	const followsInfoList = [];
	// 每次获取到的列表的长度
	let resultLength = -1;
	// 当前的页面
	let currentPage = 1;
	// 开始不断地获取 up 主列表
	while (resultLength !== 0) {
		const oneGroupFollowsInfo = await RequestQueue.reaquest(() => getOneGroupFollows(mid, currentPage));
		followsInfoList.push(...oneGroupFollowsInfo);
		resultLength = oneGroupFollowsInfo.length;
		console.log(`获得了第 ${currentPage} 关注列表`);
		currentPage++;
	}
	return followsInfoList;
};

const getFollows = async mid => {
	const allFollowsInfoList = await getAllFollowsInfoList(mid);

	const list = allFollowsInfoList.map(item => {
		return {
			用户昵称: item.uname,
			用户ID: item.mid,
			关注日期: formatDateToChinese(item.mtime),
		};
	});
	console.table(list);
};

await getFollows(8212729);
