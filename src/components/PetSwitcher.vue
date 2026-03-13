<template>
  <view class="pet-switcher" :class="{ 'is-open': isOpen }">
    <!-- 顶部宠物切换栏 -->
    <view class="switcher-bar" @click="toggleDropdown">
      <view class="current-pet">
        <image v-if="currentPet.avatar" :src="currentPet.avatar" class="pet-avatar" mode="aspectFill" />
        <view v-else class="pet-avatar-default">{{ currentPetName ? currentPetName[0] : '宠' }}</view>
        <text class="pet-name">{{ currentPetName || '选择宠物' }}</text>
        <text class="arrow" :class="{ 'arrow-up': isOpen }">▼</text>
      </view>
    </view>
    
    <!-- 下拉宠物列表 -->
    <view v-if="isOpen" class="dropdown-overlay" @click="closeDropdown"></view>
    <view v-if="isOpen" class="dropdown-list">
      <view class="list-header">
        <text class="title">切换宠物</text>
        <text class="close-btn" @click.stop="closeDropdown">✕</text>
      </view>
      
      <scroll-view scroll-y class="scroll-content">
        <view
          v-for="pet in pets"
          :key="pet._id"
          class="pet-item"
          :class="{ 'is-current': pet._id === currentPetId }"
          @click="selectPet(pet)"
        >
          <image v-if="pet.avatar" :src="pet.avatar" class="pet-avatar" mode="aspectFill" />
          <view v-else class="pet-avatar-default">{{ pet.name ? pet.name[0] : '宠' }}</view>
          <view class="pet-info">
            <text class="pet-name">{{ pet.name }}</text>
            <text class="pet-age">{{ pet.age || '' }} {{ pet.species || '' }}</text>
          </view>
          <view v-if="pet._id === currentPetId" class="current-badge">✓</view>
        </view>
        
        <!-- 添加宠物按钮 -->
        <view class="add-pet-btn" @click="goToAddPet">
          <text class="add-icon">+</text>
          <text class="add-text">添加新宠物</text>
        </view>
      </scroll-view>
      
      <!-- 管理宠物入口 -->
      <view class="manage-footer" @click="goToManage">
        <text class="manage-text">宠物管理</text>
        <text class="manage-arrow">></text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PetSwitcher',
  props: {
    // 强制刷新标志
    refreshKey: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      isOpen: false,
      pets: [],
      currentPetId: null,
      currentPet: {}
    };
  },
  computed: {
    currentPetName() {
      return this.currentPet?.name || '';
    }
  },
  watch: {
    refreshKey() {
      this.loadPets();
    }
  },
  mounted() {
    this.loadPets();
  },
  methods: {
    // 加载宠物列表
    async loadPets() {
      try {
        const res = await uniCloud.callFunction({
          name: 'get-pet-list'
        });
        
        if (res.result.code === 200) {
          this.pets = res.result.data.pets || [];
          this.currentPetId = res.result.data.current_pet_id;
          
          // 找到当前宠物
          if (this.currentPetId) {
            this.currentPet = this.pets.find(p => p._id === this.currentPetId) || {};
          } else if (this.pets.length > 0) {
            // 如果没有当前宠物，默认选第一个
            this.currentPet = this.pets[0];
          }
        } else {
          uni.showToast({
            title: res.result.message || '加载失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('Load pets error:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    },
    
    // 切换下拉列表
    toggleDropdown() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.loadPets(); // 打开时刷新数据
      }
    },
    
    // 关闭下拉列表
    closeDropdown() {
      this.isOpen = false;
    },
    
    // 选择宠物
    async selectPet(pet) {
      if (pet._id === this.currentPetId) {
        this.closeDropdown();
        return;
      }
      
      try {
        uni.showLoading({ title: '切换中...' });
        
        const res = await uniCloud.callFunction({
          name: 'switch-pet',
          data: {
            pet_id: pet._id
          }
        });
        
        uni.hideLoading();
        
        if (res.result.code === 200) {
          this.currentPetId = pet._id;
          this.currentPet = pet;
          this.closeDropdown();
          
          uni.showToast({
            title: '已切换到 ' + pet.name,
            icon: 'success'
          });
          
          // 触发切换事件，通知父组件
          this.$emit('pet-switched', pet);
          
          // 刷新页面数据（如果需要）
          setTimeout(() => {
            uni.$emit('petChanged', pet);
          }, 300);
          
        } else {
          uni.showToast({
            title: res.result.message || '切换失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('Switch pet error:', error);
        uni.showToast({
          title: '切换失败',
          icon: 'none'
        });
      }
    },
    
    // 添加新宠物
    goToAddPet() {
      this.closeDropdown();
      uni.navigateTo({
        url: '/pages/add-pet/add-pet'
      });
    },
    
    // 宠物管理
    goToManage() {
      this.closeDropdown();
      uni.navigateTo({
        url: '/pages/pet-manage/pet-manage'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.pet-switcher {
  position: relative;
  z-index: 1000;
}

.switcher-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .current-pet {
    display: flex;
    align-items: center;
    gap: 16rpx;
    
    .pet-avatar {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      border: 3rpx solid rgba(255,255,255,0.5);
    }
    
    .pet-avatar-default {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      color: white;
      font-weight: bold;
      border: 3rpx solid rgba(255,255,255,0.5);
    }
    
    .pet-name {
      font-size: 32rpx;
      color: white;
      font-weight: 600;
    }
    
    .arrow {
      font-size: 24rpx;
      color: rgba(255,255,255,0.8);
      transition: transform 0.3s;
      
      &.arrow-up {
        transform: rotate(180deg);
      }
    }
  }
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1001;
}

.dropdown-list {
  position: fixed;
  top: 0;
  right: 0;
  width: 70%;
  max-width: 600rpx;
  height: 100vh;
  background: white;
  z-index: 1002;
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.3s ease-out;
  
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #e8e8e8;
    
    .title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
    
    .close-btn {
      font-size: 40rpx;
      color: #999;
      padding: 10rpx;
    }
  }
  
  .scroll-content {
    flex: 1;
    overflow-y: auto;
  }
  
  .pet-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
    
    &.is-current {
      background: #f0f4ff;
    }
    
    .pet-avatar,
    .pet-avatar-default {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 24rpx;
      flex-shrink: 0;
    }
    
    .pet-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      
      .pet-name {
        font-size: 30rpx;
        color: #333;
        font-weight: 500;
      }
      
      .pet-age {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .current-badge {
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      background: #667eea;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
    }
  }
  
  .add-pet-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40rpx;
    gap: 16rpx;
    background: #f9f9f9;
    margin: 20rpx;
    border-radius: 12rpx;
    border: 2rpx dashed #ddd;
    
    .add-icon {
      font-size: 40rpx;
      color: #667eea;
      font-weight: bold;
    }
    
    .add-text {
      font-size: 28rpx;
      color: #667eea;
    }
  }
  
  .manage-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    background: #f5f5f5;
    border-top: 1rpx solid #e8e8e8;
    
    .manage-text {
      font-size: 28rpx;
      color: #666;
    }
    
    .manage-arrow {
      font-size: 28rpx;
      color: #999;
    }
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
