<template>
	<div>
		<!-- 按钮 -->
		<el-button @click="open">查看 up 咕咕数据</el-button>
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
			<GuguTable />
		</el-drawer>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onPageOpen } from '../utils/up-space-gugu';
import { useGugu } from '../utils/useGugu';
import databaseFactory from '../database';
import GuguTable from '../components/gugu-page/gugu-table.vue';
import { ElMessage } from 'element-plus';

const Database = databaseFactory();

const { init } = useGugu();

const visible = ref<boolean>(false);

// 给当前插件一个 id
let guguExtensionId = '';

onMounted(async () => {
	guguExtensionId = String(Date.now());
	// 连接 本地 数据库
	await Database.connect();
	// 给 up 主视频页面上的视频增加 咕咕数据 的显示
	onPageOpen();
});
window.addEventListener('beforeunload', e => {
	localStorage.setItem('active_gugu_extension_id', '');
});

// 打开遮罩层
const open = async () => {
	const activeGuguExtensionId = localStorage.getItem('active_gugu_extension_id');
	if (!activeGuguExtensionId) {
		localStorage.setItem('active_gugu_extension_id', guguExtensionId);
	} else if (activeGuguExtensionId !== guguExtensionId) {
		ElMessage.error('无法打开, 本功能仅支持在一个窗口使用');
		return;
	}
	document.getElementsByTagName('body')[0].style.overflow = 'hidden';
	// 继续请求观众数据
	visible.value = true;
	init();
};

// 关闭遮罩层
const handleClose = () => {
	// 要中断请求
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
.el-drawer__body {
	padding: 0 !important;
}
</style>
