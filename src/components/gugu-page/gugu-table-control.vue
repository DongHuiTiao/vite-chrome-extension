<template>
	<!-- 控制区域 -->
	<div class="gugu-table__drawer" :class="{ 'gugu-table__drawer--open__control': isShowControlDrawer }">
		<div class="gugu-table__drawer__switch" @click="isShowControlDrawer = !isShowControlDrawer">
			{{ isShowControlDrawer ? '关闭面板' : '打开面板' }}
		</div>
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

<script setup>
import { useGugu } from '../../utils/useGugu';
const { sortType, isAddSelf, sortOrder, userNameFilter, isShowControlDrawer } = useGugu();
</script>

<style lang="less" scoped>
.gugu-table__drawer {
	width: 21%;
	height: 100vh;
	background-color: white;
	box-shadow: 0px 0px 26px 3px #7c7c7c;
	position: absolute;
	right: -21%;
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
</style>
