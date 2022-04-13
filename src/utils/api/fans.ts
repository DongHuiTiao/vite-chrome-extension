import axios from 'axios';
import requestQueueFactory from '../../request-queue/index'; 

const RequestQueue = requestQueueFactory();

axios.defaults.withCredentials = true;
// 获取 up 主关注数量
const getUpFollowersNumAxios = async (mid: number, controller: AbortController): Promise<any> => {
    const res = await axios.get(`https://api.bilibili.com/x/relation/stat?vmid=${mid}`,{
		signal: controller.signal
	})
    return res.data.data.follower
}

export const getUpFollowersNum = (mid: number): Promise<any> => {
	const controller = new AbortController();
    return RequestQueue.request(
		() => getUpFollowersNumAxios(mid, controller),
		controller
	)
}
