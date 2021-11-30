<template>
    <div class="entry">
        <button @click="start">我在这里，这里是入口，快点我试试！</button>
    </div>
</template>

<script setup>
const start = () => {
    alert('从现在开始，你可以享受 vite vue3 的制作插件之旅了');
    alert('冬灰条牛逼！');
    // TODO eslint prettier
    // TODO 在目标页面实现热更新？
    // TODO 实现自动更新？
}
</script>

<style scoped>
.entry {
    position: fixed;
    left: 0;
    top: 50%;
}
</style>
