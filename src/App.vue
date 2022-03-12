<template>
	<div class="entry">
		<GuguPage />
	</div>
</template>

<script setup>
import GuguPage from './views/gugu-page.vue';
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
