import { useFetch } from '../common'; 

const { jsonFetch } = useFetch();

export const videoApi = () => {
    // 获取当前 up 主视频数量的接口
    const getUpVideoNum = (mid: number) => {
        return fetch(`https://api.bilibili.com/x/space/navnum?mid=${mid}`, {
            "mode": "cors",
            "credentials": "omit"
        }).then(res=>res.json()).then(res=>{
            return res.data.video
        })
    }
    // 获取当前所有视频信息的接口
    const getOneGroupUpVideoInfo = (mid: number, page: number) => {
        return jsonFetch(`https://api.bilibili.com/x/space/arc/search?mid=${mid}&ps=50&tid=0&pn=${page}&keyword=&order=pubdate&jsonp=jsonp`)
            
    }
    return {
        getUpVideoNum,
        getOneGroupUpVideoInfo,
    }
}