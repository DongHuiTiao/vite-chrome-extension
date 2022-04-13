import axios from 'axios';
import requestQueueFactory from '../../request-queue/index'; 

const RequestQueue = requestQueueFactory();

// 获取热门榜
const getHotRankVideosAxios = async (controller: AbortController): Promise<any> => {
    const res = await axios.get(`https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all`,{
		signal: controller.signal
	})
    return res.data.data.list
}

export const getHotRankVideos = (): Promise<any> => {
	const controller = new AbortController();
    return RequestQueue.request(
		() => getHotRankVideosAxios(controller),
		controller
	)
}