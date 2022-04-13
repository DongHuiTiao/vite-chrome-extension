import axios from 'axios';
import requestQueueFactory from '../../request-queue/index'; 
import { OneGroupVideoInfo, OneGroupVideoInfoCode } from '../type';

const RequestQueue = requestQueueFactory();

axios.defaults.withCredentials = true;

// 获取 up 主所有视频数量
const getUpVideosNumAxios = async (mid: number, controller: AbortController): Promise<number> => {
	const res = await axios.get(`https://api.bilibili.com/x/space/navnum?mid=${mid}`, {
		signal: controller.signal
	});
	return res.data.data.video;
};

export const getUpVideosNum = (mid: number): Promise<number> => {
	const controller = new AbortController();
	return RequestQueue.request<number>(
		() => getUpVideosNumAxios(mid, controller),
		controller
	)
}

// 获取一组视频信息的接口
const getOneGroupUpVideoInfoAxios = async (mid: number, page: number, pageSize: number = 50, controller: AbortController): Promise<OneGroupVideoInfo>  => {
    const res = await axios.get(`https://api.bilibili.com/x/space/arc/search?mid=${mid}&ps=${pageSize}&tid=0&pn=${page}&keyword=&order=pubdate&jsonp=jsonp`, {
		signal: controller.signal
	});
	const result: OneGroupVideoInfo = {
		code: res.data.code,
		newList: []
	}

	if (result.code === OneGroupVideoInfoCode.Success) {
		result.newList = res.data.data.list.vlist;
	};
	
	return result;
}

export const getOneGroupUpVideoInfo = (mid: number, page: number, pageSize: number = 50): Promise<OneGroupVideoInfo>  => {
    const controller = new AbortController();
	return RequestQueue.request<OneGroupVideoInfo>(
		() => getOneGroupUpVideoInfoAxios(mid, page, pageSize, controller),
		controller
	)
}