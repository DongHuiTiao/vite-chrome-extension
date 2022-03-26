/**
 * 开启定时器检查视频列表是否加载
 * 如果视频列表加载了，查看本地是否有该 up 主的 gugu 数据
 * 如果有 gugu 数据的话
    * 获取视频列表的元素
    * 遍历 插入 dom 显示 咕咕 数据
 * 如果没有 gugu 数据
 *    增加一个刷新咕咕数据的 按钮
 *    点击按钮，调用 useGugu 里的逻辑把up的视频数据和计算结果存到本地
 *    再调用刚刚 有gugu 数据的情况
 */
import { UpGugu } from '../type';
import databaseFactory from '../../database/index';
import { getTimeDiff } from '../common/index';
import SpaceGuguSwitch from '../../components/up-space/gugu-page/up-space/space-gugu-switch.vue';
import SpaceGuguProgress from '../../components/up-space/gugu-page/up-space/space-gugu-progress.vue';
import { createApp, ref } from 'vue';
import { useGugu } from './../useGugu';

const Database = databaseFactory();
const { getUpAllVideosList, getGuguDetails } = useGugu(); 
export const isOpen = ref<boolean>(false);

enum IsOpenState {
    True = 'true',
    False = '',
}

export const changIsOpen = (isOpen: boolean): void => {
	if (isOpen) {
		// 页面上渲染出来
		onLoad();
        localStorage.setItem('is_open', IsOpenState.True);
		return;
	}
	// 关闭页面上的东西
	removeGuguTag();
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
    addVideosListListener();
    addSwitch();

    if (isOpen.value) {
        onLoad();
    }
}

const addSwitch = () => {
    const dom = document.querySelector('.be-tab-inner.clearfix');
    const newElement =document.createElement('li');
    newElement.classList.add('be-tab-item');
    newElement.id = 'space-gugu-switch'
    
    dom.append(newElement);
    const spaceGuguSwitch = createApp(SpaceGuguSwitch as any);

    spaceGuguSwitch.mount('#space-gugu-switch')
}

const addProgress = () => {
    const dom = document.querySelector('.be-tab-inner.clearfix');
    const newElement =document.createElement('li');
    newElement.classList.add('be-tab-item');
    newElement.id = 'space-gugu-progress';
    newElement.style.display = 'flex';
    // width
    // aligncenter
    // mini
    Object.assign(newElement.style, {
        display: 'flex',
        width: '233px',
        height: '28px',
        alignCenter: 'center',
    })
    dom.append(newElement);
    const spaceGuguProgress = createApp(SpaceGuguProgress as any);
    spaceGuguProgress.mount('#space-gugu-progress');
    console.log('运行了吗，addProgress')
}

const removeProgress = () => {
    document.getElementById('space-gugu-progress').remove();
}

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


let stopContinue = null;

// 当视频列表发生变动时运行的函数
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
    // 判断页面上是否有显示 gugu 内容
    if (document.getElementById('space-gugu-guguLength')) {
        removeGuguTag();
    }
    onLoad();
}

const addVideosListListener = () => {
    if (!isOpen.value) {
        return;
    }

    const dom = document.querySelector('.clearfix.cube-list');
    dom.addEventListener('DOMNodeInserted', onVideosListChange);
}

const removeVideosListListener = () => {
    const dom = document.querySelector('.clearfix.cube-list');
    dom.removeEventListener('DOMNodeInserted', onVideosListChange);
}

export const upGugu = ref<UpGugu>({
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

// 页面加载完时运行
export const onLoad = async () => {
    // removeGuguTag();
    // 查看本地是否有 up 主 的 gugu 数据
    removeVideosListListener();
    const upMid = getUpMid();
    const upGuguData: UpGugu = await Database.localStore.guguStore.getItem(upMid);
    if (upGuguData) {
        // 把每个视频的 拖更时间 插入到 dom 中
        // 把三个 gugu 数据展示到页面上
        insertGuguDataToDom(upGuguData as UpGuguData);
        addVideosListListener();
        return;
    }
    // 开始请求数据, 显示进度条
    addProgress();

    // 获得用户的视频
    const videosList = await getUpAllVideosList(Number(upMid), upGugu.value);
    
    removeProgress();

    await Database.localStore.videosListStore.setItem(upMid, videosList);
    // 获得咕咕数据
    const guguInfo = getGuguDetails(videosList);
    // 把数据存到本地
    await Database.localStore.guguStore.setItem(upMid, guguInfo);
    insertGuguDataToDom(guguInfo);
    addVideosListListener();
}

const getUpMid = (): string => {
    const url = window.location.href;
    const reg = /\/(\d+)\//;
    const upMid = url.match(reg)[1];
    return upMid;
}

type GetGuguDetails = typeof getGuguDetails;
type UpGuguData = ReturnType<GetGuguDetails>

// 把计算好的 up 主的托更数据显示到页面上
const insertGuguDataToDom = (upGuguData: UpGuguData) => {

    // 插入三个数据到 dom 中
    showUpGuguTag(upGuguData);

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

export const removeGuguTag = () => {
    const doms = document.querySelectorAll('.insert__gugu-data');
    for(const dom of doms) {
        dom.remove();
    }
    document.getElementById('space-gugu-guguLength').remove()
}

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

const showUpGuguTag = (upGuguData: UpGuguData) => {
    const { 
        currentGuguLength, 
        maxGuguLength, 
        averageGuguLength 
    } = upGuguData;
    // 找到 dom
    const dom = document.querySelector('.be-tab-inner.clearfix');
    const newElement =document.createElement('li');
    // newElement.classList.add('be-tab-item');
    newElement.id = 'space-gugu-guguLength';

    newElement.innerHTML = `
        <li 
            class="be-tab-item" 
            style="position: relative;"
        >
            <div 
                style="
                    position: absolute;
                    width: 249px;
                    top: -18px;
                "
            >
                <div 
                    style="
                        height: 21px;
                        display: flex;
                        align-items: center;
                        user-select: none;
                    "
                >   
                    当前咕咕时长 
                    <span 
                        style="
                            color: #0085ff;
                            margin: 0 10px;
                            font-weight: 600;
                        "
                    >
                        ${getTimeDiff(currentGuguLength)}
                    </span>
                    天
                </div>
                <div 
                    style="
                        height: 21px;
                        display: flex;
                        align-items: center;
                        user-select: none;
                    "
                >
                    平均更新频率 
                    <span 
                        style="
                            color: #0c9508;
                            margin: 0 10px;
                            font-weight: 600;
                        "
                    >
                        ${getTimeDiff(averageGuguLength)} 
                    </span>
                    天
                </div>
                <div 
                    style="
                        height: 21px;
                        display: flex;
                        align-items: center;
                        user-select: none;
                    "
                >
                    最多咕咕时长 
                    <span 
                        style="
                            color: #ea0000;
                            margin: 0 10px;
                            font-weight: 600;
                        "
                    >
                        ${getTimeDiff(maxGuguLength)}
                    </span>
                    天
                </div>
            </div>
        </li>
    `;
    // 插入 数据 到 dom
    dom.append(newElement);
}