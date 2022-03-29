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
			<GuguTable />
		</el-drawer>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { onPageOpen } from '../utils/up-space-gugu';
import { useGugu } from '../utils/useGugu';
import databaseFactory from '../database';
import GuguTable from '../components/gugu-page/gugu-table.vue';

const Database = databaseFactory();

const { drawerVisible } = useGugu();

onMounted(async () => {
	// 连接 本地 数据库
	await Database.connect();
	// 给 up 主视频页面上的视频增加 咕咕数据 的显示
	onPageOpen();
});
window.addEventListener('beforeunload', e => {
	localStorage.setItem('active_gugu_extension_id', '');
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
