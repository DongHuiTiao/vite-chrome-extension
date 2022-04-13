import { computed, ref, watch } from "vue";
import requestQueueFactory from "../../request-queue";
import { CancelType } from "../../request-queue/type";
import { getUpFollowersNum } from "../api/fans";
import { getHotRankVideos } from "../api/hot";
import { getUpInfo } from "../api/up";
import { getOneGroupUpVideoInfo, getUpVideosNum } from "../api/video";
const RequestQueue = requestQueueFactory();
export type SortType = 'fans' | 'videosNum' | 'createdDate' | 'coin' | 'like' | 'favorite' | 'danmaku' | 'reply' | 'share' | 'view' | 'score';

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
                scrollToHandlingDom(hotInfosList[0].mid)
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
        const hotRankVideos = await getHotRankVideos();
        hotInfosList.value = hotRankVideos.map((item) => {
            return {
                name: item.owner.name,
                face: item.owner.face,
                pic: item.pic,
                sex: null,
                title: item.title,
                mid: item.owner.mid,
                videosImage: item.pic,
                videosTitle: item.title,
                coin: item.stat.coin,
                like: item.stat.like,
                favorite: item.stat.favorite,
                danmaku: item.stat.danmaku,
                reply: item.stat.reply,
                share: item.stat.share,
                view: item.stat.view,
                score: item.score,
                fans: null,
                videosNum: null,
                createdDate: null,
            }
        })
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
                handlingMid.value = videoInfo.mid;
                await updateOneHotInfo(videoInfo);
            }
            stopRequest();
            scrollToHandlingDom(hotInfosList[0].mid)
        } catch (error) {
            if (error === CancelType.StopBatch) {
                stopRequest();
            }
        }
    }

    const updateOneHotInfo = async (videoInfo) => {
        videoInfo.sex = (await getUpInfo(videoInfo.mid)).sex;
        videoInfo.fans = await getUpFollowersNum(videoInfo.mid);
        videoInfo.videosNum = await getUpVideosNum(videoInfo.mid);
        const videosGroup = await getOneGroupUpVideoInfo(videoInfo.mid, videoInfo.videosNum, 1);
        if (!videosGroup.newList.length) {
            return;
        }
        const createdVideo = videosGroup.newList[0];
        videoInfo.createdDate =  createdVideo.created;
    }

    const getAllHotUpFans = async () => {
        try {
            isRequesting.value = true;
            for (const videoInfo of hotInfosList.value) {
                handlingMid.value = videoInfo.mid;
                videoInfo.fans = await getUpFollowersNum(videoInfo.mid);
            }
            stopRequest();
            scrollToHandlingDom(hotInfosList[0].mid)
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
                handlingMid.value = videoInfo.mid;
                videoInfo.videosNum = await getUpVideosNum(videoInfo.mid);
            }
            stopRequest();
            scrollToHandlingDom(hotInfosList[0].mid)
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
                handlingMid.value = videoInfo.mid;
                const videosGroup = await getOneGroupUpVideoInfo(videoInfo.mid, videoInfo.videosNum, 1);
                if (!videosGroup.newList.length) {
                    return;
                }
                const createdVideo = videosGroup.newList[0];
                videoInfo.createdDate =  createdVideo.created;
            }
            stopRequest();
            scrollToHandlingDom(hotInfosList[0].mid)
        } catch (error) {
            if (error === CancelType.StopBatch) {
                stopRequest();
            }
        }
    }

    const getAllHotUpSex = async () => {
        try {
            isRequesting.value = true;
            for (const videoInfo of hotInfosList.value) {
                handlingMid.value = videoInfo.mid;
                videoInfo.sex = (await getUpInfo(videoInfo.mid)).sex;
            }
            stopRequest();
            scrollToHandlingDom(hotInfosList[0].mid)
        } catch (error) {
            if (error === CancelType.StopBatch) {
                stopRequest();
            }
        }
    }

    const sortType = ref<SortType>('score');
    // 排列顺序
    const sortOrder = ref<boolean>(false);

    const isShowMan = ref(true);
    const isShowWoman = ref(true);
    const isShowSecret = ref(true);
    

    const showHotList = computed<any[]>(() => {
        // 过滤掉搜索的部分
        let tempList = hotInfosList.value.slice();
        const key = sortType.value;
        
        if (!isShowMan.value) {
            tempList = tempList.filter(item => item.sex !== '男');
        }

        if (!isShowWoman.value) {
            tempList = tempList.filter(item => item.sex !== '女');
        }

        if (!isShowSecret.value) {
            tempList = tempList.filter(item => item.sex !== '保密');
        }

        // 升序
        if (sortOrder.value) {
            console.log(tempList.sort((a, b) => a[key] - b[key]))
            return tempList.sort((a, b) => a[key] - b[key]);
        }
        // 降序
        console.log(tempList.sort((a, b) => b[key] - a[key]))
        return tempList.sort((a, b) => b[key] - a[key]);
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
        getAllHotUpSex,
        isScrollToHandlingDom,
        scrollToHandlingDom,
        cancelRequest,
        isRequesting,
        hotInfosList,
        showHotList,
        sortType,
        sortOrder,
        isShowMan,
        isShowWoman,
        isShowSecret,
    }
}

const init = initHot();

export const useHot = () => init;
