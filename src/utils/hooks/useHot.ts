import { computed, nextTick, ref, watch } from "vue";
import requestQueueFactory from "../../request-queue";
import { CancelType } from "../../request-queue/type";
import { getUpFollowersNum } from "../api/fans";
import { getHotRankVideos } from "../api/hot";
import { getOneGroupUpVideoInfo, getUpVideosNum } from "../api/video";
const RequestQueue = requestQueueFactory();
export type SortType = '' | 'fans' | 'videosNum' | 'createdDate';

const initHot = () => {
    const hotInfosList = ref([]);
    // 是否展示抽屉
    const drawerVisible = ref<boolean>(false);
    const open = () => {
        drawerVisible.value = true;
        init();
    }
    const isLoading = ref(false);
    const isShowControlDrawer = ref(false);
    const handlingMid = ref<number>(-1);

    watch(handlingMid, (value) => {
        if (value === -1) {
            if (isScrollToHandlingDom.value) {
                scrollToHandlingDom(hotInfosList[0].owner.mid)
            }
        } else {
            if (isScrollToHandlingDom.value) {
                scrollToHandlingDom(value);
            }
        }
    })

    const isRequesting = ref(false);
    const isScrollToHandlingDom = ref(false);
    // 停止批量操作
    const cancelRequest = () => {
        RequestQueue.cancelRequest(CancelType.StopBatch);
    };

    const init = async () => {
        hotInfosList.value = await getHotRankVideos();
        isLoading.value = false;
        isShowControlDrawer.value = true;
    }
    const stopRequest = () => {
        isRequesting.value = false;
        handlingMid.value = -1;
        isScrollToHandlingDom.value = false;
    }
    const updateAllHotInfo = async () => {
        try {
            isRequesting.value = true;
            for (const videoInfo of hotInfosList.value) {
                handlingMid.value = videoInfo.owner.mid;
                await updateOneHotInfo(videoInfo);
            }
            stopRequest();
        } catch (error) {
            console.log(error, '???')
            if (error === CancelType.StopBatch) {
                stopRequest();
            }
        }
    }

    const updateOneHotInfo = async (videoInfo) => {
        videoInfo.owner.fans = await getUpFollowersNum(videoInfo.owner.mid);
        videoInfo.owner.videosNum = await getUpVideosNum(videoInfo.owner.mid);
        const videosGroup = await getOneGroupUpVideoInfo(videoInfo.owner.mid, videoInfo.owner.videosNum, 1);
        if (!videosGroup.newList.length) {
            return;
        }
        const createdVideo = videosGroup.newList[0];
        videoInfo.owner.createdDate =  createdVideo.created;
    }

    const getAllHotUpFans = async () => {
        try {
            isRequesting.value = true;
            for (const videoInfo of hotInfosList.value) {
                handlingMid.value = videoInfo.owner.mid;
                videoInfo.owner.fans = await getUpFollowersNum(videoInfo.owner.mid);
            }
            stopRequest();
        } catch (error) {
            if (error === CancelType.StopBatch) {
                stopRequest();
            }
        }
    }

    const getAllHotUpVideosNum = async () => {
        try {
            isRequesting.value = true;
            for (const videoInfo of hotInfosList.value) {
                handlingMid.value = videoInfo.owner.mid;
                videoInfo.owner.videosNum = await getUpVideosNum(videoInfo.owner.mid);
            }
            stopRequest();
        } catch (error) {
            if (error === CancelType.StopBatch) {
                stopRequest();
            }
        }
    }

    const getAllHotUpCreatedDate = async () => {
        try {
            isRequesting.value = true;
            for (const videoInfo of hotInfosList.value) {
                handlingMid.value = videoInfo.owner.mid;
                const videosGroup = await getOneGroupUpVideoInfo(videoInfo.owner.mid, videoInfo.owner.videosNum, 1);
                if (!videosGroup.newList.length) {
                    return;
                }
                const createdVideo = videosGroup.newList[0];
                videoInfo.owner.createdDate =  createdVideo.created;
            }
            stopRequest();
        } catch (error) {
            if (error === CancelType.StopBatch) {
                stopRequest();
            }
        }
    }

    const sortType = ref<SortType>('');
    // 排列顺序
    const sortOrder = ref<boolean>(false);

    const showHotList = computed<any[]>(() => {
        // 过滤掉搜索的部分
        let tempList = hotInfosList.value.slice();
        const key = sortType.value;

        if (!key) {
            return tempList;
        }

        // 升序
        if (sortOrder.value) {
            console.log(tempList.sort((a, b) => a.owner[key] - b.owner[key]))
            return tempList.sort((a, b) => a.owner[key] - b.owner[key]);
        }
        // 降序
        console.log(tempList.sort((a, b) => b.owner[key] - a.owner[key]))
        return tempList.sort((a, b) => b.owner[key] - a.owner[key]);
    });

        // 视图跳转掉正在处理的 dom 上
    const scrollToHandlingDom = (mid: number) => {
        // 先获取视图区域的 dom
        const showResultDom = document.querySelector('.hot-table__show-result');
        // 获取正在处理的 up 主的 dom
        const handlingDom = document.getElementById(`dht_${mid}`);
        // 获取正在处理的 up 主的dom 的高度
        const { offsetTop } = handlingDom;

        // 视图跳转过去
        showResultDom.scrollTo({
            top: offsetTop - 345,
            left: 0,
            behavior: 'smooth'
        });
    }

    // 抽屉相关的功能
    return {
        drawerVisible,
        open,
        isLoading,
        isShowControlDrawer,
        handlingMid,
        updateAllHotInfo,
        getAllHotUpFans,
        getAllHotUpVideosNum,
        getAllHotUpCreatedDate,
        isScrollToHandlingDom,
        scrollToHandlingDom,
        cancelRequest,
        isRequesting,
        hotInfosList,
        showHotList,
        sortType,
        sortOrder
    }
}

const init = initHot();

export const useHot = () => init;
