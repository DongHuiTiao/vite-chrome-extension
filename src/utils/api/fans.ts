import { useFetch } from '../common'; 

const { jsonFetch } = useFetch();

export const fansApi = () => {
    // 获取一组观众数据的方法
    const getOneGroupFansInfo = async (lastId?) => {
        return jsonFetch(
            lastId ? 
                `https://member.bilibili.com/x/h5/data/fan/list?ps=500&last_id=${lastId}` :
                'https://member.bilibili.com/x/h5/data/fan/list?ps=500'
        )
    }
    return {
        getOneGroupFansInfo
    }
    // 获取互动榜前十
}