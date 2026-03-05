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
        <view class="avatar-wrapper">
          <image 
            class="pet-avatar" 
            :src="pet.avatar || '/static/logo.png'" 
            mode="aspectFill"
            lazy-load
          />
        </view>
        <view class="pet-info">
          <text class="pet-name">{{ pet.name }}</text>
          <text class="pet-breed">{{ pet.breed || '未知品种' }}</text>
          <view class="pet-meta">
            <text>{{ pet.age || '未知年龄' }}</text>
            <text class="dot">•</text>
            <text>{{ pet.gender === 'male' ? '公' : pet.gender === 'female' ? '母' : '未知' }}</text>
          </view>
        </view>
        <text class="more-btn">⋮</text>
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

<style>
.container {
  padding: 20px;
  min-height: 100vh;
  background: #f8fafc;
}

.header {
  margin-bottom: 24px;
}

.header .user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 10px 15px rgba(102, 126, 234, 0.2);
}

.header .user-info .welcome {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.header .user-info .logout {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  text-decoration: underline;
  padding: 4px 8px;
}

.header .user-info .logout:active {
  opacity: 0.7;
}

.header .header-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header .header-bottom .title {
  font-size: 24px;
  font-weight: bold;
  color: #1e293b;
}

.header .header-bottom .btn-add {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 10px 15px rgba(102, 126, 234, 0.2);
  transition: all 0.2s ease;
}

.header .header-bottom .btn-add:active {
  transform: scale(0.95);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pet-list .pet-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.pet-list .pet-card:active {
  transform: scale(0.98);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.pet-list .pet-card .avatar-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 9999px;
  padding: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-right: 16px;
  flex-shrink: 0;
}

.pet-list .pet-card .avatar-wrapper .pet-avatar {
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  border: 2px solid #ffffff;
  object-fit: cover;
}

.pet-list .pet-card .pet-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pet-list .pet-card .pet-info .pet-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
  color: #1e293b;
}

.pet-list .pet-card .pet-info .pet-breed {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
}

.pet-list .pet-card .pet-info .pet-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #94a3b8;
}

.pet-list .pet-card .pet-info .pet-meta .dot {
  color: #94a3b8;
}

.pet-list .pet-card .more-btn {
  font-size: 20px;
  color: #94a3b8;
  padding: 8px;
  margin-left: 12px;
}

.pet-list .pet-card .more-btn:active {
  opacity: 0.6;
}

.empty-state {
  text-align: center;
  padding: 32px 20px;
}

.empty-state .empty-emoji {
  font-size: 60px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state .empty-text {
  font-size: 16px;
  color: #64748b;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.loading .loading-spinner {
  font-size: 40px;
  animation: spin 1s linear infinite;
}

.loading .loading-text {
  margin-top: 10px;
  color: #999;
  font-size: 14px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
