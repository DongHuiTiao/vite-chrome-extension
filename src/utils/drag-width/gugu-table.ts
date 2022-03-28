import { usePointer, useWindowSize } from '@vueuse/core';
import { reactive, ref, watch } from 'vue';
const { x, pressure } = usePointer();
const { width: windowWidth } = useWindowSize();

export interface GuguHeadConfig {
    key: string,
    index: number;
    leftPress: boolean;
    rightPress: boolean;
    width: number;
    minWidth: number;
    maxWidth: number;
}

export enum GuguHeadsName {
    index = '序号',
    avatar = '头像',
    nickName = '昵称',
    videosNum = '视频数量',
    currentGuguLength = '当前咕咕时长',
    averageGuguLength = '平均更新频率',
    maxGuguLength = '最大咕咕时长',
    operateArea = '操作区域',
}

const guguHeadsWidth = {
    index: 10,
    avatar: 10,
    nickName: 15,
    videosNum: 10,
    currentGuguLength: 15,
    averageGuguLength: 15,
    maxGuguLength: 15,
    operateArea: 10,
}

export const guguHeadsMap = reactive<{[key: string]: GuguHeadConfig}>({});

let index = 0
for (const key in guguHeadsWidth) {
    const width = guguHeadsWidth[key];
    guguHeadsMap[key] = {
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


export const guguHeadsList: GuguHeadConfig[] = reactive(Object.entries(guguHeadsMap).map((item) => {
    return item[1];
}))

export const pressuring = ref('')

let stopWatchX = null;
watch([pressure, pressuring], ([newPressure, newPressuring]) => {
	if (newPressure && newPressuring) {
		stopWatchX = watch(x, newX => {
			if (guguHeadsMap[newPressuring]?.rightPress) {
				changeRightConfigWidth(newX);
			}
            if (guguHeadsMap[newPressuring]?.leftPress) {
                changeLeftConfigWidth(newX);
            }
		});
	} else {
		if (stopWatchX) {
            stopWatchX();
            stopWatchX = null;
        } 
        if (newPressuring) {
            Object.assign(guguHeadsMap[newPressuring], {
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
    const index = guguHeadsMap[pressuring.value].index;
    if (index === guguHeadsList.length -1) {
        return;
    }
    let beforeWidthPercentage = 0;
    for (let i = 0; i < index; i++) {
        beforeWidthPercentage += guguHeadsList[i].width;
    }

    // 所有表头的宽度比例
	const guguTableHeadWidth = document.getElementById('gugu-table__head').clientWidth;
    // 前面表头的宽度长度
    const beforeWidths = guguTableHeadWidth * beforeWidthPercentage / 100;
    const originHeadWidth = guguHeadsMap[pressuring.value].width;
    const originHeadMaxWidth =  guguHeadsMap[pressuring.value].maxWidth;
    const originHeadMinWidth =  guguHeadsMap[pressuring.value].minWidth;
    
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

    const rightHead = guguHeadsList[index + 1];
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

	guguHeadsMap[pressuring.value].width = newHeadWidthPercentage;
    guguHeadsList[index + 1].width -= diff;
    getLastHeadWidth();
};

// 修改左边的宽度
const changeLeftConfigWidth = (newX: number) => {
    if (!pressuring.value) {
        return;
    }
    // 前面的表头的宽度
    const index = guguHeadsMap[pressuring.value].index;
    if (index === 0) {
        return;
    }
    // 所有表头的宽度比例
    let beforeWidthPercentage = 0;
    for (let i = 0; i <= index; i++) {
        beforeWidthPercentage += guguHeadsList[i].width;
    }

    // 整个表头的宽度
	const guguTableHeadWidth = document.getElementById('gugu-table__head').clientWidth;
    // 前面表头的宽度长度
    const beforeWidths = guguTableHeadWidth * beforeWidthPercentage / 100;
    const originHeadWidth = guguHeadsMap[pressuring.value].width;
    const originHeadMaxWidth =  guguHeadsMap[pressuring.value].maxWidth;
    const originHeadMinWidth =  guguHeadsMap[pressuring.value].minWidth;

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

    const leftHead = guguHeadsList[index - 1];
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

	guguHeadsMap[pressuring.value].width = newHeadWidthPercentage;
    guguHeadsList[index - 1].width -= diff;
    getLastHeadWidth();
}

const getLastHeadWidth = () => {
    let beforeWidth = 0;
    for (let i = 0; i < guguHeadsList.length - 1; i++) {
        beforeWidth += guguHeadsList[i].width;
    };
    guguHeadsList[guguHeadsList.length - 1].width = 100 - beforeWidth;
}