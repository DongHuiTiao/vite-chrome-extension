<template>
	<el-scrollbar height="100vh">
		<div v-for="(video, index) in fomatVideoList" :key="'video' + index" class="video_item">
			<!-- 视频的封面 -->
			<img class="video_item_img" :src="video.img" alt="" />
			<!-- 视频的名字 -->
			<div>{{ video.title }}</div>
			<!-- 这期视频咕咕了多少天 -->
			<div>这期视频咕咕了{{ video.pigeon }}天</div>
			<!-- 这期视频到下期视频之间涨了多少关注 -->
			<div style="margin-left: 100px">涨了 {{ video.growNum }} 个关注</div>
			<!-- 视频的各项数据 -->
		</div>
		<!-- <div></div>
        <div></div> -->
	</el-scrollbar>
</template>

<script setup>
import { computed } from 'vue';
import { useFans } from './../../utils/index';
// eslint-disable-next-line no-undef
const props = defineProps({
	videoList: {
		type: Array,
		default: () => {
			return [];
		},
	},
});

const { getTimeRangeGrowFansLength } = useFans();

const fomatVideoList = computed(() => {
	return props.videoList.map((video, index, arr) => {
		// 发布时间
		const start = video.created;
		// 下期视频 或 当前时间
		const end = !index ? Math.floor(new Date().getTime() / 1000) : arr[index - 1].created;
		// 总时长
		const allSecond = end - start;
		// 咕了多少天
		const pigeon = Math.ceil(allSecond / 60 / 60 / 24);

		return {
			img: video.pic,
			title: video.title,
			pigeon,
			growNum: getTimeRangeGrowFansLength([start * 1000, end * 1000]),
		};
	});
});
</script>

<style lang="less">
.video_item {
	display: flex;
	align-items: center;
	&_img {
		width: 100px;
	}
}
</style>
