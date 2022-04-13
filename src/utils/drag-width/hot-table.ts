import { useHead } from "../hooks/useHead";

const headsName = {
	index: '序号',
	avatar: '头像',
	nickName: '昵称',
    fans: '粉丝数',
	videosNum: '视频数量',
	createdDate: '首稿时间',
};

const headsWidth = {
	index: 6,
	avatar: 6,
	nickName: 15,
    fans: 12,
	videosNum: 10,
	createdDate: 15,
};

const availSortType = ['fans', 'videosNum', 'createdDate'];


const init = useHead(headsWidth, 'hot-table__head');

export const useHotHead = () => {
    return {
        ...init,
        headsName,
        availSortType
    }
}