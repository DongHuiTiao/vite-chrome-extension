<template>
	<!-- TODO 优化样式 -->
	<div>
		<!-- 按钮 -->
		<el-button @click="open">粉丝列表</el-button>
		<!-- 抽屉 -->
		<el-drawer
			:model-value="visible"
			direction="rtl"
			size="90%"
			:with-header="false"
			:before-close="handleClose"
			:modal-append-to-body="false"
			:append-to-body="true"
		>
			<div class="flex">
				<ResultList style="width: 78%" />
				<FilterControlVue style="width: 22%" />
			</div>
		</el-drawer>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFans } from '../utils/useFans';
import FilterControlVue from '../components/fans-list/filter-control.vue';
import ResultList from '../components/fans-list/result-list.vue';

const { pause, getAllFansInfo } = useFans();

// const { getUpAllVideosInfo } = useVideo();
const visible = ref<boolean>(false);
// 打开遮罩层
const open = async () => {
	document.getElementsByTagName('body')[0].style.overflow = 'hidden';
	// 继续请求粉丝数据
	visible.value = true;
	getAllFansInfo();
};
// 关闭遮罩层
const handleClose = () => {
	// 要中断请求
	pause();
	visible.value = false;
	document.getElementsByTagName('body')[0].style.overflow = '';
};
</script>

<style lang="less">
.flex {
	display: flex;
}
.align-center {
	align-items: center;
}
</style>
