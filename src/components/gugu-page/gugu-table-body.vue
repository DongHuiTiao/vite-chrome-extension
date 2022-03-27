<template>
	<ul v-infinite-scroll="loadMoreGuguList" :infinite-scroll-distance="100" :infinite-scroll-immediate="false">
		<li
			v-for="(up, index) in showGuguList"
			:key="index"
			class="flex align-center up-item"
			@click="toUpPage(up.mid)"
		>
			<!-- 序号 -->
			<div class="index">
				{{ index + 1 }}
			</div>
			<!-- 头像 -->
			<div class="avatar">
				<img v-lazy="up.face" class="up-item-img" alt="" />
			</div>
			<!-- 昵称 -->
			<div class="nick-name">{{ up.uname }}</div>
			<!-- 视频数量 -->
			<div class="videos-num">{{ up.guguLengthList.length }}</div>
			<template v-if="up.videoNum === -1">
				<div>等待获取中</div>
			</template>
			<template v-else>
				<div v-if="up.videoNum === 0">这个 up 主还没有视频哦</div>
				<!-- up主有视频 -->
				<template v-else>
					<!-- 已经有了计算结果 -->
					<template v-if="up.currentGuguLength">
						<div class="current-gugu">{{ getTimeDiff(up.currentGuguLength) }}</div>
						<div class="average-gugu">{{ getTimeDiff(up.averageGuguLength) }}</div>
						<div class="max-gugu">{{ getTimeDiff(up.maxGuguLength) }}</div>
					</template>
					<!-- 没有结果，仍需获取和计算 -->
					<div v-else style="width: 75%">
						<div>当前获取到的视频数量：{{ up.currentHaveVideoNum }}，共需要获取{{ up.videoNum }}</div>
						<el-progress
							:text-inside="true"
							:stroke-width="26"
							:percentage="getProgress(up.currentHaveVideoNum, up.videoNum)"
							stroke-linecap="square"
						/>
					</div>
				</template>
			</template>
			<!-- 操作区域 -->
			<div class="operate-area">
				<!-- 加载按钮 -->
				<!-- 刷新按钮 -->
				<el-button :icon="Refresh" size="small" circle @click.stop="refreshOneUpGugu(up)" />
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
import { Delete, Refresh } from '@element-plus/icons-vue';

const { deleteUpGugu, refreshOneUpGugu, showGuguList, loadMoreGuguList } = useGugu();

// 计算视频列表获取进度
const getProgress = (currentNum: number, videoNum: number) => {
	// const formatVideoNum = videoNum === -1 ? 0 : videoNum;
	if (videoNum === -1) {
		return 0;
	}

	if (videoNum === 0) {
		return 0;
	}

	return Number(((currentNum / videoNum) * 100).toFixed(2));
};

// 跳转到 up 主的页面
const toUpPage = (mid: number) => {
	window.open(`https://space.bilibili.com/${mid}/video`);
};
</script>

<style lang="less">
.up-item {
	transition: background-color 0.5s;
	border-radius: 16px;
	cursor: pointer;

	&-img {
		width: 63px;
		border-radius: 50%;
	}
	&:hover {
		background-color: #00a1d6b3;
	}
}
.index {
	width: 51px;
}
.avatar {
	width: 100px;
}
.nick-name {
	width: 10%;
}
.videos-num {
	width: 11%;
}
.current-gugu,
.average-gugu,
.max-gugu {
	width: 18%;
}

.operate-area {
	width: 10%;
}
</style>
