<template>
	<div class="entry">
		<component :is="pageMap[currentPage]" />
	</div>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue';
import GuguPage from './views/gugu-page.vue';
import HotPage from './views/hot-page.vue';

const pageMap = {
	'https://www.bilibili.com/v/popular/': HotPage,
	'https://space.bilibili.com/': GuguPage,
};

const currentPage = ref('');

onBeforeMount(() => {
	const url = window.location.href;
	currentPage.value = Object.keys(pageMap).find(item => url.startsWith(item));
});
</script>

<style>
.entry {
	position: fixed;
	right: 0;
	top: 50%;
}
.flex {
	display: flex;
}
.justify-between {
	justify-content: space-between;
}
.align-center {
	align-items: center;
}
.flex-center {
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>
