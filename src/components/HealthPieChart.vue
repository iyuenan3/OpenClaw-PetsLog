<template>
  <view class="health-pie-chart">
    <canvas type="2d" :id="chartId" class="chart"></canvas>
  </view>
</template>

<script>
export default {
  name: 'HealthPieChart',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    chartId: {
      type: String,
      default: 'healthPieChart'
    }
  },
  
  data() {
    return {
      chart: null
    };
  },
  
  watch: {
    data: {
      handler() {
        this.renderChart();
      },
      deep: true
    }
  },
  
  mounted() {
    this.renderChart();
  },
  
  methods: {
    async renderChart() {
      if (!this.data || this.data.length === 0) return;
      
      // 初始化 ECharts
      const chart = await this.initChart();
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center'
        },
        series: [
          {
            name: '健康状况',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: this.data.map(item => ({
              name: this.getStatusName(item.status),
              value: item.count,
              itemStyle: {
                color: this.getStatusColor(item.status)
              }
            }))
          }
        ]
      };
      
      chart.setOption(option);
    },
    
    async initChart() {
      const echarts = await import('echarts');
      const query = uni.createSelectorQuery().in(this);
      
      return new Promise((resolve) => {
        query.select(`#${this.chartId}`).fields({ node: true, size: true }).exec((res) => {
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          
          const dpr = uni.getSystemInfoSync().pixelRatio;
          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          ctx.scale(dpr, dpr);
          
          const chart = echarts.init(canvas);
          canvas.setChart(chart);
          
          this.chart = chart;
          resolve(chart);
        });
      });
    },
    
    getStatusName(status) {
      const map = {
        'healthy': '健康',
        'sick': '生病',
        'recovering': '康复中',
        'critical': '危重'
      };
      return map[status] || status;
    },
    
    getStatusColor(status) {
      const map = {
        'healthy': '#52c41a',
        'sick': '#ff4d4f',
        'recovering': '#faad14',
        'critical': '#722ed1'
      };
      return map[status] || '#1890ff';
    }
  },
  
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  }
};
</script>

<style lang="scss" scoped>
.health-pie-chart {
  width: 100%;
  height: 400rpx;
  
  .chart {
    width: 100%;
    height: 100%;
  }
}
</style>
