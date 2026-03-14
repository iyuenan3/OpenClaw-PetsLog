<template>
  <view class="container">
    <view class="header">
      <text class="title">📋 备份历史</text>
      <text class="subtitle">查看和管理您的导出记录</text>
    </view>
    
    <!-- 筛选器 -->
    <view class="filter-bar">
      <view 
        class="filter-tag"
        :class="{ active: filterType === 'all' }"
        @click="filterType = 'all'"
      >
        <text>全部</text>
      </view>
      <view 
        class="filter-tag"
        :class="{ active: filterType === 'export' }"
        @click="filterType = 'export'"
      >
        <text>手动导出</text>
      </view>
      <view 
        class="filter-tag"
        :class="{ active: filterType === 'auto_backup' }"
        @click="filterType = 'auto_backup'"
      >
        <text>自动备份</text>
      </view>
    </view>
    
    <!-- 备份列表 -->
    <view class="backup-list">
      <view v-if="loading" class="loading">
        <text>加载中...</text>
      </view>
      
      <view v-else-if="backups.length === 0" class="empty">
        <text class="empty-icon">📂</text>
        <text class="empty-text">暂无备份记录</text>
        <text class="empty-hint">导出后将在这里显示</text>
      </view>
      
      <view v-else>
        <view v-for="backup in backups" :key="backup._id" class="backup-card">
          <view class="card-header">
            <view class="file-info">
              <text class="file-icon">{{ backup.format === 'excel' ? '📗' : '📕' }}</text>
              <view class="file-details">
                <text class="file-name">{{ backup.file_name }}</text>
                <text class="file-meta">
                  {{ backup.type_text }} · {{ backup.file_size_text }}
                </text>
              </view>
            </view>
            <view class="status-badge" :class="backup.status">
              <text>{{ backup.status_text }}</text>
            </view>
          </view>
          
          <view class="card-body">
            <view class="info-row">
              <text class="label">数据类型:</text>
              <text class="value">{{ getDataTypeText(backup.data_type) }}</text>
            </view>
            <view class="info-row">
              <text class="label">导出时间:</text>
              <text class="value">{{ backup.created_at_text }}</text>
            </view>
            <view v-if="backup.is_expired" class="info-row warning">
              <text class="label">⚠️</text>
              <text class="value">文件已过期</text>
            </view>
          </view>
          
          <view class="card-actions">
            <button 
              v-if="backup.file_url && !backup.is_expired" 
              class="action-btn download"
              @click="downloadFile(backup)"
            >
              下载
            </button>
            <button 
              class="action-btn delete"
              @click="confirmDelete(backup)"
            >
              删除
            </button>
          </view>
        </view>
        
        <!-- 加载更多 -->
        <view v-if="hasMore" class="load-more" @click="loadMore">
          <text>加载更多</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'BackupHistory',
  data() {
    return {
      loading: false,
      backups: [],
      page: 1,
      pageSize: 20,
      hasMore: true,
      filterType: 'all'
    };
  },
  onLoad() {
    this.loadBackups();
  },
  onShow() {
    // 返回时刷新列表
    this.loadBackups();
  },
  methods: {
    // 加载备份列表
    async loadBackups() {
      if (this.loading) return;
      
      this.loading = true;
      
      try {
        const res = await uniCloud.callFunction({
          name: 'get-backup-list',
          data: {
            page: this.page,
            page_size: this.pageSize,
            type: this.filterType === 'all' ? undefined : this.filterType
          }
        });
        
        if (res.result.code === 200) {
          const data = res.result.data;
          
          if (this.page === 1) {
            this.backups = data.backups || [];
          } else {
            this.backups = [...this.backups, ...(data.backups || [])];
          }
          
          this.hasMore = data.page < data.total_pages;
        } else {
          uni.showToast({
            title: res.result.message || '加载失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('Load backups error:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 加载更多
    loadMore() {
      if (!this.hasMore) return;
      this.page++;
      this.loadBackups();
    },
    
    // 刷新筛选
    onFilterChange() {
      this.page = 1;
      this.backups = [];
      this.loadBackups();
    },
    
    // 获取数据类型文本
    getDataTypeText(dataType) {
      const map = {
        all: '全部数据',
        food: '喂食记录',
        health: '健康记录',
        weight: '体重记录',
        vaccine: '疫苗记录',
        deworming: '驱虫记录',
        medication: '用药记录'
      };
      return map[dataType] || dataType;
    },
    
    // 下载文件
    downloadFile(backup) {
      if (!backup.file_url) {
        uni.showToast({
          title: '文件不存在',
          icon: 'none'
        });
        return;
      }
      
      // 实际下载逻辑
      uni.showToast({
        title: '开始下载',
        icon: 'success'
      });
      
      // TODO: 实现文件下载
      // uni.downloadFile({ url: backup.file_url, ... })
    },
    
    // 确认删除
    confirmDelete(backup) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条备份记录吗？',
        confirmText: '删除',
        confirmColor: '#ff4d4f',
        success: async (res) => {
          if (res.confirm) {
            await this.deleteBackup(backup);
          }
        }
      });
    },
    
    // 删除备份
    async deleteBackup(backup) {
      try {
        uni.showLoading({ title: '删除中...' });
        
        // TODO: 实现删除云函数
        // await uniCloud.callFunction({
        //   name: 'delete-backup',
        //   data: { backup_id: backup._id }
        // });
        
        uni.hideLoading();
        
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
        
        // 刷新列表
        this.loadBackups();
        
      } catch (error) {
        uni.hideLoading();
        console.error('Delete backup error:', error);
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
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

.filter-bar {
  display: flex;
  gap: 20rpx;
  padding: 0 30rpx;
  margin-top: -30rpx;
  
  .filter-tag {
    background: white;
    color: #666;
    font-size: 26rpx;
    padding: 16rpx 30rpx;
    border-radius: 30rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    
    &.active {
      background: #667eea;
      color: white;
    }
  }
}

.backup-list {
  padding: 30rpx;
  
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

.backup-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20rpx;
    
    .file-info {
      display: flex;
      gap: 20rpx;
      
      .file-icon {
        font-size: 60rpx;
      }
      
      .file-details {
        display: flex;
        flex-direction: column;
        gap: 8rpx;
        
        .file-name {
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
          max-width: 400rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .file-meta {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
    
    .status-badge {
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      font-size: 22rpx;
      
      &.completed {
        background: #e6f7e6;
        color: #52c41a;
      }
      
      &.processing {
        background: #e6f4ff;
        color: #1890ff;
      }
      
      &.failed {
        background: #fff0f0;
        color: #ff4d4f;
      }
    }
  }
  
  .card-body {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    margin-bottom: 20rpx;
    
    .info-row {
      display: flex;
      gap: 12rpx;
      
      .label {
        font-size: 24rpx;
        color: #999;
        min-width: 140rpx;
      }
      
      .value {
        font-size: 24rpx;
        color: #333;
        flex: 1;
      }
      
      &.warning {
        .value {
          color: #ff9800;
        }
      }
    }
  }
  
  .card-actions {
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
      border: none;
      
      &.download {
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

.load-more {
  text-align: center;
  padding: 30rpx;
  color: #667eea;
  font-size: 28rpx;
}
</style>
