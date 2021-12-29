<template>
	<div class="entry">
		<FansList />
	</div>
</template>

<script setup>
import FansList from './views/fans-list.vue';
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
