<template>
	<div>
		<div>
			{{ constellationDataRate }}
		</div>
		<div ref="constellationEchart" style="width: 500px; height: 500px"></div>
	</div>
</template>
<!-- inline param -->
<script setup>
import { useFans } from './../../utils/useFans';
import * as echarts from 'echarts';
import { onMounted, ref } from 'vue';
const { constellationDataRate } = useFans();
// 基于准备好的dom，初始化echarts实例

const constellationEchart = ref(null);
onMounted(() => {
	console.log(constellationEchart.value);
	const myChart = echarts.init(constellationEchart.value);
	// 绘制图表
	const option = {
		tooltip: {
			trigger: 'item',
		},
		legend: {
			top: '5%',
			left: 'center',
		},
		series: [
			{
				name: 'Access From',
				type: 'pie',
				radius: ['40%', '70%'],
				avoidLabelOverlap: false,
				itemStyle: {
					borderRadius: 10,
					borderColor: '#fff',
					borderWidth: 2,
				},
				label: {
					show: true,
					position: 'outside',
				},
				emphasis: {
					label: {
						show: true,
						fontSize: '40',
						fontWeight: 'bold',
					},
				},
				labelLine: {
					show: false,
				},
				data: constellationDataRate.value,
			},
		],
	};
	myChart.setOption(option);
});
</script>

<style></style>
