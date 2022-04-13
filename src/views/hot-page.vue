<template>
	<div>
		<!-- 抽屉 -->
		<el-drawer
			:model-value="drawerVisible"
			direction="rtl"
			size="90%"
			:with-header="false"
			:before-close="handleClose"
			:modal-append-to-body="false"
			:append-to-body="true"
		>
			<HotTable />
		</el-drawer>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import HotTable from '../components/hot-page/hot-table.vue';
import { useHot } from '../utils/hooks/useHot';
import { onPageOpen } from '../utils/hot-page';

const { drawerVisible } = useHot();

onMounted(async () => {
	onPageOpen();
});

// 关闭遮罩层
const handleClose = () => {
	// 要中断请求
	drawerVisible.value = false;
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
.el-drawer__body {
	padding: 0 !important;
}
</style>
