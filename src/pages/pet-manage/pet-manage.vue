<template>
  <view class="container">
    <view class="header">
      <text class="title">🐾 宠物管理</text>
      <text class="subtitle">管理您的宠物家庭成员</text>
    </view>
    
    <!-- 宠物列表 -->
    <view class="pet-list">
      <view v-if="loading" class="loading">
        <text>加载中...</text>
      </view>
      
      <view v-else-if="pets.length === 0" class="empty">
        <text class="empty-icon">🐶</text>
        <text class="empty-text">还没有宠物</text>
        <text class="empty-hint">点击下方按钮添加第一只宠物</text>
      </view>
      
      <view v-else>
        <view
          v-for="(pet, index) in pets"
          :key="pet._id"
          class="pet-card"
          :class="{ 'is-current': pet._id === currentPetId }"
        >
          <view class="pet-main">
            <image v-if="pet.avatar" :src="pet.avatar" class="pet-avatar" mode="aspectFill" />
            <view v-else class="pet-avatar-default">{{ pet.name ? pet.name[0] : '宠' }}</view>
            
            <view class="pet-info">
              <view class="pet-header">
                <text class="pet-name">{{ pet.name }}</text>
                <view v-if="pet._id === currentPetId" class="current-tag">当前</view>
              </view>
              <text class="pet-detail">{{ pet.age || '' }} {{ pet.species || '' }} {{ pet.gender === 'male' ? '♂' : '♀' }}</text>
              <text class="pet-detail">{{ pet.breed || '未知品种' }}</text>
            </view>
          </view>
          
          <view class="pet-actions">
            <button class="action-btn edit" @click="editPet(pet)">编辑</button>
            <button class="action-btn delete" @click="confirmDelete(pet)">删除</button>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 添加宠物按钮 -->
    <view class="add-button-wrapper">
      <button class="add-button" @click="goToAddPet">
        <text class="add-icon">+</text>
        <text class="add-text">添加新宠物</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PetManage',
  data() {
    return {
      loading: false,
      pets: [],
      currentPetId: null
    };
  },
  onLoad() {
    this.loadPets();
    
    // 监听添加宠物后返回
    uni.$on('petAdded', () => {
      this.loadPets();
    });
  },
  onUnload() {
    uni.$off('petAdded');
  },
  methods: {
    // 加载宠物列表
    async loadPets() {
      this.loading = true;
      
      try {
        const res = await uniCloud.callFunction({
          name: 'get-pet-list'
        });
        
        if (res.result.code === 200) {
          this.pets = res.result.data.pets || [];
          this.currentPetId = res.result.data.current_pet_id;
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
      } finally {
        this.loading = false;
      }
    },
    
    // 编辑宠物
    editPet(pet) {
      uni.navigateTo({
        url: '/pages/edit-pet/edit-pet?id=' + pet._id
      });
    },
    
    // 确认删除
    confirmDelete(pet) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除宠物「' + pet.name + '」吗？删除后相关记录也将无法查看。',
        confirmText: '删除',
        confirmColor: '#ff4d4f',
        success: async (res) => {
          if (res.confirm) {
            await this.deletePet(pet);
          }
        }
      });
    },
    
    // 删除宠物
    async deletePet(pet) {
      try {
        uni.showLoading({ title: '删除中...' });
        
        const res = await uniCloud.callFunction({
          name: 'pet-delete',
          data: {
            pet_id: pet._id
          }
        });
        
        uni.hideLoading();
        
        if (res.result.code === 200) {
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });
          
          // 刷新列表
          this.loadPets();
          
          // 通知其他页面宠物已删除
          uni.$emit('petDeleted', pet._id);
        } else {
          uni.showToast({
            title: res.result.message || '删除失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('Delete pet error:', error);
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        });
      }
    },
    
    // 添加新宠物
    goToAddPet() {
      uni.navigateTo({
        url: '/pages/add-pet/add-pet'
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

.pet-list {
  padding: 0 30rpx;
  margin-top: -30rpx;
  
  .loading,
  .empty {
    text-align: center;
    padding: 100rpx 30rpx;
    
    .empty-icon {
      font-size: 120rpx;
      display: block;
      margin-bottom: 20rpx;
    }
    
    .empty-text {
      display: block;
      font-size: 32rpx;
      color: #666;
      margin-bottom: 10rpx;
    }
    
    .empty-hint {
      display: block;
      font-size: 26rpx;
      color: #999;
    }
  }
}

.pet-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
  
  &.is-current {
    border: 2rpx solid #667eea;
    background: #f0f4ff;
  }
  
  .pet-main {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .pet-avatar,
    .pet-avatar-default {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      margin-right: 24rpx;
      flex-shrink: 0;
    }
    
    .pet-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      
      .pet-header {
        display: flex;
        align-items: center;
        gap: 12rpx;
        
        .pet-name {
          font-size: 32rpx;
          font-weight: 600;
          color: #333;
        }
        
        .current-tag {
          background: #667eea;
          color: white;
          font-size: 20rpx;
          padding: 4rpx 12rpx;
          border-radius: 20rpx;
        }
      }
      
      .pet-detail {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
  
  .pet-actions {
    display: flex;
    gap: 20rpx;
    border-top: 1rpx solid #f0f0f0;
    padding-top: 20rpx;
    
    .action-btn {
      flex: 1;
      height: 60rpx;
      line-height: 60rpx;
      font-size: 26rpx;
      border-radius: 30rpx;
      
      &.edit {
        background: #667eea;
        color: white;
      }
      
      &.delete {
        background: #fff0f0;
        color: #ff4d4f;
      }
    }
  }
}

.add-button-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background: white;
  box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.05);
  z-index: 100;
  
  .add-button {
    width: 100%;
    height: 80rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    
    .add-icon {
      font-size: 40rpx;
      color: white;
      font-weight: bold;
    }
    
    .add-text {
      font-size: 30rpx;
      color: white;
      font-weight: 500;
    }
  }
}
</style>
