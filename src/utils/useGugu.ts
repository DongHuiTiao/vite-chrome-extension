import { ref } from 'vue';
import { 
    getOneGroupFollows,
    getUpVideoNum,
    getOneGroupUpVideoInfo,
    getMyInfo,
} from './api/up';
import { deepClone, getMyMid, sleep } from './common';
import { VideoInfo } from './type';
// import {useLocalCollection } from './useLocalCollection';
import { useDB } from './useDB';
const { initDB, localStore } = useDB();

interface UpGugu {
    mid: number;
    uname: string;
    face: string;
    currentGuguLength?: number;
    averageGuguLength?: number;
    maxGuguLength?: number;
    videoNum: number;
    currentHaveVideoNum: number;
}

interface GuguTimeInfo {
    bvid: string;
    guguTime: number;
}

export const useUpList = () => {
    // 定义 up 主咕咕列表信息
    const followsVideoList = [];
    const followsGuguList = ref<UpGugu[]>([]);


    const myGuguList = ref<GuguTimeInfo[]>();
    const myGugu = ref<UpGugu>({
        mid: 0, 
        uname: '',
        face: '',
        currentGuguLength:undefined,
        averageGuguLength:undefined,
        maxGuguLength:undefined,
        videoNum: 0,
        currentHaveVideoNum: -1,
    })
    let isInit = false;
    const getMyGugu = async () => {
        const myInfo = await getMyInfo();
        const { mid, name: uname, face } = myInfo;
        Object.assign(myGugu.value, {
            mid, 
            uname,
            face,
            videoNum: 0,
            currentHaveVideoNum: -1,
        })
        // 获取我的视频信息
        const lengthData = await getGuguLength(myGugu.value);
        Object.assign(myGugu.value, {
            ...lengthData,
        });
        localStore.myGuguStore.setItem('myInfo', deepClone(myGugu.value));
    };

    const init = async () => {
        if (isInit) return;
        isInit = true;
        // 请求本地数据库
        console.log('开始初始化本地数据库')
        await initDB();
        // 开始获取个人的咕咕数据
        Promise.all([
            processMyData,
            processFollowsData,
        ])

        await getMyGugu();
        // 先获取 up 主的 id 列表
        await initUpGuguList();
        // 循环获取 up 视频数据
        for(let up of upGuguList.value) {
            await sleep(667);
            await updateGuguLength(up);
        }
    }
    // 处理个人的数据
    const processMyData = async () => {
        const myVideoList = [];
        const myMid = getMyMid();
        await Promise.all([
            // 获得个人咕咕数据
            localStore.guguStore.getItem(myMid).then(guguData => {
                if (!guguData) return;
                myGugu.value = guguData as UpGugu;
            }),
            // 如果本地有个人视频数据，加载到前端
            localStore.videosListStore.getItem(myMid).then(videoList => {
                if (!videoList) return;
                myVideoList.push(...(videoList as VideoInfo[]));
            })
        ])

        // 本地没有个人数据
        if (myGugu.value.mid === 0) {
            myGugu.value.mid = Number(getMyMid());
        }
        // 获取 我的 视频长度
        const myVideoLength = await getUpVideoNum(myGugu.value.mid);

        // 判断是否继续运行后面的代码
        const isContinue = await geiIsContinue();

        if (!isContinue) return;

        let newVideoList = [];

        while() {
            
            // 获取第一批视频的时候，拿到第一个视频
            // 和本地第一个视频做对比，
            
        }
        // 当本地有数据，且 newVideoList 的长度为 0 的时候，不运行下面的语句
        if (isPersistent && newVideoList.length === 0) return;

        myVideoList.unshift(...newVideoList);
        
        myGuguTimeList.value = formatVideosListToGuguTimeList(myVideoList);
        const guguDetails = getGuguDetails(myVideoList, myGuguTimeList.value);
        // 更新 我的 咕咕数据
        Object.assign(myGugu.value, {
            ...guguDetails,
        });
    }
    // 处理关注列表的数据
    const processFollowsData = () => {

    }

    const formatVideosListToGuguTimeList = (videoList: VideoInfo[]): GuguTimeInfo[] => {
        return videoList.map((video, index, arr) => {
            const { bvid, created } = video;
            // 定义 咕咕 的起始时间，默认是当前发布时间
            let start = created;
            // 咕咕 结束时间是当前视频发布时间
            const end = created;
            // 如果不是最后一个视频
            if (index !== arr.length - 1) {
                // 咕咕 起始时间是上一期视频发布时间
                start = arr[index + 1].created;
            }
            return {
                bvid,
                guguTime: end - start,
            };
        });
    }
    // 获取 up 咕咕三个数据
    const getGuguDetails = async (videoList: VideoInfo[], guguTimeList: GuguTimeInfo[]) => {
        const myVideoLength = videoList.length;
        // 计算三个数据 （第一次更新的时间，最后一次更新的时间，所有咕咕时间 ）
        const firstUploadTime = videoList[myVideoLength -1].created;
        const lastUploadTime = videoList[0].created;
        // 如果该 up 无视频 则拦截
        // 获取 最新咕咕时间
        const currentGuguLength = getCurrentGuguLength(lastUploadTime);
        // 获取 平均跟新频率
        const averageGuguLength = getAverageGuguLength(
            firstUploadTime,
            myVideoLength
        );
        // 获取 最大咕咕时间
        const maxGuguLength = getMaxGuguLength(
            guguTimeList,
            currentGuguLength
        );
        return {
            currentGuguLength,
            averageGuguLength,
            maxGuguLength
        }
    }

    const geiIsContinue = async () => {
        const isContinue = false;
        if ()
        // 获得我的第一个视频数据
        const vlist = await getOneGroupUpVideoInfo(myGugu.value.mid, 1, 1);
        
        if (vlist.length === 0) return isContinue;



        return isContinue;
    }

// -------------------------------------------------------------
    // 获得 初始发布时间，最后发布时间，和每个视频之间的间隔
    const getGuguTime = async (videoList: VideoInfo[]) => {
        let firstUploadTime: number;
        let lastUploadTime: number;
        const videoLazyLengthList: VideoLazyInfo[] = videoList.map((video, index, arr) => {
            const { bvid, created } = video;
            // 定义 咕咕 的起始时间，默认是当前发布时间
            let start = created;
            // 咕咕 结束时间是当前视频发布时间
            const end = created;
            // 如果是第一期视频
            if (!index) {
                lastUploadTime = end;
            }
            // 如果不是最后一个视频
            if (index !== arr.length - 1) {
                // 咕咕 起始时间是上一期视频发布时间
                start = arr[index + 1].created;
            }
            // 如果是最后一个视频
            else {
                firstUploadTime = start;
            }
            return {
                bvid,
                lazyValue: end - start,
            };
        });
        if (videoLazyLengthList.length === 1) firstUploadTime = lastUploadTime;
        return {
            // 第一次更新时间
            firstUploadTime,
            // 最后一次更新时间
            lastUploadTime,
            // 所有更新时间
            videoLazyLengthList,
        };
    };
    // 获取 up 咕咕三个数据
    const getGuguLength = async (up: UpGugu) => {
        // 先获取所有视频
        const videoList = await getUpAllVideosInfo(up);
        up.videoList = videoList;
        // 如果 没有视频，则返回
        if (!videoList.length) return;
        // 计算三个数据 （第一次更新的时间，最后一次更新的时间，所有咕咕时间 ）
        const { firstUploadTime, lastUploadTime, videoLazyLengthList } = await getGuguTime(videoList);
        // 如果该 up 无视频 则拦截
        if (!videoLazyLengthList.length) return;
        // 获取 最新咕咕时间
        const currentGuguLength = getCurrentGuguLength(lastUploadTime);
        // 获取 平均跟新频率
        const averageGuguLength = getAverageGuguLength(
            firstUploadTime,
            videoLazyLengthList.length
        );
        // 获取 最大咕咕时间
        const maxGuguLength = getMaxGuguLength(
            videoLazyLengthList,
            currentGuguLength
        );
        return {
            currentGuguLength,
            averageGuguLength,
            maxGuguLength
        }
    }
    // 更新 up 咕咕列表的三个数据
    const updateGuguLength = async (up: UpGugu) => {
        const {
            currentGuguLength,
            averageGuguLength,
            maxGuguLength
        } = await getGuguLength(up);
        // 更新 guguList
        return upGuguList.value.find((currentUp) => {
            if(currentUp.mid === up.mid) {
                Object.assign(currentUp, {
                    currentGuguLength,
                    averageGuguLength,
                    maxGuguLength,
                });
                // 存数据到本地数据库
                localStore.upGuguStore.setItem(`${up.mid}`, deepClone(currentUp)).then(value => {
                    console.log('存入了一条up主的信息', value);
                    console.log('当前的 dataStore');
                });
            }
            return currentUp.mid === up.mid
        })
    }
    // 初始化 咕咕 列表
    const initUpGuguList = async () => {
        // 每次获取到的列表的长度
        let resultLength = -1;
        // 当前的页面
        let currentPage = 1;
        // 开始不断地获取 up 主列表
        while (resultLength !== 0) {
            const followsList = await getOneGroupFollows(8212729, currentPage);
            // 提取出请求到的值地结果
            const result = followsList.map(({mid, uname, face}) => {
                const upInfo = {
                    mid, 
                    uname,
                    face,
                    currentGuguLength: undefined,
                    averageGuguLength: undefined,
                    maxGuguLength: undefined,
                    videoNum: 0,
                    currentHaveVideoNum: -1,
                    videoList: [],
                }
                return upInfo;
            });
            // 把结果塞到 up主 总列表中
            upGuguList.value.push(...result);
            resultLength = result.length;
            currentPage += 1;
            // 延迟 0.67秒，因为请求太频繁会被封 IP
            await sleep(667);
        }
        // 把这次获取到的 up 主都塞本地 followUpListStore 表里
        await Promise.all(upGuguList.value.map(upInfo => {
            return localStore.followUpListStore.setItem(
                String(upInfo.mid),
                deepClone(upInfo),
            )
        }))
    }
    // 获取 up 主全部视频信息的方法
    const getUpAllVideosInfo = async (up: UpGugu): Promise<VideoInfo[]>  => {
        // 获取 up 主制作的视频的数量
        let viedosInfoList = [];
        const num = await getUpVideoNum(up.mid);
        up.videoNum = num;
        // 如果没有视频的话，直接返回空数组
        if (!num) return viedosInfoList;
        up.currentHaveVideoNum = 0;
        // 获取的最多页数
        const time = Math.ceil(num / 50);
        // 当前获取的页数
        let currentPage = 1;
        // 当前获取的所有视频信息
        // up.progress = 0;
        // 当前页数少于最多页数时，请求数据
        console.warn(`一共有${num}个视频，需要请求${time}次`);
        while (currentPage <= time) {
            // 获取一批 up 主的视频信息，每组上限 50 个
            const newList = await getOneGroupUpVideoInfo(up.mid, currentPage);
            viedosInfoList.push(...newList);
            currentPage++;
            up.currentHaveVideoNum = viedosInfoList.length;
            // up.progress = Math.min(100, up.progress + 100 / time);
            await sleep(667);
        }
        return viedosInfoList;
    };
    // 获取距离最新视频咕咕了多久
    const getCurrentGuguLength = (lastUploadTime: number): number => {
        const currentTime = Date.now();
        const now = Math.ceil(currentTime / 1000);
        return now - lastUploadTime
    };
    // 获取平均咕咕多少天
    const getAverageGuguLength = (firstUploadTime: number, listLength: number): number => {
        const currentTime = Date.now();
        const now = Math.ceil(currentTime / 1000);
        const sum = now - firstUploadTime;
        const averageLazyValue = Math.ceil(sum / (listLength + 1));
        return averageLazyValue;
    };

    // 获取咕咕视频的最大值
    const getMaxGuguLength = (lazyLengthList: VideoLazyInfo[], currentLazyValue: number): number => {
        // 获取所有视频的咕咕天数
        const LazyValueList = lazyLengthList.map((item) => item.lazyValue);
        return Math.max(...LazyValueList, currentLazyValue);
    };

    // 对外暴露(全部 up 主的列表,)

    return {
        upGuguList,
        myGugu,
        getMyGugu,
        init
    }
}



