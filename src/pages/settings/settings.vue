<template>
  <view class="container">
    <view class="header">
      <text class="title">⚙️ 设置</text>
      <text class="subtitle">个性化你的 PetsLog</text>
    </view>

    <!-- 主题设置 -->
    <view class="section">
      <text class="section-title">外观设置</text>
      
      <view class="setting-item">
        <view class="setting-info">
          <text class="setting-icon">🌙</text>
          <view class="setting-content">
            <text class="setting-label">深色模式</text>
            <text class="setting-desc">保护视力，夜间使用更舒适</text>
          </view>
        </view>
        <theme-switcher />
      </view>
    </view>

    <!-- 数据管理 -->
    <view class="section">
      <text class="section-title">数据管理</text>
      
      <view class="setting-item" @click="exportData">
        <view class="setting-info">
          <text class="setting-icon">📤</text>
          <view class="setting-content">
            <text class="setting-label">导出数据</text>
            <text class="setting-desc">导出宠物数据为 PDF 或 Excel</text>
          </view>
        </view>
        <text class="setting-arrow">›</text>
      </view>
      
      <view class="setting-item" @click="clearCache">
        <view class="setting-info">
          <text class="setting-icon">🗑️</text>
          <view class="setting-content">
            <text class="setting-label">清除缓存</text>
            <text class="setting-desc">清理本地缓存数据</text>
          </view>
        </view>
        <text class="setting-value">{{ cacheSize }}</text>
      </view>
    </view>

    <!-- 通知设置 -->
    <view class="section">
      <text class="section-title">通知设置</text>
      
      <view class="setting-item" @click="toggleNotify('reminder')">
        <view class="setting-info">
          <text class="setting-icon">🔔</text>
          <view class="setting-content">
            <text class="setting-label">提醒通知</text>
            <text class="setting-desc">驱虫、疫苗、生日提醒</text>
          </view>
        </view>
        <view class="setting-toggle" :class="{ active: settings.reminderNotify }"></view>
      </view>
      
      <view class="setting-item" @click="toggleNotify('health')">
        <view class="setting-info">
          <text class="setting-icon">🏥</text>
          <view class="setting-content">
            <text class="setting-label">健康提醒</text>
            <text class="setting-desc">健康记录异常提醒</text>
          </view>
        </view>
        <view class="setting-toggle" :class="{ active: settings.healthNotify }"></view>
      </view>
    </view>

    <!-- 关于 -->
    <view class="section">
      <text class="section-title">关于</text>
      
      <view class="setting-item" @click="showVersion">
        <view class="setting-info">
          <text class="setting-icon">ℹ️</text>
          <view class="setting-content">
            <text class="setting-label">版本信息</text>
            <text class="setting-desc">当前版本 v1.0.0-alpha.14</text>
          </view>
        </view>
        <text class="setting-arrow">›</text>
      </view>
      
      <view class="setting-item" @click="checkUpdate">
        <view class="setting-info">
          <text class="setting-icon">🔄</text>
          <view class="setting-content">
            <text class="setting-label">检查更新</text>
            <text class="setting-desc">检查是否有新版本</text>
          </view>
        </view>
        <text class="setting-arrow">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-btn" @click="logout">
      <text class="logout-text">退出登录</text>
    </view>
  </view>
</template>

<script>
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';

export default {
  components: {
    ThemeSwitcher
  },
  data() {
    return {
      cacheSize: '0 MB',
      settings: {
        reminderNotify: true,
        healthNotify: true
      }
    }
  },
  onLoad() {
    this.loadSettings()
    this.calculateCacheSize()
  },
  methods: {
    loadSettings() {
      const settings = uni.getStorageSync('settings')
      if (settings) {
        this.settings = JSON.parse(settings)
      }
    },
    
    calculateCacheSize() {
      // 模拟计算缓存大小
      this.cacheSize = '2.5 MB'
    },
    
    toggleNotify(type) {
      this.settings[type + 'Notify'] = !this.settings[type + 'Notify']
      uni.setStorageSync('settings', JSON.stringify(this.settings))
      
      uni.showToast({
        title: this.settings[type + 'Notify'] ? '已开启' : '已关闭',
        icon: 'success'
      })
    },
    
    exportData() {
      uni.navigateTo({
        url: '/pages/export/export'
      })
    },
    
    clearCache() {
      uni.showModal({
        title: '清除缓存',
        content: '确定要清除所有缓存数据吗？',
        success: (res) => {
          if (res.confirm) {
            uni.clearStorageSync()
            this.cacheSize = '0 MB'
            uni.showToast({
              title: '已清除',
              icon: 'success'
            })
          }
        }
      })
    },
    
    showVersion() {
      uni.showModal({
        title: '版本信息',
        content: 'PetsLog v1.0.0-alpha.14\n\n宠物健康管理系统\n\n© 2026 All rights reserved.',
        showCancel: false
      })
    },
    
    checkUpdate() {
      uni.showLoading({ title: '检查更新中...' })
      
      setTimeout(() => {
        uni.hideLoading()
        uni.showModal({
          title: '检查更新',
          content: '当前已是最新版本 v1.0.0-alpha.14',
          showCancel: false
        })
      }, 1500)
    },
    
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.clearStorageSync()
            uni.reLaunch({
              url: '/pages/login/login'
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 80px;
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

.section {
  background: #ffffff;
  margin: 16px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.setting-icon {
  font-size: 24px;
}

.setting-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-label {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.setting-desc {
  font-size: 12px;
  color: #94a3b8;
}

.setting-value {
  font-size: 14px;
  color: #64748b;
}

.setting-arrow {
  font-size: 20px;
  color: #cbd5e1;
}

.setting-toggle {
  width: 44px;
  height: 24px;
  background: #e2e8f0;
  border-radius: 9999px;
  position: relative;
  transition: all 0.3s ease;
}

.setting-toggle.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.setting-toggle::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: #ffffff;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
}

.setting-toggle.active::after {
  transform: translateX(20px);
}

.logout-btn {
  margin: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #ff0844 0%, #ffb199 100%);
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(255, 8, 68, 0.3);
}

.logout-text {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}
</style>
