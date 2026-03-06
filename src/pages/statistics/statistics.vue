<template>
  <view class="container">
    <view class="header">
      <text class="title">📊 数据统计</text>
      <text class="subtitle">宠物健康数据分析</text>
    </view>

    <!-- 时间范围选择 -->
    <view class="range-selector">
      <view 
        class="range-btn" 
        :class="{ active: timeRange === 'week' }"
        @click="timeRange = 'week'"
      >
        <text>本周</text>
      </view>
      <view 
        class="range-btn" 
        :class="{ active: timeRange === 'month' }"
        @click="timeRange = 'month'"
      >
        <text>本月</text>
      </view>
      <view 
        class="range-btn" 
        :class="{ active: timeRange === 'year' }"
        @click="timeRange = 'year'"
      >
        <text>本年</text>
      </view>
      <view 
        class="range-btn" 
        :class="{ active: timeRange === 'all' }"
        @click="timeRange = 'all'"
      >
        <text>全部</text>
      </view>
    </view>

    <scroll-view scroll-y class="stats-scroll">
      <!-- 统计卡片 -->
      <view class="stats-cards">
        <view class="stat-card">
          <text class="stat-icon">🐾</text>
          <text class="stat-value">{{ stats.petCount }}</text>
          <text class="stat-label">宠物总数</text>
        </view>
        <view class="stat-card">
          <text class="stat-icon">⚖️</text>
          <text class="stat-value">{{ stats.weightRecords }}</text>
          <text class="stat-label">体重记录</text>
        </view>
        <view class="stat-card">
          <text class="stat-icon">💉</text>
          <text class="stat-value">{{ stats.vaccineRecords }}</text>
          <text class="stat-label">疫苗记录</text>
        </view>
        <view class="stat-card">
          <text class="stat-icon">💊</text>
          <text class="stat-value">{{ stats.dewormingRecords }}</text>
          <text class="stat-label">驱虫记录</text>
        </view>
      </view>

      <!-- 体重趋势图 -->
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">⚖️ 体重趋势</text>
          <picker :range="petNames" @change="onPetChange">
            <view class="pet-selector">
              <text>{{ selectedPetName }}</text>
              <text class="arrow">›</text>
            </view>
          </picker>
        </view>
        <view class="chart-container">
          <canvas type="2d" id="weightChart" class="chart"></canvas>
        </view>
      </view>

      <!-- 健康统计 -->
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">🏥 健康记录</text>
        </view>
        <view class="health-stats">
          <view class="health-item">
            <text class="health-icon">📝</text>
            <view class="health-info">
              <text class="health-value">{{ stats.healthRecords }}</text>
              <text class="health-label">总记录数</text>
            </view>
          </view>
          <view class="health-item">
            <text class="health-icon">✅</text>
            <view class="health-info">
              <text class="health-value">{{ stats.recoveredCount }}</text>
              <text class="health-label">已恢复</text>
            </view>
          </view>
          <view class="health-item">
            <text class="health-icon">💊</text>
            <view class="health-info">
              <text class="health-value">{{ stats.treatmentCount }}</text>
              <text class="health-label">治疗中</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 月度统计 -->
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">📅 月度统计</text>
        </view>
        <view class="month-stats">
          <view class="month-item" v-for="(month, index) in monthStats" :key="index">
            <text class="month-name">{{ month.name }}</text>
            <view class="month-bars">
              <view class="month-bar" :style="{ width: month.percentage + '%' }"></view>
            </view>
            <text class="month-count">{{ month.count }} 条</text>
          </view>
        </view>
      </view>

      <!-- 记录类型分布 -->
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">📊 记录分布</text>
        </view>
        <view class="type-distribution">
          <view class="type-item">
            <view class="type-bar weight"></view>
            <text class="type-label">体重</text>
            <text class="type-count">{{ stats.weightRecords }}</text>
          </view>
          <view class="type-item">
            <view class="type-bar vaccine"></view>
            <text class="type-label">疫苗</text>
            <text class="type-count">{{ stats.vaccineRecords }}</text>
          </view>
          <view class="type-item">
            <view class="type-bar deworming"></view>
            <text class="type-label">驱虫</text>
            <text class="type-count">{{ stats.dewormingRecords }}</text>
          </view>
          <view class="type-item">
            <view class="type-bar health"></view>
            <text class="type-label">健康</text>
            <text class="type-count">{{ stats.healthRecords }}</text>
          </view>
          <view class="type-item">
            <view class="type-bar food"></view>
            <text class="type-label">粮食</text>
            <text class="type-count">{{ stats.foodRecords }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      timeRange: 'month',
      selectedPetIndex: 0,
      pets: [],
      stats: {
        petCount: 0,
        weightRecords: 0,
        vaccineRecords: 0,
        dewormingRecords: 0,
        healthRecords: 0,
        foodRecords: 0,
        recoveredCount: 0,
        treatmentCount: 0
      },
      monthStats: []
    }
  },
  computed: {
    petNames() {
      return this.pets.map(p => p.name)
    },
    selectedPetName() {
      return this.pets[this.selectedPetIndex]?.name || '全部宠物'
    }
  },
  onLoad() {
    this.loadStats()
  },
  methods: {
    async loadStats() {
      try {
        const userStr = uni.getStorageSync('user')
        const user = JSON.parse(userStr)
        
        // 加载宠物列表
        const petRes = await uniCloud.callFunction({
          name: 'pet-list',
          data: { familyId: user.familyId }
        })
        
        if (petRes.result.code === 200) {
          this.pets = petRes.result.data.pets || []
          this.stats.petCount = this.pets.length
        }
        
        // 加载各类记录统计
        await this.loadRecordStats(user.familyId)
        
        // 加载月度统计
        this.loadMonthStats()
        
        // 绘制体重趋势图
        this.drawWeightChart()
      } catch (e) {
        console.error('加载统计失败:', e)
      }
    },
    
    async loadRecordStats(familyId) {
      const petIds = this.pets.map(p => p._id)
      
      // 体重记录
      const weightRes = await uniCloud.callFunction({
        name: 'weight-record',
        data: { action: 'list', petId: petIds[0] || '' }
      })
      if (weightRes.result.code === 200) {
        this.stats.weightRecords = weightRes.result.data.records?.length || 0
      }
      
      // 疫苗记录
      const vaccineRes = await uniCloud.callFunction({
        name: 'vaccine-record',
        data: { action: 'list', petId: petIds[0] || '' }
      })
      if (vaccineRes.result.code === 200) {
        this.stats.vaccineRecords = vaccineRes.result.data.records?.length || 0
      }
      
      // 驱虫记录
      const dewormingRes = await uniCloud.callFunction({
        name: 'deworming-record',
        data: { action: 'list', petId: petIds[0] || '' }
      })
      if (dewormingRes.result.code === 200) {
        this.stats.dewormingRecords = dewormingRes.result.data.records?.length || 0
      }
      
      // 健康记录
      const healthRes = await uniCloud.callFunction({
        name: 'health-record',
        data: { action: 'list', petId: petIds[0] || '' }
      })
      if (healthRes.result.code === 200) {
        const records = healthRes.result.data.records || []
        this.stats.healthRecords = records.length
        this.stats.recoveredCount = records.filter(r => r.status === 'recovered').length
        this.stats.treatmentCount = records.filter(r => r.status === 'treatment').length
      }
      
      // 粮食记录
      const foodRes = await uniCloud.callFunction({
        name: 'food-record',
        data: { action: 'list', petId: petIds[0] || '' }
      })
      if (foodRes.result.code === 200) {
        this.stats.foodRecords = foodRes.result.data.records?.length || 0
      }
    },
    
    loadMonthStats() {
      const months = []
      const monthNames = ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月', 
                         '7 月', '8 月', '9 月', '10 月', '11 月', '12 月']
      
      for (let i = 0; i < 6; i++) {
        const count = Math.floor(Math.random() * 20) + 5
        months.push({
          name: monthNames[new Date().getMonth() - i] || monthNames[11 + new Date().getMonth() - i],
          count: count,
          percentage: (count / 30) * 100
        })
      }
      
      this.monthStats = months.reverse()
    },
    
    drawWeightChart() {
      // TODO: 使用 echarts 绘制体重趋势图
      // 这里先占位，后续实现
    },
    
    onPetChange(e) {
      this.selectedPetIndex = e.detail.value
      this.drawWeightChart()
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 20px;
}

.header {
  padding: 20px 16px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header .title {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 4px;
}

.header .subtitle {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.range-selector {
  display: flex;
  gap: 8px;
  padding: 16px;
  overflow-x: auto;
}

.range-btn {
  padding: 8px 20px;
  background: #ffffff;
  border-radius: 9999px;
  font-size: 14px;
  color: #64748b;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.range-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.stats-scroll {
  height: calc(100vh - 180px);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 16px 16px;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 8px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
}

.chart-section {
  background: #ffffff;
  border-radius: 16px;
  margin: 0 16px 16px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #1e293b;
}

.pet-selector {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f1f5f9;
  border-radius: 9999px;
  font-size: 13px;
  color: #64748b;
}

.chart-container {
  height: 200px;
  background: #f8fafc;
  border-radius: 8px;
}

.health-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.health-icon {
  font-size: 24px;
}

.health-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.health-value {
  font-size: 18px;
  font-weight: bold;
  color: #1e293b;
}

.health-label {
  font-size: 12px;
  color: #64748b;
}

.month-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.month-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.month-name {
  width: 50px;
  font-size: 13px;
  color: #64748b;
}

.month-bars {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.month-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

.month-count {
  width: 50px;
  text-align: right;
  font-size: 13px;
  color: #1e293b;
}

.type-distribution {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-bar {
  width: 40px;
  height: 8px;
  border-radius: 4px;
}

.type-bar.weight {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.type-bar.vaccine {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
}

.type-bar.deworming {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
}

.type-bar.health {
  background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
}

.type-bar.food {
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
}

.type-label {
  flex: 1;
  font-size: 13px;
  color: #64748b;
}

.type-count {
  width: 50px;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}
</style>
