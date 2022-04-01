<template>
	<div>
		<!-- 如果正在获取初次加载 up 主的关注列表，则显示这个 -->
		<div v-if="!isLocalHasFollowsInfo" class="gugu-table__loading-follows">
			<div class="gugu-table__loading-follows__text">正在获取关注的 up 主列表</div>
			<div class="gugu-table__loading-follows__progress">
				<el-progress
					:text-inside="true"
					:stroke-width="26"
					:percentage="getFollowsInfoListProgress"
					stroke-linecap="square"
				/>
			</div>
		</div>
		<!-- 展示托更数据结果 -->
		<div v-else class="flex">
			<div
				class="gugu-table__show-result"
				:class="{ 'gugu-table__show-result--open__control': isShowControlDrawer }"
			>
				<!-- 表头 -->
				<GuguTableHead />
				<!-- 表身 -->
				<div
					v-if="isLoading"
					v-loading="isLoading"
					:element-loading-svg="svg"
					element-loading-svg-view-box="-10, -10, 50, 50"
					element-loading-text="正在加载中, 请稍候..."
					class="gugu-table__loading-follows custom-loading-svg"
				></div>
				<GuguTableBody v-else />
			</div>
			<!-- 控制区域 -->
			<GuguTableControl />
		</div>
	</div>
</template>

<script setup lang="ts">
import { useGugu } from '../../utils/useGugu';
import GuguTableHead from './gugu-table-head.vue';
import GuguTableControl from './gugu-table-control.vue';
import GuguTableBody from './gugu-table-body.vue';

const { isShowControlDrawer, getFollowsInfoListProgress, isLocalHasFollowsInfo, isLoading } = useGugu();

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
.gugu-table {
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
