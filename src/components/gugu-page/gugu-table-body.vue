<template>
	<ul v-infinite-scroll="loadMoreGuguList" :infinite-scroll-distance="100" :infinite-scroll-immediate="false">
		<li
			v-for="(up, index) in showGuguList"
			:key="index"
			class="flex align-center up-item"
			@click="toUpPage(up.mid)"
		>
			<!-- 序号 -->
			<div class="index" :style="{ width: guguHeadsMap['index'].width + '%' }">
				{{ index + 1 }}
			</div>
			<!-- 头像 -->
			<div class="avatar" :style="{ width: guguHeadsMap['avatar'].width + '%' }">
				<img v-lazy="up.face" class="up-item-img" alt="" />
			</div>
			<!-- 昵称 -->
			<div class="nick-name" :style="{ width: guguHeadsMap['nickName'].width + '%' }">{{ up.uname }}</div>
			<!-- 视频数量 -->
			<div class="videos-num" :style="{ width: guguHeadsMap['videosNum'].width + '%' }">
				{{ up.guguLengthList.length }}
			</div>
			<template v-if="up.videosNum === -1">
				<div>等待获取中</div>
			</template>
			<template v-else>
				<!-- TODO 如果 up 主在本地没数据，则用指引文案引导点击获取信息按钮 -->
				<div v-if="up.videosNum === 0" class="no-videos" :style="{ width: noVideosWidth }">
					这个 up 主还没有视频哦
				</div>
				<!-- up主有视频 -->
				<template v-else>
					<!-- 已经有了计算结果 -->
					<template v-if="up.currentGuguLength">
						<div class="current-gugu" :style="{ width: guguHeadsMap['currentGuguLength'].width + '%' }">
							{{ getTimeDiff(up.currentGuguLength) }}
						</div>
						<div class="average-gugu" :style="{ width: guguHeadsMap['averageGuguLength'].width + '%' }">
							{{ getTimeDiff(up.averageGuguLength) }}
						</div>
						<div class="max-gugu" :style="{ width: guguHeadsMap['maxGuguLength'].width + '%' }">
							{{ getTimeDiff(up.maxGuguLength) }}
						</div>
					</template>
					<!-- 没有结果，仍需获取和计算 -->
					<div v-else class="no-videos" :style="{ width: noVideosWidth }">
						<div>当前获取到的视频数量：{{ up.currentHaveVideosNum }}，共需要获取{{ up.videosNum }}</div>
						<el-progress
							:text-inside="true"
							:stroke-width="26"
							:percentage="getProgress(up.currentHaveVideosNum, up.videosNum)"
							stroke-linecap="square"
						/>
					</div>
				</template>
			</template>
			<!-- 操作区域 -->
			<div class="operate-area" :style="{ width: guguHeadsMap['operateArea'].width + '%' }">
				<!-- 加载按钮 -->
				<!-- TODO 用合适的方法替代 -->
				<el-button v-if="true" :icon="Download" size="small" circle @click.stop="refreshOneUpGugu(up)" />
				<!-- 刷新按钮 -->
				<el-button v-else :icon="Refresh" size="small" circle @click.stop="refreshOneUpGugu(up)" />
				<!-- 删除按钮 -->
				<el-popconfirm title="确认从本地删除该 up 主的信息吗?" @confirm="deleteUpGugu(up)">
					<template #reference>
						<el-button type="danger" :icon="Delete" circle size="small" />
					</template>
				</el-popconfirm>
			</div>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { useGugu } from '../../utils/useGugu';
import { getTimeDiff } from '../../utils/common/index';
import { Delete, Refresh, Download } from '@element-plus/icons-vue';
import { guguHeadsMap } from '../../utils/drag-width/gugu-table';
import { computed } from 'vue';

const { deleteUpGugu, refreshOneUpGugu, showGuguList, loadMoreGuguList } = useGugu();

const noVideosWidth = computed(() => {
	const width =
		guguHeadsMap.currentGuguLength.width + guguHeadsMap.averageGuguLength.width + guguHeadsMap.maxGuguLength.width;
	return width + '%';
});

// 计算视频列表获取进度
const getProgress = (currentNum: number, videosNum: number) => {
	if (videosNum === -1) {
		return 0;
	}

	if (videosNum === 0) {
		return 0;
	}

	return Number(((currentNum / videosNum) * 100).toFixed(2));
};

// 跳转到 up 主的页面
const toUpPage = (mid: number) => {
	window.open(`https://space.bilibili.com/${mid}/video`);
};
</script>

<style lang="less" scoped>
.gugu-table-body-col-style() {
	display: flex;
	align-items: center;
	justify-content: center;
}
.up-item {
	transition: background-color 0.5s;
	border-radius: 16px;
	padding: 12px;
	cursor: pointer;

	&-img {
		width: 63px;
		border-radius: 50%;
	}
	&:hover {
		background-color: #00a1d6b3;
	}
}
.no-videos {
	.gugu-table-body-col-style();
}
.index {
	.gugu-table-body-col-style();
}
.avatar {
	.gugu-table-body-col-style();
}
.nick-name {
	.gugu-table-body-col-style();
}
.videos-num {
	.gugu-table-body-col-style();
}
.current-gugu,
.average-gugu,
.max-gugu {
	.gugu-table-body-col-style();
}

.operate-area {
	.gugu-table-body-col-style();
}
</style>
