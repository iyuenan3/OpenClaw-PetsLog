<template>
  <view class="container">
    <view class="pet-header">
      <image class="avatar" :src="petInfo.avatar || '/static/logo.png'" mode="aspectFill" />
      <view class="info">
        <text class="name">{{ petInfo.name }}</text>
        <text class="breed">{{ petInfo.breed || '未知品种' }}</text>
        <text class="age">{{ petInfo.age || '' }}</text>
      </view>
    </view>

    <view class="tabs">
      <scroll-view scroll-x class="tab-scroll">
        <view class="tab" :class="{ active: currentTab === 'overview' }" @click="currentTab = 'overview'">
          <text>📋 概览</text>
        </view>
        <view class="tab" :class="{ active: currentTab === 'weight' }" @click="currentTab = 'weight'">
          <text>⚖️ 体重</text>
        </view>
        <view class="tab" :class="{ active: currentTab === 'health' }" @click="currentTab = 'health'">
          <text>🏥 健康</text>
        </view>
        <view class="tab" :class="{ active: currentTab === 'food' }" @click="currentTab = 'food'">
          <text>🍖 粮食</text>
        </view>
        <view class="tab" :class="{ active: currentTab === 'vaccine' }" @click="currentTab = 'vaccine'">
          <text>💉 疫苗</text>
        </view>
        <view class="tab" :class="{ active: currentTab === 'deworming' }" @click="currentTab = 'deworming'">
          <text>💊 驱虫</text>
        </view>
      </scroll-view>
    </view>

    <view class="content">
      <!-- 概览 -->
      <view v-if="currentTab === 'overview'" class="overview">
        <text class="section-title">基本信息</text>
        <view class="info-item"><text>品种：</text><text>{{ petInfo.breed || '-' }}</text></view>
        <view class="info-item"><text>性别：</text><text>{{ petInfo.gender === 'male' ? '公' : petInfo.gender === 'female' ? '母' : '-' }}</text></view>
        <view class="info-item"><text>年龄：</text><text>{{ petInfo.age || '-' }}</text></view>
        <view class="info-item"><text>毛色：</text><text>{{ petInfo.color || '-' }}</text></view>
        <view class="info-item"><text>绝育：</text><text>{{ petInfo.neutered ? '已绝育' : '未绝育' }}</text></view>
        <view class="info-item" v-if="petInfo.neutered"><text>绝育日期：</text><text>{{ formatDate(petInfo.neuterDate) }}</text></view>
        <view class="info-item" v-if="petInfo.notes"><text>备注：</text><text>{{ petInfo.notes }}</text></view>
      </view>
      
      <!-- 体重 -->
      <view v-else-if="currentTab === 'weight'" class="tab-content">
        <text class="section-title">体重记录</text>
        <view class="add-btn" @click="addRecord('weight')">
          <text>+ 添加记录</text>
        </view>
        <view class="record-list">
          <view class="record-item" v-for="(record, index) in weightRecords" :key="record._id || index">
            <text class="record-value">{{ record.weight }} kg</text>
            <text class="record-date">{{ formatDate(record.recordedAt) }}</text>
          </view>
          <text class="empty-text" v-if="weightRecords.length === 0">暂无记录</text>
        </view>
      </view>

      <!-- 其他 Tab 占位 -->
      <view v-else class="placeholder">
        <text>{{ getTabName(currentTab) }} 功能开发中...</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <u-button type="error" size="small" @click="deletePet" text="删除宠物" />
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      petId: '',
      petInfo: {
        name: '',
        breed: '',
        age: '',
        gender: '',
        color: '',
        neutered: false,
        neuterDate: 0,
        notes: '',
        avatar: ''
      },
      currentTab: 'overview',
      weightRecords: []
    }
  },
  onLoad(options) {
    if (options.petId) {
      this.petId = options.petId;
      this.loadPetDetail();
    } else if (options.name) {
      this.petInfo.name = options.name;
    }
  },
  methods: {
    async loadPetDetail() {
      try {
        // TODO: 调用 pet-detail 云函数（或从 pet-list 获取）
        // 暂时使用测试数据
        this.petInfo = {
          name: '小葵',
          breed: '西伯利亚猫',
          age: '6 岁 10 个月',
          gender: 'female',
          color: '金色',
          neutered: true,
          neuterDate: Date.now() - 365 * 24 * 60 * 60 * 1000,
          notes: '焦虑性舔毛',
          avatar: ''
        };
      } catch (e) {
        console.error('加载宠物详情失败:', e);
      }
    },
    async loadWeightRecords() {
      try {
        const res = await uniCloud.callFunction({
          name: 'weight-record',
          data: {
            action: 'list',
            petId: this.petId
          }
        });
        if (res.result.code === 200) {
          this.weightRecords = res.result.data.records || [];
        }
      } catch (e) {
        console.error('加载体重记录失败:', e);
      }
    },
    addRecord(type) {
      uni.showModal({
        title: '添加记录',
        editable: true,
        placeholderText: type === 'weight' ? '请输入体重 (kg)' : '请输入内容',
        success: (res) => {
          if (res.confirm && res.content) {
            // TODO: 调用对应云函数
            uni.showToast({ title: '添加功能开发中', icon: 'none' });
          }
        }
      });
    },
    deletePet() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这只宠物吗？相关记录也会被删除。',
        success: (res) => {
          if (res.confirm) {
            // TODO: 调用 pet-delete 云函数
            uni.showToast({ title: '删除功能开发中', icon: 'none' });
          }
        }
      });
    },
    formatDate(timestamp) {
      if (!timestamp) return '-';
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    },
    getTabName(tab) {
      const names = {
        health: '健康状况',
        food: '粮食记录',
        vaccine: '疫苗记录',
        deworming: '驱虫记录'
      };
      return names[tab] || '';
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 70px;
}

.pet-header {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 20px;
  
  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 40px;
    background: #fff;
    margin-right: 20px;
  }
  
  .info {
    display: flex;
    flex-direction: column;
    
    .name {
      font-size: 24px;
      font-weight: bold;
      color: #fff;
    }
    
    .breed, .age {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 5px;
    }
  }
}

.tabs {
  background: #fff;
  border-bottom: 1px solid #eee;
  
  .tab-scroll {
    white-space: nowrap;
  }
  
  .tab {
    display: inline-block;
    padding: 15px 20px;
    font-size: 14px;
    color: #666;
    
    &.active {
      color: #667eea;
      border-bottom: 2px solid #667eea;
    }
  }
}

.content {
  padding: 20px;
  
  .overview {
    .section-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
      display: block;
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 15px;
      background: #fff;
      border-radius: 8px;
      margin-bottom: 10px;
    }
  }
  
  .tab-content {
    .section-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
      display: block;
    }
    
    .add-btn {
      padding: 12px 15px;
      background: #667eea;
      color: #fff;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 15px;
    }
    
    .record-list {
      .record-item {
        display: flex;
        justify-content: space-between;
        padding: 12px 15px;
        background: #fff;
        border-radius: 8px;
        margin-bottom: 10px;
        
        .record-value {
          font-weight: bold;
          color: #667eea;
        }
        
        .record-date {
          color: #999;
          font-size: 12px;
        }
      }
      
      .empty-text {
        text-align: center;
        color: #999;
        padding: 20px;
      }
    }
  }
  
  .placeholder {
    text-align: center;
    padding: 60px 20px;
    color: #999;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 20px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
</style>
