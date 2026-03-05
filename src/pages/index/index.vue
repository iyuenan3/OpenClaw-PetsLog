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
        <image 
          class="pet-avatar" 
          :src="pet.avatar || '/static/logo.png'" 
          mode="aspectFill"
          lazy-load
          show-menu-by-longpress
        />
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
      uni.navigateTo({
        url: '/pages/add-pet/add-pet'
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
@import '../../styles/variables.scss';

.container {
  padding: var(--spacing-xl);
  min-height: 100vh;
  background: var(--bg-primary);
}

.header {
  margin-bottom: var(--spacing-2xl);
  
  .user-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--gradient-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-primary);
    
    .welcome {
      color: var(--text-inverse);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }
    
    .logout {
      color: rgba(255, 255, 255, 0.8);
      font-size: var(--font-size-xs);
      text-decoration: underline;
      padding: var(--spacing-xs) var(--spacing-sm);
      
      &:active {
        opacity: 0.7;
      }
    }
  }
  
  .header-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
    }
    
    .btn-add {
      background: var(--gradient-primary);
      color: var(--text-inverse);
      border: none;
      border-radius: var(--radius-full);
      padding: var(--spacing-sm) var(--spacing-lg);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      box-shadow: var(--shadow-primary);
      transition: all var(--transition-base);
      
      &:active {
        transform: scale(0.95);
        box-shadow: var(--shadow-sm);
      }
    }
  }
}

.pet-list {
  .pet-card {
    display: flex;
    align-items: center;
    background: var(--bg-surface);
    border-radius: var(--radius-xl);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    box-shadow: var(--shadow-md);
    transition: all var(--transition-slow);
    
    &:active {
      transform: scale(0.98);
      box-shadow: var(--shadow-lg);
    }
    
    .avatar-wrapper {
      width: 60px;
      height: 60px;
      border-radius: var(--radius-full);
      padding: 3px;
      background: var(--gradient-primary);
      margin-right: var(--spacing-lg);
      flex-shrink: 0;
      
      .pet-avatar {
        width: 100%;
        height: 100%;
        border-radius: var(--radius-full);
        border: 2px solid var(--bg-surface);
        object-fit: cover;
      }
    }
    
    .pet-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .pet-name {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        margin-bottom: var(--spacing-xs);
        color: var(--text-primary);
      }
      
      .pet-breed {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        margin-bottom: var(--spacing-xs);
      }
      
      .pet-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--font-size-xs);
        color: var(--text-tertiary);
        
        .dot {
          color: var(--text-tertiary);
        }
      }
    }
    
    .more-btn {
      font-size: var(--font-size-xl);
      color: var(--text-tertiary);
      padding: var(--spacing-sm);
      margin-left: var(--spacing-md);
      
      &:active {
        opacity: 0.6;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-xl);
  
  .empty-emoji {
    font-size: 60px;
    display: block;
    margin-bottom: var(--spacing-lg);
    opacity: 0.5;
  }
  
  .empty-text {
    font-size: var(--font-size-md);
    color: var(--text-secondary);
  }
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
