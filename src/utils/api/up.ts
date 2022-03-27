import axios from 'axios';
import { OneGroupVideoInfo, OneGroupVideoInfoCode } from '../type';

axios.defaults.withCredentials=true;
export interface UpInfo {
	mid: number;
	uname: string;
	face: string;
}
export const getOneGroupFollows = async (mid: number, currentPage: number): Promise<UpInfo[]> => {
    const res = await axios.get(`https://api.bilibili.com/x/relation/followings?vmid=${mid}&pn=${currentPage}&ps=50&order=desc`)
    return res.data.data.list
}

// 获取up主所有视频数量
export const getUpVideosNum = async (mid: number): Promise<number> => {
	const res = await axios.get(`https://api.bilibili.com/x/space/navnum?mid=${mid}`);
	return res.data.data.video;
};

// 获取一组视频信息的接口
export const getOneGroupUpVideoInfo = async (mid: number, page: number, pageSize: number = 50): Promise<OneGroupVideoInfo>  => {
    const res = await axios.get(`https://api.bilibili.com/x/space/arc/search?mid=${mid}&ps=${pageSize}&tid=0&pn=${page}&keyword=&order=pubdate&jsonp=jsonp`);
	const result: OneGroupVideoInfo = {
		code: res.data.code,
		newList: []
	}

	if (result.code === OneGroupVideoInfoCode.Success) {
		result.newList = res.data.data.list.vlist;
	};
	
	return result;
}

// 获得up自己的个人信息
export const getMyInfo = async (mid: string): Promise<any> => {
	const res = await axios.get(`https://api.bilibili.com/x/space/acc/info?mid=${mid}`);
	return res.data.data;
}

