import { videoApi  } from './api/video';
import { sleep } from './common/index';

const { getUpVideoNum, getOneGroupUpVideoInfo } = videoApi();

export const useVideo = () => {
    // 获取up主全部视频信息的方法
    const getUpAllVideosInfo = async (mid) => {
        // 获取up主制作的视频的数量
        const num = await getUpVideoNum(mid);
        // 获取的最多页数
        const time = Math.ceil(num / 50);
        // 当前获取的页数
        let currentPage = 1;
        // 当前获取的所有视频信息
        let viedosInfoList = [];
        // 当前页数少于最多页数时，请求数据
        while(currentPage <= time) {
            // 获取一批 up 主的视频信息，每组上限 50 个
            const newList = await getOneGroupUpVideoInfo(mid, currentPage);
            viedosInfoList = viedosInfoList.concat(newList);
            currentPage++;
            sleep(667);
        }
        return viedosInfoList;
    }
    return {
        getUpAllVideosInfo
    }
}