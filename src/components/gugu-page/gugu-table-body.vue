<template>
	<ul
		v-infinite-scroll="loadMoreGuguList"
		:infinite-scroll-distance="100"
		:infinite-scroll-immediate="false"
		@mousewheel="onMouseWheel"
	>
		<li
			v-for="(up, index) in showGuguList"
			:id="`dht_${up.mid}`"
			:key="index"
			class="flex align-center up-item"
			:class="{ loading: handlingMid === up.mid }"
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
			<!-- 关注日期 -->
			<div class="mtime" :style="{ width: guguHeadsMap['mtime'].width + '%' }">
				{{ formatDateToChinese(up.mtime) }}
			</div>
			<!-- 视频数量 -->
			<div
				v-if="up.videosNum !== -1"
				class="videos-num"
				:style="{ width: guguHeadsMap['videosNum'].width + '%' }"
			>
				{{ up.videosNum }}
			</div>
			<template v-if="up.videosNum === -1">
				<!-- 引导用户点击获取按钮 -->
				<div class="no-videos" :style="{ width: noVideosNumWidth }">
					点击 那里的 👉 <el-icon><Download /></el-icon> 即可获取 up 主咕咕数据
				</div>
			</template>
			<template v-else>
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
						<div style="width: 100%">
							<div>当前获取到的视频数量：{{ up.currentHaveVideosNum }}，共需要获取{{ up.videosNum }}</div>
							<el-progress
								:text-inside="true"
								:stroke-width="26"
								:percentage="getProgress(up.currentHaveVideosNum, up.videosNum)"
								stroke-linecap="square"
							/>
						</div>
					</div>
				</template>
			</template>
			<!-- 操作区域 -->
			<div class="operate-area" :style="{ width: guguHeadsMap['operateArea'].width + '%' }">
				<!-- 加载按钮 -->
				<el-button
					v-if="handlingMid !== up.mid"
					:icon="up.videosNum === -1 ? Download : Refresh"
					size="small"
					circle
					@click.stop="refreshOneUpGugu(up)"
				/>
				<!-- 取消按钮 -->
				<el-button
					v-else
					:icon="CircleClose"
					size="small"
					circle
					type="warning"
					@click.stop="cancelRefresh"
				></el-button>
				<!-- 跳过按钮 -->
				<el-tooltip
					v-if="isBatchRequesting !== '' && handlingMid === up.mid"
					class="box-item"
					effect="dark"
					content="跳过这个 up 主, 计算下一个 up 主"
					placement="top"
				>
					<el-button
						type="primary"
						:icon="Bottom"
						circle
						size="small"
						@click.stop="handleBatch(CancelType.NextBatch)"
					/>
				</el-tooltip>
				<!-- 删除按钮 -->
				<el-popconfirm
					v-else-if="up.videosNum !== -1 && up.currentHaveVideosNum === up.videosNum"
					title="确认从本地删除该 up 主的信息吗?"
					@confirm="deleteUpGugu(up)"
				>
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
import { getTimeDiff, formatDateToChinese } from '../../utils/common/index';
import { Delete, Refresh, Download, CircleClose, Bottom } from '@element-plus/icons-vue';
import { guguHeadsMap } from '../../utils/drag-width/gugu-table';
import { computed } from 'vue';
import { ElMessage } from 'element-plus';
import { CancelType } from '../../request-queue/type';
const {
	deleteUpGugu,
	refreshOneUpGugu,
	showGuguList,
	loadMoreGuguList,
	handlingMid,
	cancelRefresh,
	isBatchRequesting,
	isScrollToHandlingDom,
	handleBatch,
} = useGugu();

const onMouseWheel = () => {
	if (isScrollToHandlingDom.value) {
		isScrollToHandlingDom.value = false;
		ElMessage.info('你滑动了，那我不跟踪啦');
	}
};

const noVideosWidth = computed(() => {
	const width =
		guguHeadsMap.currentGuguLength.width + guguHeadsMap.averageGuguLength.width + guguHeadsMap.maxGuguLength.width;
	return width + '%';
});

const noVideosNumWidth = computed(() => {
	const width =
		guguHeadsMap.videosNum.width +
		guguHeadsMap.currentGuguLength.width +
		guguHeadsMap.averageGuguLength.width +
		guguHeadsMap.maxGuguLength.width;
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
	height: 100px;
	cursor: pointer;

	&-img {
		width: 63px;
		border-radius: 50%;
	}
	&:hover {
		background-color: #00a1d6b3;
	}
}
@keyframes loading {
	0% {
		background-color: rgba(0, 0, 0, 0);
	}
	45% {
		background-color: rgba(72, 255, 0, 0.616);
	}
	55% {
		background-color: rgba(72, 255, 0, 0.616);
	}
	100% {
		background-color: rgba(0, 0, 0, 0);
	}
}
.loading {
	animation: loading 1.8s infinite;
}
.no-videos {
	.gugu-table-body-col-style();
	color: #cecdcd;
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
.mtime {
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
