<template>
  <view class="statistics-page">
    <!-- 顶部统计卡片 -->
    <view class="stats-cards">
      <view class="stat-card">
        <text class="stat-value">{{ stats.petCount }}</text>
        <text class="stat-label">宠物总数</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ stats.todayReminders }}</text>
        <text class="stat-label">今日提醒</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">¥{{ stats.monthExpenses.toFixed(2) }}</text>
        <text class="stat-label">本月开销</text>
      </view>
    </view>

    <!-- 健康状况分布饼图 -->
    <view class="chart-section">
      <text class="section-title">健康状况分布</text>
      <view class="chart-container">
        <canvas type="2d" id="healthChart" class="chart"></canvas>
      </view>
    </view>

    <!-- 疫苗/驱虫到期统计 -->
    <view class="chart-section">
      <text class="section-title">疫苗/驱虫到期</text>
      <view class="due-stats">
        <view class="due-item">
          <text class="due-count">{{ stats.vaccineDueCount }}</text>
          <text class="due-label">疫苗到期</text>
        </view>
        <view class="due-item">
          <text class="due-count">{{ stats.dewormingDueCount }}</text>
          <text class="due-label">驱虫到期</text>
        </view>
      </view>
    </view>

    <!-- 体重趋势图 -->
    <view class="chart-section">
      <text class="section-title">体重趋势</text>
      <view class="chart-container">
        <canvas type="2d" id="weightChart" class="chart"></canvas>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      stats: {
        petCount: 0,
        todayReminders: 0,
        monthExpenses: 0,
        vaccineDueCount: 0,
        dewormingDueCount: 0,
        healthDistribution: []
      },
      healthChart: null,
      weightChart: null
    };
  },
  
  onLoad() {
    this.loadStatistics();
  },
  
  methods: {
    async loadStatistics() {
      try {
        // 获取家庭 ID
        const familyId = uni.getStorageSync('familyId');
        
        if (!familyId) {
          uni.showToast({
            title: '请先选择家庭',
            icon: 'none'
          });
          return;
        }
        
        // 调用统计 API
        const res = await uniCloud.callFunction({
          name: 'statistics',
          data: { familyId }
        });
        
        if (res.result.code === 200) {
          this.stats = res.result.data;
          this.renderHealthChart();
          this.renderWeightChart();
        } else {
          uni.showToast({
            title: res.result.message || '加载失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('Load statistics error:', error);
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    },
    
    renderHealthChart() {
      // TODO: 使用 ECharts 渲染健康状况饼图
      console.log('Render health chart', this.stats.healthDistribution);
    },
    
    renderWeightChart() {
      // TODO: 使用 ECharts 渲染体重趋势图
      console.log('Render weight chart');
    }
  }
};
</script>

<style lang="scss" scoped>
.statistics-page {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.stats-cards {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
  
  .stat-card {
    flex: 1;
    background: white;
    border-radius: 16rpx;
    padding: 30rpx 20rpx;
    margin: 0 10rpx;
    text-align: center;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
    
    .stat-value {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      color: #1890ff;
      margin-bottom: 10rpx;
    }
    
    .stat-label {
      display: block;
      font-size: 24rpx;
      color: #666;
    }
  }
}

.chart-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  
  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .chart-container {
    width: 100%;
    height: 400rpx;
  }
  
  .chart {
    width: 100%;
    height: 100%;
  }
}

.due-stats {
  display: flex;
  justify-content: space-around;
  
  .due-item {
    text-align: center;
    
    .due-count {
      display: block;
      font-size: 48rpx;
      font-weight: bold;
      color: #ff4d4f;
      margin-bottom: 10rpx;
    }
    
    .due-label {
      display: block;
      font-size: 24rpx;
      color: #666;
    }
  }
}
</style>
