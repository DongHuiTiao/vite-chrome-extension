import { createApp } from "vue";
import HotRankButton from './../../components/hot-page/hot-rank-button.vue';

export const onPageOpen = () => {

    // 给个人空间页增加头部 dom
    addHotDom();

    // initCurrentUpInfo();

    //     onLoad();
}

const addHotDom = () => {
    const dom = document.querySelector('.nav-tabs');
    // 如果页面还没加载出来
    if (!dom) {
        setTimeout(() => {
            addHotDom();
        }, 100);
        return;
    }

    const newElement =document.createElement('div');
    newElement.id = 'hot-rank-button';
    dom.append(newElement);

    const spaceGuguDom = createApp(HotRankButton as any);
    spaceGuguDom.mount('#hot-rank-button');
}