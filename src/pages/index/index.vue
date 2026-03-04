<template>
  <view class="container">
    <view class="header">
      <view class="user-info" v-if="user">
        <text class="welcome">欢迎，{{ user.username }}</text>
        <text class="logout" @click="handleLogout">退出</text>
      </view>
      <view class="header-bottom">
        <text class="title">我的宠物</text>
        <button class="btn-add" @click="addPet">+ 添加</button>
      </view>
    </view>

    <view class="pet-list">
      <view class="pet-card" v-for="(pet, index) in pets" :key="pet._id || index" @click="goToDetail(pet)">
        <image class="pet-avatar" :src="pet.avatar || '/static/logo.png'" mode="aspectFill" />
        <view class="pet-info">
          <text class="pet-name">{{ pet.name }}</text>
          <text class="pet-breed">{{ pet.breed || '未知品种' }}</text>
          <text class="pet-age">{{ pet.age || '未知年龄' }}</text>
        </view>
        <text class="arrow">›</text>
      </view>

      <view class="empty-state" v-if="pets.length === 0 && !loading">
        <text class="empty-emoji">🐾</text>
        <text class="empty-text">还没有宠物，点击右上角添加</text>
      </view>

      <view class="loading" v-if="loading">
        <text class="loading-spinner">⏳</text>
        <text class="loading-text">加载中...</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      pets: [],
      user: null,
      loading: false
    }
  },
  onLoad() {
    const userStr = uni.getStorageSync('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    } else {
      uni.reLaunch({ url: '/pages/login/login' });
    }
  },
  onShow() {
    this.loadPets();
  },
  methods: {
    async loadPets() {
      this.loading = true;
      try {
        const userStr = uni.getStorageSync('user');
        const user = JSON.parse(userStr);
        
        const res = await uniCloud.callFunction({
          name: 'pet-list',
          data: { familyId: user.familyId }
        });

        this.loading = false;

        if (res.result.code === 200) {
          this.pets = res.result.data.pets || [];
        } else {
          uni.showToast({ title: res.result.message, icon: 'none' });
        }
      } catch (e) {
        this.loading = false;
        console.error('加载宠物列表失败:', e);
        uni.showToast({ title: '加载失败，请稍后重试', icon: 'none' });
      }
    },
    addPet() {
      uni.showModal({
        title: '添加宠物',
        editable: true,
        placeholderText: '请输入宠物名字',
        success: (res) => {
          if (res.confirm && res.content) {
            // TODO: 调用 pet-create 云函数
            uni.showToast({ title: '添加功能开发中', icon: 'none' });
          }
        }
      });
    },
    goToDetail(pet) {
      uni.navigateTo({
        url: `/pages/pet-detail/pet-detail?petId=${pet._id || ''}&name=${pet.name}`
      });
    },
    handleLogout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.clearStorageSync();
            uni.reLaunch({ url: '/pages/login/login' });
          }
        }
      });
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
  
  .user-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding: 12px 15px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    
    .welcome {
      color: #fff;
      font-size: 14px;
    }
    
    .logout {
      color: rgba(255, 255, 255, 0.8);
      font-size: 12px;
      text-decoration: underline;
    }
  }
  
  .header-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .title {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    
    .btn-add {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border: none;
      border-radius: 20px;
      padding: 8px 20px;
      font-size: 14px;
    }
  }
}

.pet-list {
  .pet-card {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    
    .pet-avatar {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background: #eee;
      margin-right: 15px;
    }
    
    .pet-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .pet-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 5px;
        color: #333;
      }
      
      .pet-breed {
        font-size: 14px;
        color: #666;
        margin-bottom: 3px;
      }
      
      .pet-age {
        font-size: 12px;
        color: #999;
      }
    }
    
    .arrow {
      font-size: 24px;
      color: #ccc;
      margin-left: 10px;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  
  .empty-emoji {
    font-size: 60px;
    display: block;
    margin-bottom: 15px;
  }
  
  .empty-text {
    font-size: 16px;
    color: #999;
  }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  
  .loading-spinner {
    font-size: 40px;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    margin-top: 10px;
    color: #999;
    font-size: 14px;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
