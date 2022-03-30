
import { UpGugu, VideoInfo } from '../type';
import databaseFactory from '../../database/index';
import { getTimeDiff } from '../common/index';
import SpaceGugu from '../../components/gugu-page/up-space/space-gugu.vue';
import { createApp, ref } from 'vue';
import { useGugu } from './../useGugu';

const Database = databaseFactory();
const { getGuguDetails } = useGugu(); 
export const isOpen = ref<boolean>(false);

enum IsOpenState {
    True = 'true',
    False = '',
}

// 改变是否展示个人页面的咕咕功能
export const changIsOpen = (isOpen: boolean): void => {
	if (isOpen) {
		// 页面上渲染出来
		onLoad();
        localStorage.setItem('is_open', IsOpenState.True);
		return;
	}
	// 关闭页面上的东西
	removeGuguTag();
    removeVideosListListener();
    localStorage.setItem('is_open', IsOpenState.False);
};

// 组件刚刚加载完的时候运行
export const onPageOpen = () => {
    // 页面发生变化的时候触发 onLoad 事件
    if (!localStorage.getItem('is_open')) {
        localStorage.setItem('is_open', IsOpenState.False);
    }
    const localIsOpen = Boolean(localStorage.getItem('is_open'));
    // 获取本地 isOpen 状态
    isOpen.value = localIsOpen;
    addGuguDom();

    if (isOpen.value) {
        onLoad();
    }
}
const addGuguDom = () => {
    const dom = document.querySelector('.h-gradient');
    const newElement =document.createElement('div');
    newElement.id = 'space-gugu';
    dom.append(newElement);

    const spaceGuguDom = createApp(SpaceGugu as any);
    spaceGuguDom.mount('#space-gugu');
}

// 检查是否是因为 hover 事件导致的 视频列表更新
const getIsHoverGuguData = (coverElement: Element): boolean => {
    if (coverElement.className !== 'cover') {
        return false;
    }

    const isHoverGuguData = [...coverElement.children].find(dom => {
        const { className, children } = dom;
        if (
            className !== ''
            && children.length === 0
            && children[0].className !== 'insert__gugu-data'
        ) {
            return false;
        }
        return true;
    })

    return !!isHoverGuguData;
}

// 视频列表还没有更新完的时候,不运行 刷新咕咕数据功能
let stopContinue = null;

// TODO 这个可以做一期视频
// 视频列表发生变化,则运行这个函数
const onVideosListChange = async (e: any) => {
    const isHoverGuguData = getIsHoverGuguData(e.path[1]);

    if (isHoverGuguData) {
        return;
    }

    if (stopContinue) {
        stopContinue(false);
    }
    let isContinue = false;
    // 拦截代码，如果触发了下一次 DomNodeInserted 时间，就阻塞后面运行
    try {
        isContinue = await new Promise((resolve, reject) => {
            stopContinue = reject;
            setTimeout(() => {
                resolve(true);
            }, 500);
        });

    } catch (error) {
        console.log(error); 
    }

    if (!isContinue) return;

    onLoad();
}

// 增加视频列表变化的监听器
const addVideosListListener = () => {
    if (!isOpen.value) {
        return;
    }

    const dom = document.querySelector('.s-space');
    if (dom) {
        dom.addEventListener('DOMNodeInserted', onVideosListChange);
    }
}

// 移除视频列表变化的监听器
const removeVideosListListener = () => {
    const dom = document.querySelector('.s-space');
    if (dom) {
        dom.removeEventListener('DOMNodeInserted', onVideosListChange);
    }
}

// 当前页面 up 主的咕咕信息,用于查看进度条和显示数据
export const upGugu = ref<UpGugu>({
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

// 刷新咕咕数据
export const onLoad = async () => {
    removeGuguTag();
    // 查看本地是否有 up 主 的 gugu 数据
    removeVideosListListener();
    const upMid = getUpMid();
    upGugu.value.mid = Number(upMid);
    const localVideosList: VideoInfo[] = await Database.localStore.videosListStore.getItem(upMid);
    if (localVideosList) {
        // 把每个视频的 拖更时间 插入到 dom 中
        // 把三个 gugu 数据展示到页面上
        const upGuguData = getGuguDetails(localVideosList);
        Object.assign(upGugu.value, {
            videosNum: upGuguData.guguLengthList.length,
            currentHaveVideosNum: upGuguData.guguLengthList.length,
            ...upGuguData
        });
        insertGuguDataToDom(upGuguData);
        addVideosListListener();
        return;
    }
}

// 获取当前 up 主的 mid
const getUpMid = (): string => {
    const url = window.location.href;
    const reg = /\/(\d+)(\/)?/;
    const upMid = url.match(reg)[1];
    return upMid;
}

type GetGuguDetails = typeof getGuguDetails;
type UpGuguData = ReturnType<GetGuguDetails>

// 把计算好的 up 主的托更数据显示到页面上
const insertGuguDataToDom = (upGuguData: UpGuguData) => {
    // 获取当页的 dom 列表
    const videosDomList = [...document.getElementsByClassName('small-item fakeDanmu-item')];
    const guguLengthMap = upGuguData.guguLengthList.reduce((pre, guguInfo) => {
        pre[guguInfo.bvid] = guguInfo.guguLength;
        return pre;
    }, {})

    for (const videoDom of videosDomList) {
        // 视频的 bvid
        const bvid = (videoDom as any).dataset.aid;
       
        const guguLength = guguLengthMap[bvid];

        if (guguLength !== undefined) {
            showVideoGuguTag(videoDom, guguLength);
        }
        
    }
}

// 移除掉 咕咕信息 相关的 dom
export const removeGuguTag = () => {
    const doms = document.querySelectorAll('.insert__gugu-data');
    for(const dom of doms) {
        dom.remove();
    }
}

// 将某一个视频的托更时长插入到视频 dom
const showVideoGuguTag = (videoDom: Element, guguLength: number) => {
    const newElement = document.createElement('div');
    newElement.innerHTML = `
        <div
            class="insert__gugu-data"
            style='
                position: absolute;
                height: 100%;
                width: 100%;
                background-color: #000000ba;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                top: 0;
                color: white;
                font-size: 16px;
            '
        >
            <div style='margin-bottom: 10px;'>本视频咕咕了</div>
            <div>${getTimeDiff(guguLength)}</div>
        </div>
    `;
    const dom = videoDom.children[0];

    dom.append(newElement);
}
