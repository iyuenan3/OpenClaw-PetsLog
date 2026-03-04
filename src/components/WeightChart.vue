<template>
  <view class="chart-container">
    <view class="chart-header">
      <text class="title">📈 体重变化趋势</text>
      <text class="subtitle" v-if="latestWeight">最新：{{ latestWeight }} kg</text>
    </view>
    <view id="weightChart" class="chart" :style="{ height: height + 'px' }"></view>
  </view>
</template>

<script>
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  CanvasRenderer
]);

export default {
  props: {
    records: {
      type: Array,
      default: () => []
    },
    height: {
      type: Number,
      default: 300
    }
  },
  data() {
    return {
      chart: null
    }
  },
  computed: {
    latestWeight() {
      if (this.records.length === 0) return null;
      return this.records[0].weight;
    }
  },
  watch: {
    records: {
      handler() {
        this.updateChart();
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
  },
  methods: {
    initChart() {
      const chartDom = document.getElementById('weightChart');
      if (!chartDom) return;
      
      this.chart = echarts.init(chartDom);
      this.updateChart();
    },
    updateChart() {
      if (!this.chart) return;
      
      // 准备数据（反转顺序，从旧到新）
      const data = [...this.records].reverse().map(record => ({
        value: [
          this.formatDate(record.recordedAt),
          record.weight
        ]
      }));
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const data = params[0].value;
            return `${data[0]}<br/>体重：${data[1]} kg`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true
        },
        dataZoom: [{
          type: 'slider',
          start: 0,
          end: 100,
          height: 20,
          bottom: 0
        }, {
          type: 'inside',
          start: 0,
          end: 100
        }],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            rotate: 45,
            interval: 'auto'
          }
        },
        yAxis: {
          type: 'value',
          name: '体重 (kg)',
          axisLabel: {
            formatter: '{value} kg'
          }
        },
        series: [{
          name: '体重',
          type: 'line',
          data: data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#667eea'
          },
          lineStyle: {
            color: '#667eea',
            width: 3
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(102, 126, 234, 0.3)'
            }, {
              offset: 1,
              color: 'rgba(102, 126, 234, 0.05)'
            }])
          }
        }]
      };
      
      this.chart.setOption(option);
    },
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${month}-${day}`;
    }
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-container {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    .title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
    
    .subtitle {
      font-size: 14px;
      color: #667eea;
      font-weight: bold;
    }
  }
  
  .chart {
    width: 100%;
  }
}
</style>
