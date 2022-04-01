// 通过时间戳计算间距
const getTimeDiff = timeLength => {
	const second = timeLength;
	const remianSecond = second % 60;

	const minute = (second - remianSecond) / 60;
	const remainMinute = minute % 60;

	const hour = (minute - remainMinute) / 60;
	const remainHour = hour % 24;

	const day = (hour - remainHour) / 24;

	return `${day}天${remainHour}小时${remainMinute}分${remianSecond}秒`;
};

// 计算当前咕咕时间
const getCurrentGuguLength = uploadTime => {
	// 获得当前的时间
	const currentTime = Date.now();

	const diff = Math.ceil((currentTime - uploadTime) / 1000);

	return diff;
};

// 计算平均更新频率
const getAverageGuguLength = (uploadTime, listLength) => {
	// 获得当前时间
	const currentTime = Date.now();
	// 前后差了多少时间
	const sum = currentTime - uploadTime;
	// 平均更新频率的时间戳
	const averageTime = Math.ceil(sum / (listLength + 1) / 1000);

	return averageTime;
};

// 获得视频数量
const getUpVideosNum = async mid => {
	return fetch(`https://api.bilibili.com/x/space/navnum?mid=${mid}`, {
		mode: 'cors',
		credentials: 'omit',
	})
		.then(res => res.json())
		.then(res => {
			return res.data.video;
		});
};

// 获取一组视频信息的接口
const getOneGroupUpVideoInfo = async (mid, page, pageSize = 50) => {
	const res = await fetch(
		`https://api.bilibili.com/x/space/arc/search?mid=${mid}&ps=${pageSize}&tid=0&pn=${page}&keyword=&order=pubdate`,
		{
			mode: 'cors',
			credentials: 'include',
		}
	).then(res => res.json());

	const result = {
		code: res.code,
		newList: [],
	};

	if (result.code === 0) {
		result.newList = res.data.list.vlist;
	}

	return result;
};

// 获取一个 up 主的视频列表
const getUpAllVideosList = async mid => {
	// 视频列表
	const videosList = [];
	// 获取 up 主制作的视频的数量
	const num = await getUpVideosNum(mid);

	if (num === 0) {
		return videosList;
	}

	// 获取的最多页数
	const time = Math.ceil(num / 50);
	// 当前获取的页数
	let currentPage = 1;
	// 当前页数少于最多页数时，请求数据
	while (currentPage <= time) {
		// 获取一批 up 主的视频信息，每组上限 50 个
		const { code, newList } = await getOneGroupUpVideoInfo(mid, currentPage);
		// 如果请求出错，就再来一次
		if (code === -1200) {
			continue;
		}
		videosList.push(...newList);
		currentPage++;
	}
	return videosList;
};

// 获取每一期视频各自咕了多长时间
const getGuguLengthList = videoslist => {
	const guguLengthList = videoslist.map((video, index, arr) => {
		const { bvid, created } = video;
		// 定义 咕咕 的起始时间，默认是当前发布时间
		let start = created;
		// 咕咕 结束时间是当前视频发布时间
		const end = created;
		// 如果不是最后一个视频
		if (index !== arr.length - 1) {
			// 咕咕 起始时间是上一期视频发布时间
			start = arr[index + 1].created;
		}
		// 如果是最后一个视频
		return {
			bvid,
			created,
			guguLength: end - start,
		};
	});

	return guguLengthList;
};

// 获取最长咕咕了多长时间
const getMaxGuguLength = (guguLengthList, currentGuguLength) => {
	const formatNumberList = guguLengthList.map(item => item.guguLength);

	return Math.max(...formatNumberList, currentGuguLength);
};

// 获取 up 咕咕三个数据
const getGuguDetails = async mid => {
	const videosList = await getUpAllVideosList(mid);
	const result = {
		currentGuguLength: 0,
		averageGuguLength: 0,
		maxGuguLength: 0,
		guguLengthList: [],
	};
	const videosListLength = videosList.length;
	// 如果该 up 无视频 则拦截
	if (videosListLength === 0) {
		return result;
	}
	// 计算三个数据 （第一次更新的时间，最后一次更新的时间，所有咕咕时间 ）
	// 首次投稿的视频发布时间
	const firstUploadTime = videosList[videosListLength - 1].created * 1000;
	// 最新投稿的视频发布时间
	const lastUploadTime = videosList[0].created * 1000;

	// 获取 最新咕咕时间
	const currentGuguLength = getCurrentGuguLength(lastUploadTime);
	// 获取 平均跟新频率
	const averageGuguLength = getAverageGuguLength(firstUploadTime, videosList.length);
	const guguLengthList = getGuguLengthList(videosList);
	// 获取 最大咕咕时间
	const maxGuguLength = getMaxGuguLength(guguLengthList, currentGuguLength);

	Object.assign(result, {
		currentGuguLength,
		averageGuguLength,
		maxGuguLength,
		guguLengthList,
	});
	return result;
};

const getGuguData = async mid => {
	console.log(`正在获取 mid 为 ${mid} 的 up 主的咕咕数据`);
	const details = await getGuguDetails(mid);
	console.log('获取完毕');
	const { currentGuguLength, averageGuguLength, maxGuguLength } = details;

	console.log(`当前拖更时长：${getTimeDiff(currentGuguLength)}`);
	console.log(`平均更新频率：${getTimeDiff(averageGuguLength)}`);
	console.log(`最大拖更时长：${getTimeDiff(maxGuguLength)}`);
};

await getGuguData(8212729);
