import { sleep, getZodiac, getConstellation } from './common'; 
import { fansApi } from './api/fans'
import { ref, computed, watch } from 'vue';
// import { useRequest } from './useRequest';
// 获取一组观众数据的方法
const { getOneGroupFansInfo } = fansApi();
// const { addRequstHandle } = useRequest();
const initFans = () => {
    // 总观众量
    const allFansLength = ref<number>(1);
    // 当前获取的观众的数组
    const allFansInfo = ref([]);
    // 星座统计数据
    const constellationDataRate = computed(() => {
        const jsonData =  allFansInfo.value.reduce((result, current) => {
            const { constellation } = current;
            if (result[constellation]) {
                result[constellation]++ ;
            } else {
                result[constellation] = 1;
            }
            return result
        }, {});
        delete jsonData[''];
        return Object.keys(jsonData).map(item => {
            return {
                name: item,
                value: jsonData[item]
            }
        })
    })
    // 当前获取的观众的数量
    const currentGetFansLength = computed(()=>allFansInfo.value.length);
    // 当前是否全部获取完毕
    const isComplete = ref(false);
    // 预计时间
    const estimatedTime = computed(() => {
        // 剩余的观众长度
        const remainLength = allFansLength.value - currentGetFansLength.value;
        // 剩余的获取次数
        const remainTime = Math.ceil(remainLength / 500);
        
        // 一次请求预计的时间（秒）
        const oneTime = 10;
        return remainTime * oneTime;
    });
    // 流动中的预计时间
    const showRemainTime = ref<number>(0);
    watch(estimatedTime, (value)=> {
        showRemainTime.value = value;
    })
    // 启动预计时间流动
    const startRunRemainTime = () => {
        return setInterval(() => {
            showRemainTime.value --;
        }, 1000);
    }
    // 上一组中最后一个观众的 id
    let tempLastId = '';
    // 当前是否暂停请求所有观众
    const isPause = ref(false);
    // 暂停获取
    const pause = () => {
        isPause.value = true;
    }
    // 当前获取进度
    const progress = computed(()=>{
        return Math.floor((allFansInfo.value.length / allFansLength.value) * 100);
    })
    // TODO 参考的方案，根据当前返回的 my_followr 判断是否加载第一页的观众（by 我不知道啊啊真是的六 2022.1.1）
    // 获取所有观众数据的方法
    const getAllFansInfo = async () => {
        // 把暂停状态改成 false
        isPause.value = false;
        isComplete.value = false;
        // 上一组观众的信息
        let lastGroupFansInfo = [];
        // 启动预计时间流动
        const timer = startRunRemainTime();
        // 如果当前获取的观众数量，大于等于所有观众数量
        // 或 返回的 result 为 0
        while (
            allFansInfo.value.length < allFansLength.value ||
            lastGroupFansInfo.length > 0
        ) {
            // 如果需要暂停的话，就跳出循环
            if (isPause.value) break;
            try {
                // TODO 研究一下 continue 和 break 如何处理
                // addRequstHandle(async ()=>{
                const { data: {result, my_follower}, code } = await getOneGroupFansInfo(tempLastId);
                // 如果请求失败，则继续请求
                if(code === 20002) {
                    await sleep(667);
                    continue;
                }
                lastGroupFansInfo = result;

                result.forEach(element => {
                    element.zodiac = getZodiac(element.card.birthday);
                    element.constellation = getConstellation(element.card.birthday);
                });

                if(!lastGroupFansInfo.length) break;
                allFansLength.value = my_follower;
                tempLastId = lastGroupFansInfo[lastGroupFansInfo.length - 1].mtime_id;
                allFansInfo.value = allFansInfo.value.concat(lastGroupFansInfo);
                // })
                await sleep(3000);
            } catch (error) {
                await sleep(3000);
                continue;
            }
        }
        // 暂停预计时间的流动
        clearInterval(timer);
        // 获取完成
        isComplete.value = true;
        return allFansInfo.value;
    };
    // 过滤条件
    // 展示人数
    const showResultNum = ref<number>(100);
    // 符合条件的人数
    const qualifiedNum = ref<number>(0);
    // 性别
    const sex = ref<string>('');
    // 生日
    const birthday = ref<string>('');
    // 关注时间
    const followDate = ref([]);
    // 是否互粉
    const isEachOther = ref<boolean>(false);
    // 筛选用户昵称
    const userNameFilter = ref<string>('');

    // 排序
    const sortBy = ref<string>('');
    
    // 所有符合筛选和排序条件的用户信息
    const filterResult = computed(() => {
        // 拷贝一份当前获取到的所有观众的信息
        let list = [ ...allFansInfo.value ];
        // 根据筛选条件过滤用户
        const result = list.filter((item) => {
            // 如果选择器选择了性别，则过滤性别
            if(sex.value && (item.card.sex !== sex.value)) return false;
            // 如果选择器选择了生日，则过滤生日
            if(birthday.value) {
                const birthdayDate = new Date(birthday.value);
                const fansDate = new Date(item.card.birthday * 1000);
                if(birthdayDate.getMonth() !== fansDate.getMonth() || birthdayDate.getDate() !== fansDate.getDate()) return false;
            }
            // 如果选择了互粉
            if(isEachOther.value && (item.state !== 6)) return false;
            // 如果选择了关注时间的筛选，则过滤关注时间
            if(followDate.value?.length === 2) {
                const startTime = new Date(followDate.value[0]);
                const endTime = new Date(followDate.value[1])
                const fansFollowDate = new Date(item.mtime);
                if (fansFollowDate < startTime || fansFollowDate >= endTime) return false;
            }
            // 如果有用用户名筛选，则过滤用户名
            if (userNameFilter.value &&
                item.card.name.indexOf(userNameFilter.value) === -1
            ) {
                return false;
            }
            // 如果都符合条件，则保留下来
            return true;
        })
        qualifiedNum.value = result.length;
        if(!sortBy.value) return result;
        result.sort((a, b) => {
            // 如果选择了按观众数排序
            if(sortBy.value === 'fans') return b.follower - a.follower;
            // 如果选择了按关注时间排序
            if(sortBy.value === 'followTime') return new Date(a.mtime).getTime() - new Date(b.mtime).getTime();
            return 0;
        })
        return result;
    })

    // 显示的用户信息
    const showFilterResult = ref([]);

    // 刷新显示列表
    const refreshShowFansList = () => {
        showFilterResult.value = filterResult.value.slice(0, showResultNum.value);
    };

    /**
     * 用于计算某个时间区间内增长了多少关注
     * @param timeRange [start, end]
     */
    const getTimeRangeGrowFansLength = (timeRange: [number, number]) => {
        // 最终观众数量
        let result = 0;
        // 获取起始时间 和 结束时间
        const [start, end] = timeRange;
        for ( let { mtime } of allFansInfo.value) {
            // 观众的关注时间的时间戳
            const fansFollowTime = new Date(mtime).getTime();

            // 如果关注时间 迟于 结束时间，则继续往下查找
            if (fansFollowTime > end) continue;
            // 如果关注时间 早于 开始时间，则停止循环
            if (fansFollowTime < start) break;
            // 观众数量增加 1
            result++;
        }
        return result;
    }

    return {
        pause,
        allFansInfo,
        showResultNum,
        qualifiedNum,
        sex,
        birthday,
        followDate,
        isEachOther,
        progress,
        sortBy,
        currentGetFansLength,
        userNameFilter,
        showRemainTime,
        isComplete,
        getAllFansInfo,
        refreshShowFansList,
        getTimeRangeGrowFansLength,
        showFilterResult,
        constellationDataRate
    }
}

let instance = null;

const useFans = () => {
    if (instance) return instance;
    instance = initFans();
    return instance;
}

export { useFans } ;