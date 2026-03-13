<template>
  <view class="weight-trend-chart">
    <canvas type="2d" :id="chartId" class="chart"></canvas>
  </view>
</template>

<script>
export default {
  name: 'WeightTrendChart',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    chartId: {
      type: String,
      default: 'weightTrendChart'
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
      
      const chart = await this.initChart();
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c}kg'
        },
        grid: {
          left: '10%',
          right: '5%',
          bottom: '15%',
          top: '10%'
        },
        xAxis: {
          type: 'category',
          data: this.data.map(item => this.formatDate(item.date)),
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: '体重 (kg)',
          min: Math.min(...this.data.map(item => item.weight)) - 0.5,
          max: Math.max(...this.data.map(item => item.weight)) + 0.5
        },
        series: [
          {
            data: this.data.map(item => item.weight),
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#1890ff'
            },
            lineStyle: {
              width: 3
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(24,144,255,0.3)' },
                { offset: 1, color: 'rgba(24,144,255,0.05)' }
              ])
            }
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
    
    formatDate(timestamp) {
      const date = new Date(timestamp);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`;
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
.weight-trend-chart {
  width: 100%;
  height: 400rpx;
  
  .chart {
    width: 100%;
    height: 100%;
  }
}
</style>
