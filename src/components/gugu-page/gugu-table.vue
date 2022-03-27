<template>
	<div class="flex">
		<!-- 展示托更数据结果 -->
		<div class="gugu-table__show-result" :class="{ 'gugu-table__show-result--open__control': isShowControlDrawer }">
			<!-- 表头 -->
			<GuguTableHead />
			<!-- 表身 -->
			<GuguTableBody />
		</div>
		<!-- 控制区域 -->
		<GuguTableControl />
	</div>
</template>

<script setup lang="ts">
import { useGugu } from '../../utils/useGugu';
import GuguTableHead from './gugu-table-head.vue';
import GuguTableControl from './gugu-table-control.vue';
import GuguTableBody from './gugu-table-body.vue';

const { isShowControlDrawer } = useGugu();
</script>

<style lang="less">
.gugu-table {
	&__show-result {
		height: 98vh;
		overflow: scroll;
		width: 100%;
		transition: width 0.3s;
		&--open__control {
			width: 79%;
		}
	}
}
</style>
