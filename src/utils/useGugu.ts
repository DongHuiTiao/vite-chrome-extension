import { Ref, ref } from 'vue';
import { 
    getOneGroupFollows,
    getUpVideoNum,
    getOneGroupUpVideoInfo,
    getMyInfo,
    UpInfo,
} from './api/up';
import databaseFactory from './../database/index';
import requestQueueFactory from './../request-queue/index'; 
import { getMyMid } from './common';
import { VideoInfo, UpGugu, GuguLength, OneGroupVideoInfo, OneGroupVideoInfoCode } from './type';

const Database = databaseFactory();
const RequestQueue = requestQueueFactory();

export const useGugu = () => {
    // 获取当前 b 站用户 的 登录 mid
    const myMid = getMyMid();

    // 我关注的 up 的咕咕列表信息
    const followsGuguList: Ref<UpGugu[]> = ref<UpGugu[]>([]);

    // 我自己的咕咕信息
    const myGugu: Ref<UpGugu> = ref<UpGugu>({
        mid: 0, 
        uname: '',
        face: '',
        currentGuguLength:undefined,
        averageGuguLength:undefined,
        maxGuguLength:undefined,
        videoNum: -1,
        currentHaveVideoNum: -1,
        guguLengthList: [],
    })

    let isInit = false;

    // 初始化方法
    const init = async () => {
        // 只初始化一次
        if (isInit) return;
        isInit = true;
        // 获取关注的 up 主的 咕咕信息
        getFollowsGuguList();
        getMyGugu();
    }

    // 获取我的 gugu 数据
    const getMyGugu = async () => {
        const myInfo = await getMyInfo(myMid);
        const { mid, name: uname, face } = myInfo;
        Object.assign(myGugu.value, {
            mid, 
            uname,
            face
        });
        handleOneGugu(Number(myMid), myGugu.value);
    };

    // 获得我关注的 up 的 头像 昵称 Id
    const getAllFollowsInfoList = async (): Promise<UpInfo[]> => {
        const followsInfoList = [];
        // 每次获取到的列表的长度
        let resultLength = -1;
        // 当前的页面
        let currentPage = 1;
        // 开始不断地获取 up 主列表
        while (resultLength !== 0) {
            const oneGroupFollowsInfo = await RequestQueue.reaquest<UpInfo[]>(
                () => getOneGroupFollows(Number(myMid), currentPage)
            )
            followsInfoList.push(...oneGroupFollowsInfo);
            resultLength = oneGroupFollowsInfo.length;
            currentPage ++;
        }
        return followsInfoList;
    }

    // 计算关注 up 列表的差量
    const getFollowsInfoListDiff = async (followsInfoList: UpInfo[]) => {
        const followsIdList = followsInfoList.map(upInfo => upInfo.mid);
        let isChange = false;
        // 每次获取到的列表的长度
        let resultLength = -1;
        // 当前的页面
        let currentPage = 1;
        let newFollowsInfoList = [];
        do {
            const oneGroupFollowsInfo = await RequestQueue.reaquest<UpInfo[]>(
                () => getOneGroupFollows(Number(myMid), currentPage)
            );

            resultLength = oneGroupFollowsInfo.length;

            currentPage += 1;

            newFollowsInfoList = oneGroupFollowsInfo.filter(upInfo => {
                return !followsIdList.includes(upInfo.mid);
            });

            // 如果有新关注
            if(newFollowsInfoList.length > 0) {
                followsInfoList.unshift(...newFollowsInfoList);
                isChange = true;
            }
        } while (resultLength !==0 && newFollowsInfoList.length > 0 );

        return {
            followsInfoList,
            isChange
        }
    }

    // 获取我关注的 up 的 gugu 列表
    const getFollowsGuguList = async () => {
        // 查看本地的 followsIdList 是否为空
        let followsInfoList: UpInfo[] = await Database.localStore.followsInfoList.getItem(myMid)

        if (!followsInfoList) {
            // 请求全部 follows
            followsInfoList = await getAllFollowsInfoList();
        }
        else {
            // 计算 followsIdList 差量
            const {
                followsInfoList: afterDiffList, 
                isChange
            } = await getFollowsInfoListDiff(followsInfoList);

            if(isChange) {
                followsInfoList = afterDiffList;
            }
        }
        // 更新本地数据
        await Database.localStore.followsInfoList.setItem(myMid, followsInfoList);

        // 初始化 followsGuguList
        followsGuguList.value = followsInfoList.map(upInfo => {
            return {
                ...upInfo,
                currentGuguLength:undefined,
                averageGuguLength:undefined,
                maxGuguLength:undefined,
                videoNum: -1,
                currentHaveVideoNum: -1,
                guguLengthList: [],
            }
        })

        for(let upGugu of followsGuguList.value) {
            await handleOneGugu(upGugu.mid, upGugu);
        }
    }

    // 获取 up 主全部视频信息的方法
    const getUpAllVideosList = async (mid: number, guguRef: UpGugu): Promise<VideoInfo[]>  => {
        // 获取 up 主制作的视频的数量
        let viedosInfoList = [];
        const num = await RequestQueue.reaquest<number>(
           () => getUpVideoNum(mid),
        )
        guguRef.videoNum = num;
        // 如果没有视频的话，直接返回空数组
        if (!num) return viedosInfoList;
        guguRef.currentHaveVideoNum = 0;

        // 获取的最多页数
        const time = Math.ceil(num / 50);
        // 当前获取的页数
        let currentPage = 1;
        // 当前页数少于最多页数时，请求数据
        while (currentPage <= time) {
            // 获取一批 up 主的视频信息，每组上限 50 个
            const { code, newList } = await RequestQueue.reaquest<OneGroupVideoInfo>(
                () => getOneGroupUpVideoInfo(Number(mid), currentPage)
            );
            if (code === OneGroupVideoInfoCode.Abnormal) {
                continue;
            }

            guguRef.currentHaveVideoNum += newList.length;

            viedosInfoList.push(...newList);
            currentPage++;
        }
        return viedosInfoList;
    };

    // 获得视频列表差异
    const getVideosListDiff = async (mid: number, videosList: VideoInfo[]) => {
        const videosIdList = videosList.map(video => video.bvid);
        let isChange = false;
        // 每次获取到的列表的长度
        let resultLength = -1;
        // 当前的页面
        let currentPage = 1;
        let newVideosList = [];
        do {
            const { code, newList } = await RequestQueue.reaquest<OneGroupVideoInfo>(
                () => getOneGroupUpVideoInfo(Number(mid), currentPage)
            );
            
            if (code === OneGroupVideoInfoCode.Abnormal) {
                newVideosList.push('error');
                continue;
            }

            resultLength = newList.length;

            currentPage += 1;

            newVideosList = newList.filter(video => {
                return !videosIdList.includes(video.bvid);
            });

            // 如果有新关注
            if(newVideosList.length > 0) {
                videosList.unshift(...newVideosList);
                isChange = true;
            }
        } while (resultLength !==0 && newVideosList.length > 0 );

        return {
            videosList,
            isChange
        }
    }

    // 将 up 主的 咕咕信息 加载到 前端
    const handleOneGugu = async (mid: number, guguRef: UpGugu) => {
        // 查看本地是否有 gugu
        const upGugu = await Database.localStore.guguStore.getItem(String(mid));
        // 如果有的话
        if (upGugu) {
            Object.assign(guguRef, upGugu as UpGugu)
        }
        // 当前 up 在本地的视频列表
        let videosList: VideoInfo[] = await Database.localStore.videosListStore.getItem(String(mid));
        let isVideosListChange: boolean = false;
        // 如果本地没有 视频列表
        if (!videosList) {
            // 请求全部 videosList
            videosList = await getUpAllVideosList(mid, guguRef);
            isVideosListChange = true;
        }
        else {
            // 计算 followsIdList 差量
            guguRef.videoNum = videosList.length;
            const {
                videosList: afterDiffList, 
                isChange
            } = await getVideosListDiff(mid, videosList);
            
            if(isChange) {
                isVideosListChange = true;
                videosList = afterDiffList;
            }
        }
        // 如果视频列表发生了改变
        if (isVideosListChange) {
            // 存到本地数据库
            await Database.localStore.videosListStore.setItem(String(mid), videosList);
        }
        if (videosList.length === 0) {
            guguRef.videoNum = 0;
        }
        // 计算 gugu
        const guguInfo = getGuguDetails(videosList);
        console.log(guguInfo, 'guguInfo')
        // 更新本地的 gugu
        await Database.localStore.guguStore.setItem(String(mid), guguInfo);
        // 更新 guguRef
        Object.assign(guguRef, guguInfo);
    }

    // 获取 up 咕咕三个数据
    const getGuguDetails = (videosList: VideoInfo[]) => {
        const result = {
            currentGuguLength: 0,
            averageGuguLength: 0,
            maxGuguLength: 0,
            guguLengthList: [],
        }
        const videosListLength = videosList.length;
        // 如果该 up 无视频 则拦截
        if (videosListLength === 0) {
            return result;
        } 
        // 计算三个数据 （第一次更新的时间，最后一次更新的时间，所有咕咕时间 ）
        const firstUploadTime = videosList[videosListLength -1].created;
        const lastUploadTime = videosList[0].created;
        // 获取 最新咕咕时间
        const currentGuguLength = getCurrentGuguLength(lastUploadTime);
        // 获取 平均跟新频率
        const averageGuguLength = getAverageGuguLength(
            firstUploadTime,
            videosList.length,
        );
        const guguLengthList = getGuguLengthList(videosList);
        // 获取 最大咕咕时间
        const maxGuguLength = getMaxGuguLength(
            guguLengthList,
            currentGuguLength
        );

        Object.assign(result, {
            currentGuguLength,
            averageGuguLength,
            maxGuguLength,
            guguLengthList,
        })
        return result;
    }

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

    // 获取每一期视频各自咕了多长时间
    const getGuguLengthList = (videoslist: VideoInfo[]) => {
         const guguLengthList =  videoslist.map((video, index, arr) => {
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
            // 如果是最后一个视频
            return {
                bvid,
                guguLength: end - start,
            };
        });

        return guguLengthList;
    }

    // 获取最长咕咕了多长时间
    const getMaxGuguLength = (guguLengthList: GuguLength[], currentGuguLength: number) => {
        const formatNumberList = guguLengthList.map(item => item.guguLength);

        return Math.max(...formatNumberList, currentGuguLength);
    }
    
    return {
        followsGuguList,
        getUpAllVideosList,
        getGuguDetails,
        myGugu,
        init
    }
}
