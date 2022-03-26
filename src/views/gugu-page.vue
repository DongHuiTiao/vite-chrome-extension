<template>
	<!-- TODO 优化样式 -->
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
			<div class="flex" @mousemove="drawerMouseMove" @mouseup="drawerMouseUp">
				<!-- 展示结果 -->
				<div class="show-result" :style="{ width: `${showResultAreaWidth}%` }">
					<!-- 表头 -->
					<div class="table-head flex align-center">
						<div class="index">序号</div>

						<!-- 点击头像跳转到 up 主个人页面 -->
						<div class="avatar">头像</div>
						<div class="nick-name">昵称</div>

						<!-- TODO 最新更新时间 -->
						<!-- 鼠标覆盖上去后，可以显示视频封面标题 -->

						<div class="videos-num">视频数量</div>

						<div class="current-gugu">当前咕咕时长</div>
						<div class="average-gugu">平均更新频率</div>
						<div class="max-gugu">最多咕咕时长</div>
						<!-- TODO 加一个操作区域 -->
						<div class="operate-area">操作区域</div>
					</div>
					<!-- 表身 -->
					<div
						v-for="(up, index) in showUpList"
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
							<img class="up-item-img" :src="up.face" alt="" />
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
							<el-button :icon="Refresh" circle @click.stop="refreshUpGugu(up)" />
							<!-- 删除按钮 -->
							<el-popconfirm title="确认从本地删除该 up 主的信息吗?" @confirm="deleteUpGugu(up)">
								<template #reference>
									<el-button type="danger" :icon="Delete" circle />
								</template>
							</el-popconfirm>
						</div>
					</div>
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
		</el-drawer>
	</div>
</template>

<script setup lang="ts">
// TODO 把组件抽出去，单独维护
import { ref, computed, onUnmounted, onBeforeMount, onMounted } from 'vue';
import { onPageOpen } from '../utils/up-space-gugu';
import { useGugu } from '../utils/useGugu';
import databaseFactory from '../database';
import { getTimeDiff } from '../utils/common/index';
import { Delete, Refresh } from '@element-plus/icons-vue';

const Database = databaseFactory();

const { followsGuguList, myGugu, init, deleteUpGugu, refreshUpGugu } = useGugu();

onMounted(async () => {
	// 连接 本地 数据库
	await Database.connect();
	// 给 up 主视频页面上的视频增加 咕咕数据 的显示
	onPageOpen();
	// TODO 在 UP 主的个人空间页点击到视频列表时，加载显示视频托更时间国能
});
// 是否打开遮罩层
const visible = ref<boolean>(false);

// 排序相关
const sortType = ref<'' | 'currentGuguLength' | 'averageGuguLength' | 'maxGuguLength' | 'videoNum'>('');
// 是否加入自己
const isAddSelf = ref<boolean>(false);
// 排列顺序
const sortOrder = ref<boolean>(false);

const userNameFilter = ref<string>('');

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
const showUpList = computed(() => {
	const tempList = followsGuguList.value.slice().filter(up => {
		return up.uname.indexOf(userNameFilter.value) > -1;
	});

	if (isAddSelf.value) tempList.unshift(myGugu.value);
	if (!sortType.value) return tempList;
	const key = sortType.value;
	if (sortOrder.value) {
		return tempList.sort((a, b) => a[key] - b[key]);
	}
	return tempList.sort((a, b) => b[key] - a[key]);
});

// 打开遮罩层
const open = async () => {
	document.getElementsByTagName('body')[0].style.overflow = 'hidden';
	// 继续请求观众数据
	visible.value = true;
	init();
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

// 关闭遮罩层
const handleClose = () => {
	// 要中断请求
	// pause();
	visible.value = false;
	document.getElementsByTagName('body')[0].style.overflow = '';
};

// 跳转到 up 主的页面
const toUpPage = (mid: number) => {
	window.open(`https://space.bilibili.com/${mid}/video`);
};
</script>

<style lang="less">
.flex {
	display: flex;
}
.align-center {
	align-items: center;
}
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
