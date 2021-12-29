<template>
	<div class="fan">
		<img v-lazy="face" class="fan-avatar" alt="" />
		<div class="fan-name">
			{{ userName }}
		</div>
	</div>
</template>

<script setup>
// eslint-disable-next-line no-undef
defineProps({
	face: {
		type: String,
		default: '',
	},
	userName: {
		type: String,
		default: '',
	},
});
// eslint-disable-next-line no-undef
defineEmits(['change', 'delete']);
</script>

<style scope>
.fan {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 120px;
	width: 120px;
	margin: 10px;
	padding: 10px;
	border-radius: 10px;
	cursor: pointer;
}
.fan:hover {
	background-color: pink;
}
.fan-avatar {
	height: 100px;
	width: 100px;
	margin-bottom: 10px;
	border-radius: 50%;
}
.fan-name {
	text-overflow: clip;
	height: 21px;
}
</style>
