<template>
	<div>
		<!-- 按钮区域 -->
		<div v-if="isBatchRequesting === ''">
			<div class="gugu-table__drawer__batch-operate">
				<el-button @click="batchFetchRemainGugu">一键获取剩余 up 主</el-button>
			</div>
			<div class="gugu-table__drawer__batch-operate">
				<el-button @click="batchRefreshGugu">一键刷新已获取 up 主</el-button>
			</div>
			<div class="gugu-table__drawer__batch-operate">
				<el-button @click="refreshFollowsGuguList">刷新关注的 up 主列表</el-button>
			</div>
		</div>
		<!-- 进度区域 -->
		<div v-else>
			<div class="gugu-table__drawer__batch-operate">
				<el-button type="danger" @click="isBatchRequesting = ''">终止获取</el-button>
			</div>

			<div v-if="remainGuguListLength !== -1" class="gugu-table__drawer__batch-operate">
				<div class="gugu-table__drawer__batch-operate">
					共需{{ batchType }}: {{ remainGuguListLength }} 个 up 主
				</div>
				<div class="gugu-table__drawer__batch-operate">
					当前{{ batchType }}: {{ currentDoneRemainNum }} 个 up 主
				</div>
				<div class="gugu-table__drawer__batch-operate">
					还需{{ batchType }}: {{ remainGuguListLength - currentDoneRemainNum }} 个 up 主
				</div>
			</div>

			<div v-if="batchFetchRemainGuguProgress !== -1" class="gugu-table__drawer__batch-operate">
				<el-progress
					:text-inside="true"
					:stroke-width="26"
					:percentage="batchFetchRemainGuguProgress"
					stroke-linecap="square"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { useGugu } from '../../utils/useGugu';

const {
	isBatchRequesting,
	batchFetchRemainGugu,
	batchRefreshGugu,
	refreshFollowsGuguList,
	remainGuguListLength,
	currentDoneRemainNum,
	batchFetchRemainGuguProgress,
} = useGugu();

const batchType = computed(() => {
	if (isBatchRequesting.value === '') return '';
	return isBatchRequesting.value === 'batchFetchRemainGugu' ? '获取' : '刷新';
});
</script>

<style lang="less">
.gugu-table__drawer__batch-operate {
	margin-top: 15px;
}
</style>
