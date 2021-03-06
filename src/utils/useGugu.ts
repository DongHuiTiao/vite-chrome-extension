import { computed, nextTick, Ref, ref, watch } from 'vue';
import { 
    getOneGroupFollows,
    getUpVideosNum,
    getOneGroupUpVideoInfo,
    getMyInfo,
    UpInfo,
    getMyFollowsNum,
} from './api/up';
import databaseFactory from './../database/index';
import { getMyMid } from './common';
import { VideoInfo, UpGugu, GuguLength, OneGroupVideoInfoCode } from './type';
import { ElMessage } from 'element-plus';
import requestQueueFactory from '../request-queue';
import { CancelType } from '../request-queue/type';
const Database = databaseFactory();

const RequestQueue = requestQueueFactory();


const initGugu = () => {
    // 获取当前 b 站用户 的 登录 mid
    const myMid = getMyMid();

    // 所有我关注的 up 的咕咕列表信息
    const followsGuguList: Ref<UpGugu[]> = ref<UpGugu[]>([]);
    const isLoading = ref<boolean>(true);
    // 我自己的咕咕信息
    const myGugu: Ref<UpGugu> = ref<UpGugu>({
        mid: 0, 
        uname: '',
        face: '',
        mtime: 0,
        currentGuguLength:undefined,
        averageGuguLength:undefined,
        maxGuguLength:undefined,
        videosNum: -1,
        currentHaveVideosNum: -1,
        guguLengthList: [],
    })

    let isInit = false;

    // 初始化方法
    const init = async () => {
        // 只初始化一次
        if (isInit) return;
        isInit = true;
        // 获取关注的 up 主的 咕咕信息
        await Promise.all([
            getFollowsGuguList(),
            getMyGugu()
        ])
        isLoading.value = false;
        isShowControlDrawer.value = true;
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
    const isLocalHasFollowsInfo = ref<boolean>(false);
    const myFollowsInfoNums = ref<number>(0);
    const currentHaveFollowsInfoNum = ref<number>(0);
    const getFollowsInfoListProgress = computed(() => {
        if (myFollowsInfoNums.value === 0) return 0;

        return (currentHaveFollowsInfoNum.value / myFollowsInfoNums.value * 100).toFixed(2);
    })

    // 获得我关注的 up 的 头像 昵称 Id
    const getAllFollowsInfoList = async (): Promise<UpInfo[]> => {
        myFollowsInfoNums.value = await getMyFollowsNum(myMid)

        const followsInfoList = [];
        // 每次获取到的列表的长度
        let resultLength = -1;
        // 当前的页面
        let currentPage = 1;
        // 开始不断地获取 up 主列表
        while (resultLength !== 0) {
            const oneGroupFollowsInfo = await getOneGroupFollows(Number(myMid), currentPage)
            followsInfoList.push(...oneGroupFollowsInfo);
            currentHaveFollowsInfoNum.value = followsInfoList.length;
            resultLength = oneGroupFollowsInfo.length;
            currentPage ++;
        }
        return followsInfoList;
    }

    // 获取我关注的 up 的 gugu 列表
    const getFollowsGuguList = async () => {
        // 查看本地的 followsIdList 是否为空
        let followsInfoList: UpInfo[] = await Database.localStore.followsInfoList.getItem(myMid);

        if (!followsInfoList) {
            await refreshFollowsGuguList();
            return;
        }
        await donefollowsGuguInfo(followsInfoList);
    }

    // 刷新关注列表
    const refreshFollowsGuguList = async () => {
        // 停止获取
        isBatchRequesting.value = '';
        isSingleRequesting.value = false;
        fetchMode.value = 'single';
        isLocalHasFollowsInfo.value = false;
        const followsInfoList = await getAllFollowsInfoList();
        await donefollowsGuguInfo(followsInfoList);
        currentHaveFollowsInfoNum.value = 0;
    }

    // 完成关注列表的处理
    const donefollowsGuguInfo = async (followsInfoList: UpInfo[]) => {
        isLocalHasFollowsInfo.value = true;
        await updateAllFollowsGugu(followsInfoList);
        refreshShowGuguList();
        // 更新本地数据
        await Database.localStore.followsInfoList.setItem(myMid, followsInfoList);
    }

    // 把所有本地的 up 主的咕咕信息显示到页面上
    const updateAllFollowsGugu = (followsInfoList: UpInfo[]) => {
        return Promise.all(followsInfoList.map((upInfo, index) => {
            return Database.localStore.videosListStore.getItem(String(upInfo.mid)).then(videosList => {
                const gugu = {
                    ...upInfo,
                    currentGuguLength:undefined,
                    averageGuguLength:undefined,
                    maxGuguLength:undefined,
                    videosNum: -1,
                    currentHaveVideosNum: -1,
                    guguLengthList: [],
                }
                // 如果有的话
                if (videosList) {
                    const {
                        currentGuguLength,
                        averageGuguLength,
                        maxGuguLength,
                        guguLengthList,
                    } = getGuguDetails(videosList as VideoInfo[]);
                    
                    Object.assign(gugu, {
                        currentGuguLength,
                        averageGuguLength,
                        maxGuguLength,
                        guguLengthList,
                        videosNum: guguLengthList.length,
                        currentHaveVideosNum: guguLengthList.length,
                    })
                }
                followsGuguList.value[index] = gugu;
            });
        }))
    }

    const isBatchRequesting = ref<string>('');
    const isSingleRequesting = ref<boolean>(false);
    const isNext = ref<boolean>(false);
    const fetchMode = ref<string>('single');
    // 获取 up 主全部视频信息的方法

    interface Result {
        type: string,
        videosList: VideoInfo[]
    }
    const getUpAllVideosList = async (mid: number, guguRef: UpGugu): Promise<Result>  => {
        try {
            // 获取 up 主制作的视频的数量
            let videosList = [];
            const num = await getUpVideosNum(mid);
            guguRef.videosNum = num;
            // 如果没有视频的话，直接返回空数组
            if (!num) {
                return {
                    type: 'continue',
                    videosList
                }
            };
            guguRef.currentHaveVideosNum = 0;

            // 获取的最多页数
            const time = Math.ceil(num / 50);
            // 当前获取的页数
            let currentPage = 1;
            // 当前页数少于最多页数时，请求数据
            while (currentPage <= time) {
                // 如果批量请求被终止了 或 单个请求被终止了
                
                    // 获取一批 up 主的视频信息，每组上限 50 个
                    const { code, newList } = await getOneGroupUpVideoInfo(Number(mid), currentPage)
                    if (code === OneGroupVideoInfoCode.Abnormal) {
                        continue;
                    }

                    guguRef.currentHaveVideosNum += newList.length;

                    videosList.push(...newList);
                    currentPage++;
                
                
            }
            return {
                type: 'continue',
                videosList
            }
        } catch (error) {
            if (error === CancelType.StopBatch || error === CancelType.StopSingle) {
                guguRef.videosNum = -1;
                guguRef.currentHaveVideosNum = -1;
                return {
                    type: 'stop',
                    videosList: [],
                };
            }
            if (error === CancelType.NextBatch) {
                guguRef.videosNum = -1;
                guguRef.currentHaveVideosNum = -1;
                isNext.value = false;
                return {
                    type: 'next',
                    videosList: [],
                };
            }
        }
    };

    // 获得视频列表差异
    const getVideosListDiff = async (mid: number, videosList: VideoInfo[]) => {
        try {
            const videosIdList = videosList.map(video => video.bvid);
            let isChange = false;
            // 每次获取到的列表的长度
            let resultLength = -1;
            // 当前的页面
            let currentPage = 1;
            let newVideosList = [];
            do {
                if (
                    fetchMode.value === 'batch' && !isBatchRequesting.value ||
                    fetchMode.value === 'single' && !isSingleRequesting.value
                ) {
                    return {
                        videosList: undefined,
                        isChange
                    };
                }
                const { code, newList } = await getOneGroupUpVideoInfo(Number(mid), currentPage);
                if (code === OneGroupVideoInfoCode.Abnormal) {
                    newVideosList.push('error');
                    continue;
                }
    
                resultLength = newList.length;
    
                currentPage += 1;
    
                newVideosList = newList.filter(video => {
                    return !videosIdList.includes(video.bvid);
                });
    
                if(newVideosList.length > 0) {
                    videosList.unshift(...newVideosList);
                    isChange = true;
                }
            } while (resultLength !==0 && newVideosList.length > 0 );

            return {
                videosList,
                isChange
            }
        } catch (error) {
            if (error === CancelType.StopBatch || error === CancelType.StopSingle) {
                return {
                    type: 'stop',
                    videosList: [],
                };
            }
            if (error === CancelType.NextBatch) {
                isNext.value = false;
                return {
                    type: 'next',
                    videosList: [],
                };
            }   
        }
    }
    const handlingMid = ref<number>(-1);
    // 将 up 主的 咕咕信息 加载到 前端
    const handleOneGugu = async (mid: number, guguRef: UpGugu) => {
        handlingMid.value = mid;
        // 查看本地是否有 gugu
        // 当前 up 在本地的视频列表
        let videosList: VideoInfo[] = await Database.localStore.videosListStore.getItem(String(mid));
        let isVideosListChange: boolean = false;
        // 如果本地没有 视频列表
        if (!videosList) {
            // 请求全部 videosList
            const result = await getUpAllVideosList(mid, guguRef);
            if (result.type === 'stop') {
                handlingMid.value = -1;
                return true;
            }

            if (result.type === 'next') {
                return false;
            }

            videosList = result.videosList;
            isVideosListChange = true;
        }
        else {
            // 计算 followsIdList 差量
            guguRef.videosNum = videosList.length;
            const {
                videosList: afterDiffList, 
                isChange,
                type
            } = await getVideosListDiff(mid, videosList);
            
            if (type === 'stop') {
                handlingMid.value = -1;
                return true;
            }

            if (type === 'next') {
                return false;
            }

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
            guguRef.videosNum = 0;
        }
        // 计算 gugu
        const guguInfo = getGuguDetails(videosList);
        // 更新 guguRef
        Object.assign(guguRef, guguInfo);
        handlingMid.value = -1;
        return false;
    }

    // 剩余需要获取的 up 主的数量
    const remainGuguListLength = ref<number>(-1);
    // 当前获取到了几个剩余的 up 主
    const currentDoneRemainNum = ref<number>(0);

    // 当前批量操作的进度, -1 则不显示进度条,表示没有进行批量操作
    const batchFetchRemainGuguProgress = computed(() => {
        // 如果不是批量操作,则不显示进度条
        if ( isBatchRequesting.value === '' || fetchMode.value === 'single' ) {
            return -1;
        }

        if (remainGuguListLength.value === -1) {
            return -1;
        }

        const progress = ((currentDoneRemainNum.value / remainGuguListLength.value) * 100).toFixed(2);
        return progress;
    })

    const isScrollToHandlingDom = ref<boolean>(false);
    // 批量获取剩余 up 主的咕咕信息
    const batchFetchRemainGugu = async () => {
        // 过滤出剩余没有获取数据的 up 主 数组
        const remainGuguList = followsGuguList.value.filter(up => {
            return up.videosNum === -1;
        });

        // 如果没有剩余的 up 主了,则返回
        if (remainGuguList.length === 0) {
            ElMessage.warning('已经全部获取完了');
            return;
        }

        // 调整状态
        isBatchRequesting.value = 'batchFetchRemainGugu';
        fetchMode.value = 'batch';

        // 共需要获取多少个 up 主
        remainGuguListLength.value = remainGuguList.length;

        // 当前已获取了多少个 up 主
        currentDoneRemainNum.value = 0;
        let isStop = false;
        // 逐个的获取 up 主信息
        for(let upGugu of remainGuguList) {
            // 判断是否需要跟踪 dom
            if (isScrollToHandlingDom.value) {
                scrollToHandlingDom(upGugu.mid);
            }
            isStop = await handleOneGugu(upGugu.mid, upGugu);

            if (isStop) {
                // 恢复默认状态
                fetchMode.value = 'single';
                break;
            }
            currentDoneRemainNum.value ++;
        };
        // 完成批量操作
        isBatchRequesting.value = '';
        isSingleRequesting.value = false;
        remainGuguListLength.value = -1;
        currentDoneRemainNum.value = 0;
        isScrollToHandlingDom.value = false;
        if (isStop) {
            ElMessage.warning('已终止批量获取');
        } else {
            handlingMid.value = -1;
            ElMessage.success('已完成全部 up 主的数据的获取了');
        }
        
    }

    // 批量刷新已获取的 up 主的咕咕信息
    const batchRefreshGugu = async () => {
        // 调整状态
        isBatchRequesting.value = 'batchRefreshGugu';
        fetchMode.value = 'batch';
        // 获得已获取信息的 up 主
        currentDoneRemainNum.value = 0;
        const doneGuguList = filterGuguList.value.filter(up => {
            return up.videosNum !== -1;
        });

        // 如果还没有已获取的 up 主, 则返回
        if (doneGuguList.length === 0) {
            return;
        }

        remainGuguListLength.value = doneGuguList.length;
        let isStop = false;
        for(let upGugu of doneGuguList) {
            if (isScrollToHandlingDom.value) {
                scrollToHandlingDom(upGugu.mid);
            }
           isStop = await handleOneGugu(upGugu.mid, upGugu);
            if (isStop) {
                // 恢复默认状态
                fetchMode.value = 'single';
                break;
            }
            currentDoneRemainNum.value ++;
        }
        // 完成批量操作
        isBatchRequesting.value = '';
        remainGuguListLength.value = -1;
        isSingleRequesting.value = false;
        currentDoneRemainNum.value = 0;
        if (isStop) {
            ElMessage.warning('已终止批量刷屏');
        } else {
            ElMessage.success('已刷新全部 up 主的数据');
        }
    }

    // 停止批量操作
    const handleBatch = (cancelType: CancelType) => {
        RequestQueue.cancelRequest(cancelType);
        if (cancelType === CancelType.StopBatch) {
            isBatchRequesting.value = '';
        }
        isScrollToHandlingDom.value = false;
    };

    // 视图跳转掉正在处理的 dom 上
    const scrollToHandlingDom = (mid: number) => {
        // 先获取视图区域的 dom
        const showResultDom = document.querySelector('.gugu-table__show-result');
        // 获取正在处理的 up 主的 dom
        const handlingDom = document.getElementById(`dht_${mid}`);
        // 如果没有找到的话，说明页面不够长，就扩展一下页面
        if (!handlingDom) {
            const handlingGuguIndex = filterGuguList.value.findIndex(up => up.mid === mid);
            showGuguListLength.value = handlingGuguIndex + 20;
            refreshShowGuguList();
            nextTick(()=> {
                scrollToHandlingDom(mid);
            })
            return;
        }
        // 获取正在处理的 up 主的dom 的高度
        const { offsetTop } = handlingDom;

        // 视图跳转过去
        showResultDom.scrollTo({
            top: offsetTop - 345,
            left: 0,
            behavior: 'smooth'
        });
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
                created,
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

    // 从本地的 indexedDB 中删除该 up 主的记录
    const deleteUpGugu = async (up: UpGugu) => {
        if (isBatchRequesting.value !== '') {
            ElMessage.error('无法删除, 请先取消批量操作');
            return;
        }
        if (handlingMid.value === up.mid) {
            ElMessage.error('正在更新该 up 的数据, 不可删除');
            return;
        }
        const upMid = String(up.mid);
        await Database.localStore.videosListStore.removeItem(upMid);

        Object.assign(up, {
            currentGuguLength:undefined,
            averageGuguLength:undefined,
            maxGuguLength:undefined,
            videosNum: -1,
            currentHaveVideosNum: -1,
            guguLengthList: [],
        })

        // 要显示通知
        ElMessage({
            message: '已从本地删除该 up 主的信息',
            type: 'success',
        })
    }

    // 抽屉相关的功能
    const isShowControlDrawer = ref<boolean>(false);

    const refreshOneUpGugu = async (up: UpGugu) => {
        if (handlingMid.value !== -1 && handlingMid.value !== up.mid) {
            ElMessage.error('正在获取其他 up 主数据, 请先取消再来获取');
            return false;
        }
        const mid = up.mid;
        isSingleRequesting.value = true;
        fetchMode.value = 'single';
        await handleOneGugu(mid, up);
        handlingMid.value = -1;
        isSingleRequesting.value = false;
        return true;
    }

    // 取消刷新
    
    const cancelRefresh = () => {
        RequestQueue.cancelRequest(CancelType.StopSingle);
        isSingleRequesting.value = false;
        isBatchRequesting.value = '';
    };
    // 排序相关
    const sortType = ref<'mtime' | 'currentGuguLength' | 'averageGuguLength' | 'maxGuguLength' | 'videosNum'>('mtime');
    // 是否加入自己
    const isAddSelf = ref<boolean>(false);
    // 排列顺序
    const sortOrder = ref<boolean>(false);

    // 是否隐藏还没有获取视频的 up 主
    const isHideUnFetchUp = ref<boolean>(false);

    // 是否获取没有视频的 up 主
    const isHideNoVideosUp = ref<boolean>(false);

    // 搜索框 up 主的文本框
    const userNameFilter = ref<string>('');

    const filterGuguList = computed<UpGugu[]>(() => {
        // 过滤掉搜索的部分
        let tempList = followsGuguList.value.slice().filter(up => {
            return up.uname.indexOf(userNameFilter.value) > -1;
        });
        // 隐藏没获取视频的 up 主
        if (isHideUnFetchUp.value) {
            tempList = tempList.filter(up => up.videosNum !== -1);
        }

        // 隐藏没有更新视频的 up 主
        if (isHideNoVideosUp.value) {
            tempList = tempList.filter(up => up.videosNum !== 0);
        }
    
        // 如果加入自己的数据
        if (isAddSelf.value) tempList.unshift(myGugu.value);
        // 如果不排序
        // if (!sortType.value) return tempList;
        // 如果排序
        const key = sortType.value;
        // 升序
        if (sortOrder.value) {
            return tempList.sort((a, b) => a[key] - b[key]);
        }
        // 降序
        return tempList.sort((a, b) => b[key] - a[key]);
    });

    watch([sortType, isAddSelf, sortOrder, userNameFilter, isHideUnFetchUp, isHideNoVideosUp], () => {
        refreshShowGuguList();
    })

    // 展示出来的 up 主列表
    const showGuguList: Ref<UpGugu[]> = ref<UpGugu[]>([]);

    // 展示出来的 up 主的数量
    const showGuguListLength: Ref<number> = ref<number>(100);

    const refreshShowGuguList = () => {
        showGuguList.value = filterGuguList.value.slice(0, showGuguListLength.value);
    }

    const loadMoreGuguList = () => {
        showGuguListLength.value += 100;
	    refreshShowGuguList();
    }
    // 是否展示抽屉
    const drawerVisible = ref<boolean>(false);
    return {
        drawerVisible,
        followsGuguList,
        showGuguList,
        loadMoreGuguList,
        getGuguDetails,
        deleteUpGugu,
        refreshOneUpGugu,
        init,
        isLoading,
        sortType,
        isAddSelf,
        sortOrder,
        userNameFilter,
        isShowControlDrawer,
        getFollowsInfoListProgress,
        isLocalHasFollowsInfo,
        isHideUnFetchUp,
        isHideNoVideosUp,
        isBatchRequesting,
        batchFetchRemainGugu,
        batchRefreshGugu,
        handleBatch,
        refreshFollowsGuguList,
        handlingMid,
        remainGuguListLength,
        currentDoneRemainNum,
        batchFetchRemainGuguProgress,
        isNext,
        isSingleRequesting,
        cancelRefresh,
        scrollToHandlingDom,
        isScrollToHandlingDom,
    }
}

const init = initGugu()

export const useGugu = () => init;
