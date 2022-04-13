<template>
	<div id="hot-table__head" class="hot-table__head flex align-center">
		<!-- 每个字段表格，可控制宽高 -->
		<HotTableHeadItem v-for="(head, index) in headsList" :key="'head' + index" :head="head.key" />
	</div>
</template>

<script setup lang="ts">
import HotTableHeadItem from './hot-table-head-item.vue';
import { useHotHead } from '../../utils/drag-width/hot-table';

const { headsList } = useHotHead();
</script>

<style lang="less">
.hot-table__head {
	position: sticky;
	top: 0;
	background-color: #0000007d;
	color: white;
	width: 100%;
	height: 45px;
}
</style>
