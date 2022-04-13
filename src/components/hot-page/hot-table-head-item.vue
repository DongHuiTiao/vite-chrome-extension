<template>
	<div
		class="hot-table-head__item"
		:style="{ width: getWidth(head) + '%' }"
		:class="{ 'hot-table-head__item--hover': isShowHover }"
		@mouseover="isHover = true"
		@mouseleave="isHover = false"
		@click="onHeadItemClick"
	>
		<div
			class="hot-table-head__item__gripper hot-table-head__item__gripper__left"
			@mousedown="mouseChange(MouseChangType.MouseDown, MouseChangePosition.Left)"
			@mouseup="mouseChange(MouseChangType.MouseUp, MouseChangePosition.Left)"
		>
			<div class="hot-table-head__item__gripper__string"></div>
			<div class="hot-table-head__item__gripper__string"></div>
		</div>
		<div class="hot-table-head__item__title">
			<div>{{ headsName[head] }}</div>
			<div v-if="isSortByThis" class="hot-table-head__item__title__order">
				<el-icon v-if="!sortOrder"><Bottom /></el-icon>
				<el-icon v-if="sortOrder"><Top /></el-icon>
			</div>
		</div>
		<div
			class="hot-table-head__item__gripper hot-table-head__item__gripper__right"
			@mousedown="mouseChange(MouseChangType.MouseDown, MouseChangePosition.Right)"
			@mouseup="mouseChange(MouseChangType.MouseUp, MouseChangePosition.Right)"
		>
			<div class="hot-table-head__item__gripper__string"></div>
			<div class="hot-table-head__item__gripper__string"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Bottom, Top } from '@element-plus/icons-vue';
import { useHotHead } from '../../utils/drag-width/hot-table';
import { useHot, SortType } from '../../utils/hooks/useHot';
const { sortType, sortOrder } = useHot();
const { headsMap, pressuring, headsName, availSortType, headsList } = useHotHead();

const allWidth = computed(() => {
	return headsList.reduce((pre, cur) => {
		pre += cur.width;
		return pre;
	}, 0);
});

const getWidth = (props: string) => {
	return (headsMap[props].width / allWidth.value) * 100;
};

interface IProps {
	head?: SortType;
}

// eslint-disable-next-line no-undef
const props = defineProps<IProps>();

const isSortByThis = computed(() => {
	return sortType.value === props.head;
});

const onHeadItemClick = () => {
	console.log('点击了', props.head, sortType.value);
	if (!availSortType.includes(props.head)) {
		return;
	}
	if (sortType.value === props.head) {
		sortOrder.value = !sortOrder.value;
		return;
	}
	sortType.value = props.head;
};

const isHover = ref<boolean>(false);

const isShowHover = computed(() => {
	if (pressuring.value && pressuring.value !== props.head) {
		return false;
	}
	return isHover.value || headsMap[props.head].leftPress || headsMap[props.head].rightPress;
});

enum MouseChangType {
	MouseDown,
	MouseUp,
}

enum MouseChangePosition {
	Left = 'leftPress',
	Right = 'rightPress',
}

const mouseChange = (type: MouseChangType, position: MouseChangePosition) => {
	pressuring.value = props.head;
	const isPressing = type === MouseChangType.MouseDown;
	headsMap[props.head][position] = isPressing;
};
</script>

<style lang="less">
.hot-table-head__item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	color: white;
	// padding: 3px;
	border-radius: 3px;
	user-select: none;
	overflow: hidden;
	height: 80%;
	transition: background-color 0.3s;
	&__title {
		display: flex;
		align-items: center;
		&__order {
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: #409eff;
			padding: 3px;
			margin-left: 6px;
			box-shadow: 0 0 3px 0px #4b3f3f;
		}
	}
	&--hover {
		.hot-table-head__item__gripper__string {
			display: block;
		}
		background-color: white;
		color: black;
	}

	&__gripper {
		display: flex;
		padding: 2px;
		cursor: pointer;
		&__string {
			display: none;
			width: 1px;
			height: 12px;
			background-color: rgb(226, 226, 226);
			margin-left: 1px;
		}
	}
}
</style>
