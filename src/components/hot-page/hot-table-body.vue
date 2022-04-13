<template>
	<div>
		<div
			v-for="(hotInfo, index) in showHotList"
			:id="`dht_${hotInfo.owner.mid}`"
			:key="index"
			class="flex align-center up-item"
			:class="{ loading: handlingMid === hotInfo.owner.mid }"
		>
			<!-- 序号 -->
			<div class="index" :style="{ width: getWidth('index') + '%' }">
				{{ index + 1 }}
			</div>
			<!-- 头像 -->
			<div class="avatar" :style="{ width: getWidth('avatar') + '%' }">
				<img v-lazy="hotInfo.owner.face" class="up-item-img" alt="" />
			</div>
			<!-- 昵称 -->
			<div class="nick-name" :style="{ width: getWidth('nickName') + '%' }">{{ hotInfo.owner.name }}</div>
			<!-- 粉丝数 -->
			<div class="fans" :style="{ width: getWidth('fans') + '%' }">{{ hotInfo.owner.fans }}</div>
			<!-- 视频数量 -->
			<div class="videos-num" :style="{ width: getWidth('videosNum') + '%' }">
				{{ hotInfo.owner.videosNum }}
			</div>
			<!-- 关注日期 -->
			<div class="created-date" :style="{ width: getWidth('createdDate') + '%' }">
				{{ formatDateToChinese(hotInfo.owner.createdDate) }}
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
</script>

<style lang="less">
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

.index {
	.gugu-table-body-col-style();
}
.avatar {
	.gugu-table-body-col-style();
}
.nick-name {
	.gugu-table-body-col-style();
}
.created-date {
	.gugu-table-body-col-style();
}
.videos-num {
	.gugu-table-body-col-style();
}
.fans {
	.gugu-table-body-col-style();
}
</style>
