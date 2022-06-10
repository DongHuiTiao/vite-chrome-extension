import { useHead } from "../hooks/useHead";

const headsName = {
	index: '序号',
	user: '用户',
	videosImage: '封面',
	videosTitle: '标题',
	coin: '投币',
	like: '点赞',
	favorite: '收藏',
	danmaku: '弹幕',
	reply: '评论',
	share: '分享',
	view: '播放',
	score: '分数',
	sex: '性别',
    fans: '粉丝数',
	videosNum: '视频数',
	createdDate: '首稿时间',
};

const headsWidth = {
	index: 5,
	user: 6,
	videosImage: 12,
	videosTitle: 10,
	coin: 4,
	like: 4,
	favorite: 4,
	danmaku: 4,
	reply: 4,
	share: 4,
	view: 4,
	score: 4,
	sex: 3,
    fans: 5,
	videosNum: 4,
	createdDate: 12,
};

const availSortType = ['fans', 'videosNum', 'createdDate', 'coin', 'like', 'favorite', 'danmaku', 'reply', 'share', 'view', 'score'];


const init = useHead(headsWidth, 'hot-table__head');

export const useHotHead = () => {
    return {
        ...init,
        headsName,
        availSortType
    }
}