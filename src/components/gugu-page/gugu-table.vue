<template>
	<div class="flex" @mousemove="drawerMouseMove" @mouseup="drawerMouseUp">
		<!-- 展示结果 -->
		<div class="show-result" :style="{ width: `${showResultAreaWidth}%` }">
			<!-- 表头 -->
			<div id="gugu-table-head" class="table-head flex align-center">
				<GuguTableHead v-for="(head, index) in guguHeadsList" :key="'head' + index" :head="head.key" />
			</div>
			<!-- 表身 -->
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
								<div>
									当前获取到的视频数量：{{ up.currentHaveVideoNum }}，共需要获取{{ up.videoNum }}
								</div>
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
		</div>
		<!-- 伸缩杠 -->
		<div class="width-handler" @mousedown="pressWidthHandle"></div>
		<!-- 控制区域 -->
		<div class="control">
			<el-divider content-position="left">排序</el-divider>
			<div><el-radio v-model="sortType" label="" size="large">不排序</el-radio></div>
			<div>
				<el-radio v-model="sortType" label="currentGuguLength" size="large">根据当前咕咕时间</el-radio>
			</div>
			<div>
				<el-radio v-model="sortType" label="averageGuguLength" size="large">根据平均咕咕时间</el-radio>
			</div>
			<div>
				<el-radio v-model="sortType" label="maxGuguLength" size="large">根据最大咕咕时间</el-radio>
			</div>
			<div><el-radio v-model="sortType" label="videoNum" size="large">根据视频数量</el-radio></div>

			<el-divider content-position="left">是否降序排序</el-divider>
			<el-switch v-model="sortOrder" />

			<el-divider content-position="left">是否加入自己的数据</el-divider>
			<el-switch v-model="isAddSelf" />

			<el-divider content-position="left">搜索 up 主</el-divider>
			<el-input v-model="userNameFilter" size="mini"></el-input>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, onBeforeMount } from 'vue';
import { useGugu } from '../../utils/useGugu';
import { getTimeDiff } from '../../utils/common/index';
import { Delete, Refresh } from '@element-plus/icons-vue';
import GuguTableHead from './gugu-table-head.vue';
import { guguHeadsList } from '../../utils/drag-width/gugu-table';
console.log(guguHeadsList);
const {
	deleteUpGugu,
	refreshOneUpGugu,
	showGuguList,
	loadMoreGuguList,
	sortType,
	isAddSelf,
	sortOrder,
	userNameFilter,
} = useGugu();

const windowWidth = ref<number>(0);
const mousePositionWidth = ref<number>(0);

const drawerWidth = computed(() => {
	return windowWidth.value * 0.9;
});

const showResultAreaWidth = computed(() => {
	if (!mousePositionWidth.value) return 70;
	// 抽离距离左边窗口的宽度
	const blockWidth = windowWidth.value - drawerWidth.value;
	// 鼠标距离窗口左边的宽度
	const mouseToDrawerBorderWidth = mousePositionWidth.value - blockWidth;
	const proportion = Math.floor((mouseToDrawerBorderWidth / drawerWidth.value) * 100);

	return proportion;
});
const onResize = e => {
	windowWidth.value = e.currentTarget.innerWidth;
};

window.addEventListener('resize', onResize);
onBeforeMount(() => {
	windowWidth.value = document.body.clientWidth;
});
onUnmounted(() => {
	window.removeEventListener('resize', onResize);
});

// 是否按着 width-handler
const isPressWidthHandler = ref<boolean>(false);
// 按下 width-handler 的时候
const pressWidthHandle = () => {
	isPressWidthHandler.value = true;
};
// 鼠标在抽屉页面移动的时候
const drawerMouseMove = e => {
	if (isPressWidthHandler.value) {
		const { clientX } = e;
		mousePositionWidth.value = clientX;
	}
};
const drawerMouseUp = () => {
	isPressWidthHandler.value = false;
};

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
.show-result {
	height: 98vh;
	overflow: scroll;
}
.width-handler {
	width: 8px;
	cursor: pointer;
	transition: background-color 0.3s;
	&:hover {
		background-color: #65acf5;
	}
	&:active {
		cursor: ew-resize;
		background-color: #778ca191;
	}
	// -webkit-touch-callout: none;
	// -webkit-user-select: none;
	// -khtml-user-select: none;
	// -moz-user-select: none;
	// -ms-user-select: none;
	user-select: none;
}
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

.control {
	padding: 0 30px;
}
.table-head {
	position: sticky;
	top: 0;
	background-color: #0000007d;
	color: white;
	width: 100%;
	height: 45px;
}
.operate-area {
}
</style>
