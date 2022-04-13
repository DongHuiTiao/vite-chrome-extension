import { usePointer, useWindowSize } from '@vueuse/core';
import { reactive, ref, watch } from 'vue';
const { x, pressure } = usePointer();
const { width: windowWidth } = useWindowSize();

export interface HeadConfig {
    key: string,
    index: number;
    leftPress: boolean;
    rightPress: boolean;
    width: number;
    minWidth: number;
    maxWidth: number;
}

interface HeadWidth {
    [key: string]: number
}

export const useHead = (headsWidth: HeadWidth, domId: string) => {
    const headsMap = reactive<{[key: string]: HeadConfig}>({});
    let index = 0
    for (const key in headsWidth) {
        const width = headsWidth[key];
        headsMap[key] = {
            key,
            index: index,
            leftPress: false,
            rightPress: false,
            width,
            minWidth: width - 5,
            maxWidth: 100,
        }
        index ++;
    }

    const headsList: HeadConfig[] = reactive(Object.entries(headsMap).map((item) => {
        return item[1];
    }))

    const pressuring = ref('')

    let stopWatchX = null;
    watch([pressure, pressuring], ([newPressure, newPressuring]) => {
        if (newPressure && newPressuring) {
            stopWatchX = watch(x, newX => {
                if (headsMap[newPressuring]?.rightPress) {
                    changeRightConfigWidth(newX);
                }
                if (headsMap[newPressuring]?.leftPress) {
                    changeLeftConfigWidth(newX);
                }
            });
        } else {
            if (stopWatchX) {
                stopWatchX();
                stopWatchX = null;
            } 
            if (newPressuring) {
                Object.assign(headsMap[newPressuring], {
                    leftPress: false,
                    rightPress: false,
                });
                pressuring.value = '';
            }
        }
    });

    // 修改右侧的宽度
    const changeRightConfigWidth = (newX: number) => {
        if (!pressuring.value) {
            return;
        }
        // 前面的表头的宽度
        const index = headsMap[pressuring.value].index;
        if (index === headsList.length -1) {
            return;
        }
        let beforeWidthPercentage = 0;
        for (let i = 0; i < index; i++) {
            beforeWidthPercentage += headsList[i].width;
        }

        // 所有表头的宽度比例
        const guguTableHeadWidth = document.getElementById(domId).clientWidth;
        // 前面表头的宽度长度
        const beforeWidths = guguTableHeadWidth * beforeWidthPercentage / 100;
        const originHeadWidth = headsMap[pressuring.value].width;
        const originHeadMaxWidth =  headsMap[pressuring.value].maxWidth;
        const originHeadMinWidth =  headsMap[pressuring.value].minWidth;
        
        // 计算当前新的宽度
        const newHeadWidth = newX - windowWidth.value * 0.1 - beforeWidths;
        // 计算当前宽度比例
        let newHeadWidthPercentage = (newHeadWidth / guguTableHeadWidth) * 100;

        // 如果小于最小宽度
        if (newHeadWidthPercentage < originHeadMinWidth) {
            newHeadWidthPercentage = originHeadMinWidth;
        }
        // 如果大于最大宽度
        if (newHeadWidthPercentage > originHeadMaxWidth) {
            newHeadWidthPercentage = originHeadMaxWidth;
        }

        const rightHead = headsList[index + 1];
        const rightHeadWidth = rightHead.width;
        const rightHeadMinWidth = rightHead.minWidth;
        const rightHeadMaxWidth = rightHead.maxWidth;

        let diff = newHeadWidthPercentage -  originHeadWidth;
        if (rightHeadWidth - diff < rightHeadMinWidth) {
            diff = rightHeadWidth - rightHeadMinWidth;
            newHeadWidthPercentage = originHeadWidth + diff;
        }

        if (rightHeadWidth - diff > rightHeadMaxWidth) {
            diff = rightHeadMaxWidth - rightHeadWidth;
            newHeadWidthPercentage = originHeadWidth - diff;
        }

        headsMap[pressuring.value].width = newHeadWidthPercentage;
        headsList[index + 1].width -= diff;
        getLastHeadWidth();
    };

    // 修改左边的宽度
    const changeLeftConfigWidth = (newX: number) => {
        if (!pressuring.value) {
            return;
        }
        // 前面的表头的宽度
        const index = headsMap[pressuring.value].index;
        if (index === 0) {
            return;
        }
        // 所有表头的宽度比例
        let beforeWidthPercentage = 0;
        for (let i = 0; i <= index; i++) {
            beforeWidthPercentage += headsList[i].width;
        }

        // 整个表头的宽度
        const guguTableHeadWidth = document.getElementById(domId).clientWidth;
        // 前面表头的宽度长度
        const beforeWidths = guguTableHeadWidth * beforeWidthPercentage / 100;
        const originHeadWidth = headsMap[pressuring.value].width;
        const originHeadMaxWidth =  headsMap[pressuring.value].maxWidth;
        const originHeadMinWidth =  headsMap[pressuring.value].minWidth;

        // 计算当前新的宽度
        const newHeadWidth = beforeWidths + windowWidth.value * 0.1 - newX;
        // 计算当前宽度比例
        let newHeadWidthPercentage = (newHeadWidth / guguTableHeadWidth) * 100;

        // 如果小于最小宽度
        if (newHeadWidthPercentage < originHeadMinWidth) {
            newHeadWidthPercentage = originHeadMinWidth;
        }
        // 如果大于最大宽度
        if (newHeadWidthPercentage > originHeadMaxWidth) {
            newHeadWidthPercentage = originHeadMaxWidth;
        }

        let diff = newHeadWidthPercentage -  originHeadWidth;

        const leftHead = headsList[index - 1];
        const leftHeadWidth = leftHead.width;
        const leftHeadMinWidth = leftHead.minWidth;
        const leftHeadMaxWidth = leftHead.maxWidth;

        if (leftHeadWidth - diff < leftHeadMinWidth) {
            diff = leftHeadWidth - leftHeadMinWidth;
            newHeadWidthPercentage = originHeadWidth + diff;
        }
        if (leftHeadWidth - diff > leftHeadMaxWidth) {
            diff = leftHeadMaxWidth - leftHeadWidth;
            newHeadWidthPercentage = originHeadWidth - diff;
        }

        headsMap[pressuring.value].width = newHeadWidthPercentage;
        headsList[index - 1].width -= diff;
        getLastHeadWidth();
    }

    const getLastHeadWidth = () => {
        let beforeWidth = 0;
        for (let i = 0; i < headsList.length - 1; i++) {
            beforeWidth += headsList[i].width;
        };
        headsList[headsList.length - 1].width = 100 - beforeWidth;
    }

    return {
        headsMap,
        headsList,
        pressuring,
    }
}






