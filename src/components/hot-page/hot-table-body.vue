<template>
	<div>
		<div
			v-for="(hotInfo, index) in showHotList"
			:id="`dht_${hotInfo.mid}`"
			:key="index"
			class="flex align-center hot-item"
			:class="{ loading: handlingMid === hotInfo.mid }"
			@click="toUpPage(hotInfo.mid)"
		>
			<!-- 序号 -->
			<div class="index" :style="{ width: getWidth('index') + '%' }">
				{{ index + 1 }}
			</div>
			<!-- 头像 -->
			<div class="user" :style="{ width: getWidth('user') + '%' }">
				<div>
					<img v-lazy="hotInfo.face" class="hot-item-img" alt="" />
				</div>
				<div style="margin-top: 10px">
					{{ hotInfo.name }}
				</div>
			</div>
			<!-- 封面 -->
			<div
				class="videos-image"
				:style="{ width: getWidth('videosImage') + '%' }"
				@click.stop="openVideo(hotInfo.videosUrl, hotInfo)"
			>
				<img v-lazy="hotInfo.pic" class="hot-item-pic" alt="" />
			</div>
			<!-- 标题 -->
			<div
				class="videos-title"
				:style="{ width: getWidth('videosTitle') + '%' }"
				@click.stop="openVideo(hotInfo.videosUrl, hotInfo)"
			>
				{{ hotInfo.title }}
			</div>
			<!-- 投币 -->
			<div class="coin" :style="{ width: getWidth('coin') + '%' }">
				{{ hotInfo.coin }}
			</div>
			<!-- 点赞 -->
			<div class="like" :style="{ width: getWidth('like') + '%' }">
				{{ hotInfo.like }}
			</div>
			<!-- 收藏 -->
			<div class="favorite" :style="{ width: getWidth('favorite') + '%' }">
				{{ hotInfo.favorite }}
			</div>
			<!-- 弹幕 -->
			<div class="danmaku" :style="{ width: getWidth('danmaku') + '%' }">
				{{ hotInfo.danmaku }}
			</div>
			<!-- 评论 -->
			<div class="reply" :style="{ width: getWidth('reply') + '%' }">
				{{ hotInfo.reply }}
			</div>
			<!-- 分享 -->
			<div class="share" :style="{ width: getWidth('share') + '%' }">
				{{ hotInfo.share }}
			</div>
			<!-- 播放量 -->
			<div class="view" :style="{ width: getWidth('view') + '%' }">
				{{ hotInfo.view }}
			</div>
			<!-- 分数 -->
			<div class="score" :style="{ width: getWidth('score') + '%' }">
				{{ hotInfo.score }}
			</div>
			<!-- 性别 -->
			<div class="sex" :style="{ width: getWidth('sex') + '%' }">
				<span v-if="hotInfo.sex === null" style="color: #cecdcd">待</span>
				<span v-if="hotInfo.sex === '男'" style="color: dodgerblue">♂</span>
				<span v-else-if="hotInfo.sex === '女'" style="color: deeppink">♀</span>
				<span v-else-if="hotInfo.sex === '保密'">?</span>
			</div>
			<!-- 粉丝数 -->
			<div class="fans" :style="{ width: getWidth('fans') + '%' }">
				<span v-if="hotInfo.fans">{{ hotInfo.fans }}</span>
				<span v-else style="color: #cecdcd">暂无数据</span>
			</div>
			<!-- 视频数量 -->
			<div class="videos-num" :style="{ width: getWidth('videosNum') + '%' }">
				<span v-if="hotInfo.videosNum">{{ hotInfo.videosNum }}</span>
				<span v-else style="color: #cecdcd">暂无数据</span>
			</div>
			<!-- 关注日期 -->
			<div class="created-date" :style="{ width: getWidth('createdDate') + '%' }">
				<span v-if="hotInfo.createdDate">{{ formatDateToChinese(hotInfo.createdDate) }}</span>
				<span v-else style="color: #cecdcd">暂无数据</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useHot } from '../../utils/hooks/useHot';
import { formatDateToChinese } from '../../utils/common/index';
import { useHotHead } from '../../utils/drag-width/hot-table';
import { computed } from '@vue/reactivity';

const { headsMap, headsList } = useHotHead();
const { showHotList, handlingMid } = useHot();

const allWidth = computed(() => {
	return headsList.reduce((pre, cur) => {
		pre += cur.width;
		return pre;
	}, 0);
});

const getWidth = (props: string) => {
	return (headsMap[props].width / allWidth.value) * 100;
};

const toUpPage = (mid: number) => {
	window.open(`https://space.bilibili.com/${mid}`);
};

const openVideo = (url: string, hotInfo) => {
	window.open(url);
};
</script>

<style lang="less">
.hot-table-body-col-style() {
	display: flex;
	align-items: center;
	justify-content: center;
}
.hot-item {
	transition: background-color 0.5s;
	border-radius: 16px;
	height: 150px;
	cursor: pointer;

	&-img {
		width: 63px;
		border-radius: 50%;
	}
	&-pic {
		width: 160px;
		border-radius: 3%;
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

.index {
	.hot-table-body-col-style();
}
.user {
	flex-direction: column;
	.hot-table-body-col-style();
}
.sex {
	.hot-table-body-col-style();
}
.nick-name {
	.hot-table-body-col-style();
}
.videos-image {
	.hot-table-body-col-style();
}
.videos-title {
	.hot-table-body-col-style();
}
.coin {
	.hot-table-body-col-style();
}
.like {
	.hot-table-body-col-style();
}
.favorite {
	.hot-table-body-col-style();
}
.danmaku {
	.hot-table-body-col-style();
}
.reply {
	.hot-table-body-col-style();
}
.share {
	.hot-table-body-col-style();
}
.view {
	.hot-table-body-col-style();
}
.score {
	.hot-table-body-col-style();
}
.created-date {
	.hot-table-body-col-style();
}
.videos-num {
	.hot-table-body-col-style();
}
.fans {
	.hot-table-body-col-style();
}
</style>
