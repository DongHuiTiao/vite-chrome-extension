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
			<div class="flex">
				<!-- 展示结果 -->
				<div style="height: 98vh; width: 168%; overflow: scroll">
					<!-- 表头 -->
					<div class="table-head flex align-center">
						<div class="avatar">头像</div>
						<div class="nickName">昵称</div>
						<div class="currentGugu">当前咕咕时长</div>
						<div class="averageGugu">平均更新频率</div>
						<div class="maxGugu">最多咕咕时长</div>
					</div>
					<!-- 表身 -->
					<div v-for="(up, index) in showUpList" :key="index" class="flex align-center up-item">
						<div class="avatar">
							<img class="up-item-img" :src="up.face" alt="" />
						</div>
						<div class="nickName">{{ up.uname }}</div>
						<template v-if="up.currentGuguLength">
							<div class="currentGugu">{{ getTimeDiff(up.currentGuguLength) }}</div>
							<div class="averageGugu">{{ getTimeDiff(up.averageGuguLength) }}</div>
							<div class="maxGugu">{{ getTimeDiff(up.maxGuguLength) }}</div>
						</template>
						<div v-else style="width: 75%">
							<div v-if="up.currentHaveVideoNum === -1">等待获取中</div>
							<div v-else>
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
						</div>
					</div>
				</div>
				<!-- 控制区域 -->
				<div>
					<el-divider content-position="left">排序</el-divider>
					<el-radio v-model="sortType" label="" size="large">不排序</el-radio>
					<el-radio v-model="sortType" label="current" size="large">根据当前咕咕时间</el-radio>
					<el-radio v-model="sortType" label="average" size="large">根据平均咕咕时间</el-radio>
					<el-radio v-model="sortType" label="max" size="large">根据最大咕咕时间</el-radio>

					<el-divider content-position="left">是否加入自己的数据</el-divider>
					<el-switch v-model="isAddSelf" />
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
const sortType = ref<'' | 'current' | 'average' | 'max'>('');
// 是否加入自己

const isAddSelf = ref<boolean>(false);

const showUpList = computed(() => {
	const tempList = followsGuguList.value.slice();
	if (isAddSelf.value) tempList.unshift(myGugu.value);
	if (!sortType.value) return tempList;
	const key = sortType.value + 'GuguLength';
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
</script>

<style lang="less">
.flex {
	display: flex;
}
.align-center {
	align-items: center;
}
.up-item {
	&-img {
		width: 63px;
		border-radius: 50%;
	}
}
.avatar {
	width: 100px;
}
.nickName {
	width: 10%;
}
.currentGugu {
	width: 25%;
}
.averageGugu {
	width: 25%;
}
.maxGugu {
	width: 25%;
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
