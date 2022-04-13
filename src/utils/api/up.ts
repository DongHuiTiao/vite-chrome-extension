import axios from 'axios';
import { OneGroupVideoInfo, OneGroupVideoInfoCode } from '../type';
import requestQueueFactory from '../../request-queue/index'; 

const RequestQueue = requestQueueFactory();

axios.defaults.withCredentials=true;
export interface UpInfo {
	mid: number;
	uname: string;
	face: string;
	mtime: number;
}
// 获得我关注的人
const getOneGroupFollowsAxios = async (mid: number, currentPage: number, controller: AbortController): Promise<UpInfo[]> => {
    const res = await axios.get(`https://api.bilibili.com/x/relation/followings?vmid=${mid}&pn=${currentPage}&ps=50&order=desc`,{
		signal: controller.signal
	})
    return res.data.data.list
}

export const getOneGroupFollows = (mid: number, currentPage: number): Promise<UpInfo[]> => {
	const controller = new AbortController();
    return RequestQueue.request(
		() => getOneGroupFollowsAxios(mid, currentPage, controller),
		controller
	)
}

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

// 获得up自己的个人信息
export const getMyInfoAxios = async (mid: string, controller: AbortController): Promise<any> => {
	const res = await axios.get(`https://api.bilibili.com/x/space/acc/info?mid=${mid}`, {
		signal: controller.signal
	});
	return res.data.data;
}

export const getMyInfo = (mid: string): Promise<any> => {
	const controller = new AbortController()
	return RequestQueue.request(
		() => getMyInfoAxios(mid, controller),
		controller
	)
}

// 获得up自己的个人信息
const getUpInfoAxios = async (mid: string, controller: AbortController): Promise<any> => {
	const res = await axios.get(`https://api.bilibili.com/x/space/acc/info?mid=${mid}`, {
		signal: controller.signal
	});
	return res.data.data;
}

export const getUpInfo = (mid: string): Promise<any> => {
	const controller = new AbortController()
	return RequestQueue.request(
		() => getUpInfoAxios(mid, controller),
		controller
	)
}

// 获取 up 主关注了多少人
const getMyFollowsNumAxios = async (mid: string, controller: AbortController): Promise<number> => {
	const res = await axios.get(`https://api.bilibili.com/x/relation/stat?vmid=${mid}`, {
		signal: controller.signal
	});
	return res.data.data.following;
}

export const getMyFollowsNum = (mid: string): Promise<number> => {
	const controller = new AbortController()
	return RequestQueue.request<number>(
		() => getMyFollowsNumAxios(mid, controller),
		controller
	)
}

