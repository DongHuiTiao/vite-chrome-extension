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

						<!-- TODO 点击头像跳转到 up 主个人页面 -->
						<div class="avatar">头像</div>
						<div class="nickName">昵称</div>

						<!-- TODO 最新更新时间 -->
						<!-- 鼠标覆盖上去后，可以显示视频封面标题 -->

						<div class="videosNum">视频数量</div>

						<div class="currentGugu">当前咕咕时长</div>
						<div class="averageGugu">平均更新频率</div>
						<div class="maxGugu">最多咕咕时长</div>
					</div>
					<!-- 表身 -->
					<div
						v-for="(up, index) in showUpList"
						:key="index"
						class="flex align-center up-item"
						@click="toUpPage(up.mid)"
					>
						<div class="index">
							{{ index + 1 }}
						</div>
						<div class="avatar">
							<img class="up-item-img" :src="up.face" alt="" />
						</div>
						<div class="nickName">{{ up.uname }}</div>
						<div class="videosNum">{{ up.guguLengthList.length }}</div>
						<template v-if="up.videoNum === -1">
							<div>等待获取中</div>
						</template>
						<template v-else>
							<div v-if="up.videoNum === 0">这个 up 主还没有视频哦</div>
							<!-- up主有视频 -->
							<template v-else>
								<!-- 已经有了计算结果 -->
								<template v-if="up.currentGuguLength">
									<div class="currentGugu">{{ getTimeDiff(up.currentGuguLength) }}</div>
									<div class="averageGugu">{{ getTimeDiff(up.averageGuguLength) }}</div>
									<div class="maxGugu">{{ getTimeDiff(up.maxGuguLength) }}</div>
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
								<div></div>
							</template>
						</template>
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
import { ref, computed } from 'vue';
import { useGugu } from '../utils/useGugu';
const { followsGuguList, myGugu, init } = useGugu();

// 是否打开遮罩层
const visible = ref<boolean>(false);

// 排序相关
const sortType = ref<'' | 'currentGuguLength' | 'averageGuguLength' | 'maxGuguLength' | 'videoNum'>('');
// 是否加入自己

const isAddSelf = ref<boolean>(false);
const sortOrder = ref<boolean>(false);

const userNameFilter = ref<string>('');

const showResultAreaWidth = ref<number>(70);
// 是否按着 width-handler
const isPressWidthHandler = ref<boolean>(false);
// 按下 width-handler 的时候
const pressWidthHandle = () => {
	isPressWidthHandler.value = true;
};
// 鼠标在抽屉页面移动的时候
const drawerMouseMove = e => {
	console.log('是否按着', isPressWidthHandler.value);
	if (isPressWidthHandler.value) {
		console.log(e);
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
	return Number(((currentNum / videoNum) * 100).toFixed(2));
};

// 关闭遮罩层
const handleClose = () => {
	// 要中断请求
	// pause();
	visible.value = false;
	document.getElementsByTagName('body')[0].style.overflow = '';
};
// 根据时间长度计算多少天
const getTimeDiff = (timeLength: number) => {
	const second = timeLength;
	const remianSecond = second % 60;

	const minute = (second - remianSecond) / 60;
	const remainMinute = minute % 60;

	const hour = (minute - remainMinute) / 60;
	const remainHour = hour % 24;

	const day = (hour - remainHour) / 24;

	return `${day}天${remainHour}小时${remainMinute}分${remianSecond}秒`;
};

// 跳转到 up 主的页面
const toUpPage = (mid: number) => {
	window.location.href = `https://space.bilibili.com/${mid}/video`;
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
.nickName {
	width: 10%;
}
.videosNum {
	width: 12%;
}
.currentGugu {
	width: 21%;
}
.averageGugu {
	width: 21%;
}
.maxGugu {
	width: 21%;
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
</style>
