<template>
	<div class="filter-control">
		<!-- 获取状态 -->
		<div v-if="!isComplete" class="flex">
			<!-- 状态 -->
			<div>仍在获取中...</div>
		</div>
		<div v-else>全部获取完毕</div>
		<!-- 进度条 -->
		<el-progress :text-inside="true" :stroke-width="26" :percentage="progress" stroke-linecap="square" />
		<!-- 预计全部完成时间 -->
		<div class="flex justify-between">
			<!-- 根据还需要剩余成功请求几次，计算预计时间 -->
			<div v-if="isComplete">预计 {{ remainTime }} 后全部完成</div>
			<!-- 已经获取到的数量 -->
			<div>已获取{{ currentGetFansLength }}个用户信息</div>
		</div>
		<!-- 符合条件的数量 -->
		<div class="flex align-center">
			<div>符合条件的数量： {{ qualifiedNum }}</div>
		</div>
		<!-- 排序方式 -->
		<el-divider>排序方式</el-divider>
		<div>
			<el-radio v-model="sortBy" label="" @change="refreshShowFansList">不排序</el-radio>
			<!-- 按粉丝数排序 -->
			<el-radio v-model="sortBy" label="fans" @change="refreshShowFansList">按粉丝数排序</el-radio>
			<!-- 按关注时间排序 -->
			<el-radio v-model="sortBy" label="followTime" @change="refreshShowFansList">按关注时间排序</el-radio>
		</div>
		<!-- 筛选方式 -->
		<el-divider>筛选方式</el-divider>
		<div>
			<!-- 按性别筛选 -->
			<div class="flex align-center margin-bottom">
				<div class="filter-control_form_label">性别</div>
				<el-select v-model="sex" placeholder="过滤性别" size="mini" @change="refreshShowFansList">
					<el-option v-for="item in sexOption" :key="item.value" :label="item.label" :value="item.value">
					</el-option>
				</el-select>
			</div>
			<!-- 按生日筛选 -->
			<div class="flex align-center margin-bottom">
				<div class="filter-control_form_label">生日</div>
				<el-date-picker
					v-model="birthday"
					type="date"
					placeholder="过滤生日"
					size="mini"
					@change="refreshShowFansList"
				></el-date-picker>
			</div>
			<!-- 按关注时间筛选 -->
			<div class="flex align-center margin-bottom">
				<div class="filter-control_form_label">关注时间</div>
				<el-date-picker
					v-if="loaded"
					v-model="followDate"
					type="datetimerange"
					:shortcuts="shortcuts"
					range-separator="To"
					start-placeholder="开始日期"
					end-placeholder="结束日期"
					size="mini"
					@change="refreshShowFansList"
				>
				</el-date-picker>
			</div>
			<div class="margin-bottom">
				<el-button size="mini" @click="isShowVideoFollowerData = true">查看每期视频增长关注</el-button>
			</div>
			<!-- 抽屉 -->
			<el-drawer
				:model-value="isShowVideoFollowerData"
				direction="rtl"
				size="80%"
				:with-header="false"
				:before-close="handleCloseShowVideoFollowerData"
				:modal-append-to-body="false"
				:append-to-body="true"
			>
				<VideoFollowerData :video-list="videoList" />
			</el-drawer>
			<!-- 按是否互粉筛选 -->
			<div class="flex align-center">
				<div class="filter-control_form_label">互粉</div>
				<el-switch v-model="isEachOther" @change="refreshShowFansList" />
			</div>
		</div>
		<el-divider>筛选方式</el-divider>
		<div class="flex align-center">
			<div class="filter-control_form_label">搜索观众</div>
			<el-input v-model="userNameFilter" size="mini" @input="refreshShowFansList"></el-input>
		</div>
	</div>
</template>

<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useFans, useVideo, useUp } from '../../utils/index';
import VideoFollowerData from './../video-list/video-follower-data.vue';

const {
	progress,
	currentGetFansLength,
	refreshShowFansList,
	qualifiedNum,
	sortBy,
	sex,
	birthday,
	followDate,
	userNameFilter,
	showRemainTime,
	isComplete,
	isEachOther,
} = useFans();

const remainTime = computed(() => {
	const second = showRemainTime.value % 60;
	const allMinute = (showRemainTime.value - second) / 60;
	const minute = allMinute % 60;
	const hour = (allMinute - minute) / 60;
	if (hour) return `${hour} 小时 ${minute} 分 ${second} 秒`;
	if (minute) return `${minute} 分 ${second} 秒`;
	if (second) return `${second} 秒`;
	return '正在预估';
});

// 这部分用于获取视频信息
const { getUpAllVideosInfo } = useVideo();
const { getUpMid } = useUp();
const loaded = ref(false);
const shortcuts = ref([]);
// 视频信息
const videoList = ref([]);

onBeforeMount(async () => {
	const upMid = getUpMid();
	const res = await getUpAllVideosInfo(upMid);
	videoList.value = res[0].data.list.vlist;
	shortcuts.value = createShortcuts(res[0].data.list.vlist);
	// 因为不是响应式的，先让数据加载完，再渲染
	loaded.value = true;
});

const createShortcuts = videosList => {
	return videosList.map((video, index, arr) => {
		return {
			text: video.title,
			value: () => {
				const start = new Date(video.created * 1000);
				const end = !index ? new Date() : new Date(arr[index - 1].created * 1000);
				return [start, end];
			},
		};
	});
};

// 性别选项
const sexOption = [
	{ value: '', label: '全选' },
	{ value: '男', label: '男' },
	{ value: '女', label: '女' },
	{ value: '保密', label: '保密' },
];

// 是否展示每一期视频的涨关注量
const isShowVideoFollowerData = ref(false);
// 关闭这个窗口的回调函数
const handleCloseShowVideoFollowerData = () => {
	isShowVideoFollowerData.value = false;
};
</script>

<style lang="less">
.filter-control {
	background-color: rgb(250, 250, 250);
	padding: 10px;
	&_form_label {
		min-width: 65px;
	}
}
.margin-bottom {
	margin-bottom: 12px;
}
</style>
