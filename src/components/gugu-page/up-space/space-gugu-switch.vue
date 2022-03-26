<template>
	<div>
		<span style="margin-right: 8px">拖更数据</span>
		<el-switch v-model="isOpen" @change="changIsOpen"></el-switch>
	</div>
</template>

<script setup lang="ts">
import { isOpen, changIsOpen } from '../../../utils/up-space-gugu/index';
</script>

<style></style>
