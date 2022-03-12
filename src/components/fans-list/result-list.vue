<template>
	<div>
		<!-- 表头 -->
		<div class="user-fans-list_header">
			<!-- 序号 -->
			<div class="user-fans-list_index">序号</div>
			<!-- 头像昵称（可以进入用户页） -->
			<div class="user-fans-list_name">头像昵称</div>
			<!-- 性别（可以筛选） -->
			<div class="user-fans-list_sex">性别</div>
			<!-- 观众数（可以排序） -->
			<div class="user-fans-list_fans">观众数</div>
			<!-- TODO 增加排序 -->
			<div class="user-fans-list_mtime">
				<div>关注时间</div>
			</div>
			<!-- 生日时间（可以挑选） -->
			<div class="user-fans-list_birthday">
				<div>生日时间</div>
			</div>
			<!-- 是否互粉（可以设置） -->
			<div class="user-fans-list_is-each-other">是否互粉</div>
		</div>
		<!-- 用户信息 -->
		<!-- <el-scrollbar v-infinite-scroll="loadMoreFansInfo" height="90vh"> -->
		<ul
			v-infinite-scroll="loadMoreFansInfo"
			:infinite-scroll-distance="100"
			:infinite-scroll-immediate="false"
			class="user-fans-list"
		>
			<li v-for="(fan, index) in showFilterResult" :key="'commenter' + index" class="user-fans-list_item">
				<!-- 序号 -->
				<div class="user-fans-list_index">{{ index + 1 }}</div>
				<!-- 头像昵称（可以进入用户页） -->
				<!-- 可以进入用户页-->
				<div class="user-fans-list_name" @click="enterPage(fan.mid)">
					<img v-lazy="fan.card.face" class="user-fans-list_name_avatar" alt="" />
					<div class="user-fans-list_name_name">
						{{ fan.card.name }}
					</div>
				</div>
				<!-- 性别（可以筛选） -->
				<div class="user-fans-list_sex">
					{{ fan.card.sex }}
				</div>
				<!-- 观众数（可以排序） -->
				<div class="user-fans-list_fans">
					{{ fan.follower }}
				</div>
				<!-- 关注时间（可以排序） -->
				<div class="user-fans-list_mtime">
					{{ fan.mtime }}
				</div>
				<!-- 生日时间（可以挑选） -->
				<div class="user-fans-list_birthday">
					{{ formatBirthday(fan.card.birthday) }}
					{{ fan.zodiac }}
					{{ fan.constellation }}
				</div>
				<!-- 是否互粉（可以设置） -->
				<div class="user-fans-list_is-each-other">
					{{ fan.state === 6 ? '是' : '否' }}
				</div>
			</li>
		</ul>
		<!-- </el-scrollbar> -->
	</div>
</template>

<script setup>
import { watch } from 'vue';
import { useFans } from '../../utils/index';
import { toDouble } from './../../utils/common';
const { showFilterResult, refreshShowFansList, currentGetFansLength, showResultNum } = useFans();

// 初始化的时候，如果获得了数据，则加载到页面上，一次就好
const stopWatchResult = watch(currentGetFansLength, value => {
	if (value) {
		refreshShowFansList();
		stopWatchResult();
	}
});

// 滑动到底部的时候，获取下一页的观众信息
const loadMoreFansInfo = () => {
	console.log('我触底啦');
	showResultNum.value += 100;
	refreshShowFansList();
};

// 打开用户主页
const enterPage = mid => {
	window.open(`https://space.bilibili.com/${mid}`);
};
// 转化生日的格式
const formatBirthday = birthdayTime => {
	const date = new Date(birthdayTime * 1000);
	if (birthdayTime < 0) return '保密';
	return `${date.getFullYear()}-${toDouble(date.getMonth() + 1)}-${toDouble(date.getDate())}`;
};
</script>

<style lang="less">
.flex-center {
	display: flex;
	justify-content: center;
	align-items: center;
}
.user-fans-list {
	width: 100%;
	height: 91vh;
	overflow: scroll;
	&_item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	&_header {
		display: flex;
		height: 39px;
		align-items: center;
		justify-content: space-between;
	}

	&_index {
		width: 75px;
		&:extend(.flex-center);
	}
	&_name {
		display: flex;
		width: 219px;
		align-items: center;
		&_avatar {
			width: 48px;
			height: 48px;
			border-radius: 50%;
			margin-right: 10px;
		}
		&:hover {
			background-color: hotpink;
			border-radius: 30px;
		}
	}
	&_sex {
		width: 121px;
		&:extend(.flex-center);
	}
	&_fans {
		width: 103px;
		&:extend(.flex-center);
	}
	&_mtime {
		width: 222px;
		&:extend(.flex-center);
	}
	&_birthday {
		width: 222px;
		&:extend(.flex-center);
	}
	&_show-num {
		width: 260px;
		&:extend(.flex-center);
	}
	&_is-each-other {
		width: 75px;
		&:extend(.flex-center);
	}
}
</style>
