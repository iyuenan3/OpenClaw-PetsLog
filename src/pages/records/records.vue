<template>
  <view class="container">
    <view class="header">
      <text class="title">记录管理</text>
    </view>

    <view class="record-types">
      <view class="record-card" @click="goToType('weight')">
        <view class="icon">⚖️</view>
        <text class="name">体重记录</text>
        <text class="desc">记录体重变化曲线</text>
      </view>

      <view class="record-card" @click="goToType('deworming')">
        <view class="icon">💊</view>
        <text class="name">驱虫记录</text>
        <text class="desc">体内/体外驱虫</text>
      </view>

      <view class="record-card" @click="goToType('vaccine')">
        <view class="icon">💉</view>
        <text class="name">疫苗记录</text>
        <text class="desc">疫苗接种记录</text>
      </view>

      <view class="record-card" @click="goToType('health')">
        <view class="icon">🏥</view>
        <text class="name">健康状况</text>
        <text class="desc">症状观察记录</text>
      </view>

      <view class="record-card" @click="goToType('food')">
        <view class="icon">🍖</view>
        <text class="name">粮食记录</text>
        <text class="desc">换粮历史记录</text>
      </view>
    </view>

    <!-- 最近记录 -->
    <view class="recent-section">
      <text class="section-title">最近记录</text>
      <view class="recent-list">
        <view class="recent-item" v-for="(item, index) in recentRecords" :key="index">
          <view class="recent-icon">{{ item.icon }}</view>
          <view class="recent-info">
            <text class="recent-pet">{{ item.petName }}</text>
            <text class="recent-desc">{{ item.desc }}</text>
          </view>
          <text class="recent-date">{{ item.date }}</text>
        </view>
        <text class="empty-text" v-if="recentRecords.length === 0">暂无记录</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      recentRecords: [
        { icon: '⚖️', petName: '小葵', desc: '体重：5.2kg', date: '今天' },
        { icon: '💊', petName: '飞流', desc: '体外驱虫', date: '昨天' },
        { icon: '💉', petName: '乔治', desc: '疫苗接种', date: '3 天前' }
      ]
    }
  },
  methods: {
    goToType(type) {
      uni.showModal({
        title: '记录管理',
        content: `${this.getTypeName(type)} 功能开发中`,
        showCancel: false
      });
    },
    getTypeName(type) {
      const names = {
        weight: '体重记录',
        deworming: '驱虫记录',
        vaccine: '疫苗记录',
        health: '健康状况',
        food: '粮食记录'
      };
      return names[type] || '';
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20px;
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  margin-bottom: 20px;
  
  .title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }
}

.record-types {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 30px;
  
  .record-card {
    width: 48%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    border-radius: 12px;
    padding: 25px 20px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    
    .icon {
      font-size: 40px;
      margin-bottom: 10px;
    }
    
    .name {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    
    .desc {
      font-size: 12px;
      color: #999;
    }
  }
}

.recent-section {
  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    display: block;
    color: #333;
  }
  
  .recent-list {
    .recent-item {
      display: flex;
      align-items: center;
      background: #fff;
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      
      .recent-icon {
        font-size: 30px;
        margin-right: 15px;
      }
      
      .recent-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        
        .recent-pet {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin-bottom: 3px;
        }
        
        .recent-desc {
          font-size: 12px;
          color: #666;
        }
      }
      
      .recent-date {
        font-size: 12px;
        color: #999;
      }
    }
    
    .empty-text {
      text-align: center;
      color: #999;
      padding: 20px;
    }
  }
}
</style>
