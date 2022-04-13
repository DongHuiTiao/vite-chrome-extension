<template>
	<el-button @click="open">打开排行榜筛选器</el-button>
</template>

<script setup lang="ts">
import { useHot } from '../../utils/hooks/useHot';

const { open } = useHot();
</script>

<style></style>
