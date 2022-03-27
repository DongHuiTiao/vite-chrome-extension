<template>
	<div
		class="gugu-table-head__item"
		:style="{ width: guguHeadsMap[head].width + '%' }"
		:class="{ 'gugu-table-head__item--hover': isShowHover }"
		@mouseover="isHover = true"
		@mouseleave="isHover = false"
	>
		<div
			class="gugu-table-head__item__gripper gugu-table-head__item__gripper__left"
			@mousedown="mouseChange(MouseChangType.MouseDown, MouseChangePosition.Left)"
			@mouseup="mouseChange(MouseChangType.MouseUp, MouseChangePosition.Left)"
		>
			<div class="gugu-table-head__item__gripper__string"></div>
			<div class="gugu-table-head__item__gripper__string"></div>
		</div>
		<div class="gugu-table-head__item__title">
			<div>{{ GuguHeadsName[head] }}</div>
			<div v-if="isSortByThis" class="gugu-table-head__item__title__order">
				<el-icon v-if="!sortOrder"><Bottom /></el-icon>
				<el-icon v-if="sortOrder"><Top /></el-icon>
			</div>
		</div>
		<div
			class="gugu-table-head__item__gripper gugu-table-head__item__gripper__right"
			@mousedown="mouseChange(MouseChangType.MouseDown, MouseChangePosition.Right)"
			@mouseup="mouseChange(MouseChangType.MouseUp, MouseChangePosition.Right)"
		>
			<div class="gugu-table-head__item__gripper__string"></div>
			<div class="gugu-table-head__item__gripper__string"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { guguHeadsMap, pressuring, GuguHeadsName } from '../../utils/drag-width/gugu-table';
import { useGugu } from '../../utils/useGugu';
import { Bottom, Top } from '@element-plus/icons-vue';

const { sortType, sortOrder } = useGugu();

// eslint-disable-next-line no-undef
const props = defineProps({
	head: {
		type: String,
		default: '',
	},
});

const isSortByThis = computed(() => {
	return sortType.value === props.head;
});

const isHover = ref<boolean>(false);

const isShowHover = computed(() => {
	if (pressuring.value && pressuring.value !== props.head) {
		return false;
	}
	return isHover.value || guguHeadsMap[props.head].leftPress || guguHeadsMap[props.head].rightPress;
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
	guguHeadsMap[props.head][position] = isPressing;
};
</script>

<style lang="less">
.gugu-table-head__item {
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
			margin-left: 3px;
			border-radius: 3px;
			border: 1px solid black;
		}
	}
	&--hover {
		.gugu-table-head__item__gripper__string {
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
