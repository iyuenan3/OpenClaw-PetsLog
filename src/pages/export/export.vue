<template>
  <view class="container">
    <view class="header">
      <text class="title">📤 数据导出</text>
      <text class="subtitle">导出宠物健康记录为 Excel 或 PDF</text>
    </view>
    
    <view class="form-section">
      <view class="section-title">选择数据类型</view>
      
      <view class="option-grid">
        <view 
          class="option-card"
          :class="{ active: dataType === 'all' }"
          @click="dataType = 'all'"
        >
          <text class="option-icon">📊</text>
          <text class="option-text">全部数据</text>
        </view>
        
        <view 
          class="option-card"
          :class="{ active: dataType === 'food' }"
          @click="dataType = 'food'"
        >
          <text class="option-icon">🍽️</text>
          <text class="option-text">喂食记录</text>
        </view>
        
        <view 
          class="option-card"
          :class="{ active: dataType === 'health' }"
          @click="dataType = 'health'"
        >
          <text class="option-icon">🏥</text>
          <text class="option-text">健康记录</text>
        </view>
        
        <view 
          class="option-card"
          :class="{ active: dataType === 'weight' }"
          @click="dataType = 'weight'"
        >
          <text class="option-icon">⚖️</text>
          <text class="option-text">体重记录</text>
        </view>
        
        <view 
          class="option-card"
          :class="{ active: dataType === 'vaccine' }"
          @click="dataType = 'vaccine'"
        >
          <text class="option-icon">💉</text>
          <text class="option-text">疫苗记录</text>
        </view>
        
        <view 
          class="option-card"
          :class="{ active: dataType === 'medication' }"
          @click="dataType = 'medication'"
        >
          <text class="option-icon">💊</text>
          <text class="option-text">用药记录</text>
        </view>
      </view>
    </view>
    
    <view class="form-section">
      <view class="section-title">时间范围</view>
      
      <view class="date-range">
        <view class="date-item">
          <text class="date-label">开始日期</text>
          <picker mode="date" :value="startDateStr" @change="onStartDateChange">
            <view class="date-picker">
              <text>{{ startDateStr || '选择开始日期' }}</text>
            </view>
          </picker>
        </view>
        
        <view class="date-item">
          <text class="date-label">结束日期</text>
          <picker mode="date" :value="endDateStr" @change="onEndDateChange">
            <view class="date-picker">
              <text>{{ endDateStr || '选择结束日期' }}</text>
            </view>
          </picker>
        </view>
      </view>
      
      <view class="quick-dates">
        <view class="quick-tag" @click="setDateRange(7)">最近 7 天</view>
        <view class="quick-tag" @click="setDateRange(30)">最近 30 天</view>
        <view class="quick-tag" @click="setDateRange(90)">最近 90 天</view>
        <view class="quick-tag" @click="setDateRange('all')">全部</view>
      </view>
    </view>
    
    <view class="form-section">
      <view class="section-title">导出格式</view>
      
      <view class="format-selector">
        <view 
          class="format-btn"
          :class="{ active: format === 'excel' }"
          @click="format = 'excel'"
        >
          <text class="format-icon">📗</text>
          <text class="format-text">Excel</text>
        </view>
        
        <view 
          class="format-btn"
          :class="{ active: format === 'pdf' }"
          @click="format = 'pdf'"
        >
          <text class="format-icon">📕</text>
          <text class="format-text">PDF</text>
        </view>
      </view>
    </view>
    
    <view class="form-section">
      <view class="section-title">选择宠物</view>
      <view class="pet-selector-info">
        <text class="info-text">将导出您所有宠物的数据</text>
        <text class="pet-count">共 {{ petCount }} 只宠物</text>
      </view>
    </view>
    
    <view class="action-section">
      <button class="btn-export" @click="handleExport" :disabled="exporting">
        <text v-if="!exporting">🚀 开始导出</text>
        <text v-else>导出中...</text>
      </button>
      
      <button class="btn-history" @click="goToHistory">
        <text>📋 查看导出历史</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Export',
  data() {
    return {
      dataType: 'all',
      startDateStr: '',
      endDateStr: '',
      startDate: null,
      endDate: null,
      format: 'excel',
      exporting: false,
      petCount: 0
    };
  },
  onLoad() {
    this.loadPetCount();
    // 默认最近 30 天
    this.setDateRange(30);
  },
  methods: {
    // 加载宠物数量
    async loadPetCount() {
      try {
        const res = await uniCloud.callFunction({
          name: 'get-pet-list'
        });
        
        if (res.result.code === 200) {
          this.petCount = res.result.data.total || 0;
        }
      } catch (error) {
        console.error('Load pet count error:', error);
      }
    },
    
    // 设置快捷日期范围
    setDateRange(days) {
      const now = new Date();
      this.endDate = now.getTime();
      this.endDateStr = this.formatDate(now);
      
      if (days === 'all') {
        this.startDate = null;
        this.startDateStr = '';
      } else {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        this.startDate = startDate.getTime();
        this.startDateStr = this.formatDate(startDate);
      }
    },
    
    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    
    // 开始日期选择
    onStartDateChange(e) {
      this.startDateStr = e.detail.value;
      this.startDate = new Date(e.detail.value).getTime();
    },
    
    // 结束日期选择
    onEndDateChange(e) {
      this.endDateStr = e.detail.value;
      this.endDate = new Date(e.detail.value).getTime();
    },
    
    // 执行导出
    async handleExport() {
      if (this.exporting) return;
      
      this.exporting = true;
      
      try {
        uni.showLoading({ title: '正在导出...' });
        
        const res = await uniCloud.callFunction({
          name: 'export-data',
          data: {
            data_type: this.dataType,
            start_date: this.startDate,
            end_date: this.endDate,
            format: this.format
          }
        });
        
        uni.hideLoading();
        
        if (res.result.code === 200) {
          const data = res.result.data;
          
          uni.showModal({
            title: '导出成功',
            content: `共导出 ${this.formatRecordCount(data.record_count)} 条记录\n文件名：${data.file_name}`,
            showCancel: false,
            confirmText: '好的'
          });
          
          // 这里可以添加下载逻辑
          // 实际使用中，需要将数据转换为文件并下载
          
        } else {
          uni.showToast({
            title: res.result.message || '导出失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('Export error:', error);
        uni.showToast({
          title: '导出失败，请重试',
          icon: 'none'
        });
      } finally {
        this.exporting = false;
      }
    },
    
    // 格式化记录数量显示
    formatRecordCount(count) {
      const total = Object.values(count).reduce((sum, num) => sum + num, 0);
      return total;
    },
    
    // 跳转到导出历史
    goToHistory() {
      uni.navigateTo({
        url: '/pages/backup-history/backup-history'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx 60rpx;
  
  .title {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    color: white;
    margin-bottom: 10rpx;
  }
  
  .subtitle {
    display: block;
    font-size: 26rpx;
    color: rgba(255,255,255,0.8);
  }
}

.form-section {
  background: white;
  margin: 20rpx 30rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  
  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  
  .option-card {
    background: #f9f9f9;
    border-radius: 12rpx;
    padding: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
    border: 2rpx solid transparent;
    
    &.active {
      background: #f0f4ff;
      border-color: #667eea;
    }
    
    .option-icon {
      font-size: 40rpx;
    }
    
    .option-text {
      font-size: 22rpx;
      color: #666;
    }
  }
}

.date-range {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
  
  .date-item {
    flex: 1;
    
    .date-label {
      display: block;
      font-size: 24rpx;
      color: #999;
      margin-bottom: 10rpx;
    }
    
    .date-picker {
      background: #f5f5f5;
      border-radius: 8rpx;
      padding: 20rpx;
      font-size: 26rpx;
      color: #333;
    }
  }
}

.quick-dates {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
  
  .quick-tag {
    background: #f0f4ff;
    color: #667eea;
    font-size: 24rpx;
    padding: 10rpx 20rpx;
    border-radius: 20rpx;
  }
}

.format-selector {
  display: flex;
  gap: 20rpx;
  
  .format-btn {
    flex: 1;
    background: #f9f9f9;
    border-radius: 12rpx;
    padding: 30rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
    border: 2rpx solid transparent;
    
    &.active {
      background: #f0f4ff;
      border-color: #667eea;
    }
    
    .format-icon {
      font-size: 48rpx;
    }
    
    .format-text {
      font-size: 26rpx;
      color: #666;
    }
  }
}

.pet-selector-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .info-text {
    font-size: 26rpx;
    color: #666;
  }
  
  .pet-count {
    font-size: 26rpx;
    color: #667eea;
    font-weight: 600;
  }
}

.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background: white;
  box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  
  .btn-export {
    width: 100%;
    height: 80rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 30rpx;
    border-radius: 40rpx;
    border: none;
    
    &:disabled {
      opacity: 0.6;
    }
  }
  
  .btn-history {
    width: 100%;
    height: 80rpx;
    background: #f5f5f5;
    color: #666;
    font-size: 30rpx;
    border-radius: 40rpx;
    border: none;
  }
}
</style>
