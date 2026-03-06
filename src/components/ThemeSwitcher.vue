<template>
  <view class="theme-switcher" @click="toggleTheme">
    <view class="switcher-icon">
      <text v-if="isDark">🌙</text>
      <text v-else>☀️</text>
    </view>
    <text class="switcher-text">{{ isDark ? '深色模式' : '浅色模式' }}</text>
    <view class="switcher-toggle" :class="{ active: isDark }">
      <view class="toggle-dot" :class="{ active: isDark }"></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ThemeSwitcher',
  data() {
    return {
      isDark: false
    }
  },
  mounted() {
    this.loadTheme()
  },
  methods: {
    loadTheme() {
      const theme = uni.getStorageSync('theme')
      if (theme === 'dark') {
        this.isDark = true
        this.applyDarkTheme()
      } else if (theme === 'light') {
        this.isDark = false
        this.applyLightTheme()
      } else {
        // 跟随系统
        this.isDark = uni.getSystemInfoSync().theme === 'dark'
        this.isDark ? this.applyDarkTheme() : this.applyLightTheme()
      }
    },
    
    toggleTheme() {
      this.isDark = !this.isDark
      uni.setStorageSync('theme', this.isDark ? 'dark' : 'light')
      
      if (this.isDark) {
        this.applyDarkTheme()
        uni.showToast({ title: '已切换深色模式', icon: 'success' })
      } else {
        this.applyLightTheme()
        uni.showToast({ title: '已切换浅色模式', icon: 'success' })
      }
      
      // 触发全局主题更新
      uni.$emit('themeChange', this.isDark)
    },
    
    applyDarkTheme() {
      const pages = getCurrentPages()
      pages.forEach(page => {
        if (page.$scope && page.$scope.$el) {
          page.$scope.$el.classList.add('dark-theme')
        }
      })
      document.documentElement.classList.add('dark-theme')
    },
    
    applyLightTheme() {
      const pages = getCurrentPages()
      pages.forEach(page => {
        if (page.$scope && page.$scope.$el) {
          page.$scope.$el.classList.remove('dark-theme')
        }
      })
      document.documentElement.classList.remove('dark-theme')
    }
  }
}
</script>

<style scoped>
.theme-switcher {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.switcher-icon {
  font-size: 20px;
}

.switcher-text {
  flex: 1;
  font-size: 14px;
  color: #1e293b;
}

.switcher-toggle {
  width: 44px;
  height: 24px;
  background: #e2e8f0;
  border-radius: 9999px;
  position: relative;
  transition: all 0.3s ease;
}

.switcher-toggle.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toggle-dot {
  width: 20px;
  height: 20px;
  background: #ffffff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
}

.toggle-dot.active {
  transform: translateX(20px);
}
</style>
