<template>
	<!-- 控制区域 -->
	<div class="hot-table__drawer" :class="{ 'hot-table__drawer--open__control': isShowControlDrawer }">
		<div class="hot-table__drawer__switch" @click="isShowControlDrawer = !isShowControlDrawer">
			{{ isShowControlDrawer ? '关闭面板' : '打开面板' }}
		</div>
		<div class="control">
			<el-divider content-position="center">排序</el-divider>
			<el-select v-model="sortType" class="m-2" placeholder="选择排序方式" size="small">
				<el-option v-for="item in sortTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
			</el-select>
			<el-divider content-position="center">是否降序排序</el-divider>
			<el-radio v-model="sortOrder" :label="false" size="large">降序</el-radio>
			<el-radio v-model="sortOrder" :label="true" size="large">升序</el-radio>

			<el-divider content-position="center">显示性别</el-divider>
			<div>
				<el-checkbox v-model="isShowMan" label="男" />
				<el-checkbox v-model="isShowWoman" label="女" />
				<el-checkbox v-model="isShowSecret" label="保密" />
			</div>

			<el-divider content-position="center">批量操作</el-divider>
			<div v-if="isRequesting">
				<div class="gugu-table__drawer__batch-operate">
					<el-button type="danger" size="small" @click="cancelRequest">终止获取</el-button>
				</div>
				<div class="gugu-table__drawer__batch-operate">
					<span style="margin-right: 8px">是否跟踪</span>
					<el-switch v-model="isScrollToHandlingDom" @change="onChange"></el-switch>
				</div>
			</div>
			<div v-else>
				<div class="hot-table__drawer__batch-operate">
					<el-button size="small" @click="updateAllHotInfo">获取所有数据</el-button>
				</div>
				<div class="hot-table__drawer__batch-operate">
					<el-button size="small" @click="getAllHotUpFans">获取粉丝数</el-button>
				</div>
				<div class="hot-table__drawer__batch-operate">
					<el-button size="small" @click="getAllHotUpVideosNum">获取视频数量</el-button>
				</div>
				<div class="hot-table__drawer__batch-operate">
					<el-button size="small" @click="getAllHotUpCreatedDate">获取初稿时间</el-button>
				</div>
				<div class="hot-table__drawer__batch-operate">
					<el-button size="small" @click="getAllHotUpSex">获取性别</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useHot } from '../../utils/hooks/useHot';
const {
	sortType,
	sortOrder,
	isShowControlDrawer,
	updateAllHotInfo,
	getAllHotUpFans,
	getAllHotUpVideosNum,
	getAllHotUpCreatedDate,
	getAllHotUpSex,
	isRequesting,
	cancelRequest,
	scrollToHandlingDom,
	isScrollToHandlingDom,
	handlingMid,
	isShowMan,
	isShowWoman,
	isShowSecret,
} = useHot();

const sortTypeOptions = [
	{
		label: '根据分数排序',
		value: 'score',
	},
	{
		label: '根据粉丝数量',
		value: 'fans',
	},
	{
		label: '根据视频数量',
		value: 'videosNum',
	},
	{
		label: '根据首搞时间',
		value: 'createdDate',
	},
	{
		label: '根据投币',
		value: 'coin',
	},
	{
		label: '根据点赞',
		value: 'like',
	},
	{
		label: '根据收藏',
		value: 'favorite',
	},
	{
		label: '根据弹幕',
		value: 'danmaku',
	},
	{
		label: '根据评论',
		value: 'reply',
	},
	{
		label: '根据分享',
		value: 'share',
	},
	{
		label: '根据播放',
		value: 'view',
	},
];

const onChange = (isOpen: boolean) => {
	// 如果开启了，就跳转到正在处理的 dom 上
	if (isOpen) {
		scrollToHandlingDom(handlingMid.value);
	}
};
</script>

<style lang="less" scoped>
.hot-table__drawer {
	width: 21%;
	height: 100vh;
	background-color: white;
	box-shadow: 0px 0px 26px 3px #7c7c7c;
	position: absolute;
	right: -21%;
	top: 0;
	transition: right 0.3s;
	padding: 30px;
	box-sizing: border-box;
	&--open__control {
		right: 0;
	}

	&__switch {
		width: 44px;
		height: 120px;
		background-color: #ffffff;
		position: absolute;
		left: -44px;
		padding: 13px;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		top: calc(44% - 60px);
		border: 1px solid #f0f0f0;
		box-shadow: -10px 9px 9px -9px #edebeb;
		border-right: 0;
		border-radius: 7px 0 0 7px;
		user-select: none;
		cursor: pointer;
		color: #bebebf;
		&:hover {
			background-color: rgb(245, 245, 245);
		}
	}
}
.hot-table__drawer__batch-operate {
	margin-top: 15px;
	user-select: none;
}
</style>
