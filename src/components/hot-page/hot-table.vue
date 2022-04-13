<template>
	<div>
		<div class="hot-table__show-result" :class="{ 'hot-table__show-result--open__control': isShowControlDrawer }">
			<!-- 表头 -->
			<HotTableHead />
			<!-- 表身 -->
			<div
				v-if="isLoading"
				v-loading="isLoading"
				:element-loading-svg="svg"
				element-loading-svg-view-box="-10, -10, 50, 50"
				element-loading-text="正在加载中, 请稍候..."
				class="hot-table__loading-follows custom-loading-svg"
			></div>
			<HotTableBody v-else />
			<!-- 控制区域 -->
		</div>
		<HotTableControl />
	</div>
</template>

<script setup lang="ts">
import HotTableHead from './hot-table-head.vue';
import HotTableBody from './hot-table-body.vue';
import HotTableControl from './hot-table-control.vue';
import { useHot } from '../../utils/hooks/useHot';

const { isLoading, isShowControlDrawer } = useHot();

const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;
</script>

<style lang="less">
.hot-table {
	&__show-result {
		height: 100vh;
		overflow: scroll;
		width: 100%;
		transition: width 0.3s;
		&--open__control {
			width: 79%;
		}
	}
	&__loading-follows {
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		color: #bbbbbb;

		&__text {
			margin-bottom: 30px;
		}
		&__progress {
			width: 72%;
		}
	}
}
/*修改滚动条样式*/
div::-webkit-scrollbar {
	width: 6px;
	height: 10px;
	/**/
}
div::-webkit-scrollbar-track {
	background: rgba(239, 239, 239, 0);
	border-radius: 2px;
}
div::-webkit-scrollbar-thumb {
	background: #bfbfbf;
	border-radius: 10px;
}
div::-webkit-scrollbar-thumb:hover {
	background: #333;
}
div::-webkit-scrollbar-corner {
	background: #179a16;
}
</style>
