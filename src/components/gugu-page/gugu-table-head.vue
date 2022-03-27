<template>
	<div id="gugu-table__head" class="gugu-table__head flex align-center">
		<!-- 每个字段表格，可控制宽高 -->
		<GuguTableHeadItem v-for="(head, index) in guguHeadsList" :key="'head' + index" :head="head.key" />
	</div>
</template>

<script setup lang="ts">
import GuguTableHeadItem from './gugu-table-head-item.vue';
import { guguHeadsList } from '../../utils/drag-width/gugu-table';
</script>

<style lang="less">
.gugu-table__head {
	position: sticky;
	top: 0;
	background-color: #0000007d;
	color: white;
	width: 100%;
	height: 45px;
}
</style>
