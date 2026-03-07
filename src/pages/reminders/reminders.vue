<template>
  <view class="container">
    <view class="header">
      <text class="title">📅 提醒中心</text>
      <text class="subtitle">管理所有宠物提醒</text>
    </view>

    <!-- 提醒分类 Tab -->
    <view class="tabs">
      <view 
        class="tab" 
        :class="{ active: currentTab === 'all' }"
        @click="currentTab = 'all'"
      >
        <text>全部</text>
      </view>
      <view 
        class="tab" 
        :class="{ active: currentTab === 'deworming' }"
        @click="currentTab = 'deworming'"
      >
        <text>💊 驱虫</text>
      </view>
      <view 
        class="tab" 
        :class="{ active: currentTab === 'vaccine' }"
        @click="currentTab = 'vaccine'"
      >
        <text>💉 疫苗</text>
      </view>
      <view 
        class="tab" 
        :class="{ active: currentTab === 'birthday' }"
        @click="currentTab = 'birthday'"
      >
        <text>🎂 生日</text>
      </view>
      <view 
        class="tab" 
        :class="{ active: currentTab === 'weight' }"
        @click="currentTab = 'weight'"
      >
        <text>⚖️ 称重</text>
      </view>
    </view>

    <!-- 提醒列表 -->
    <scroll-view scroll-y class="reminder-scroll">
      <view class="reminder-list">
        <view 
          class="reminder-item" 
          v-for="(reminder, index) in filteredReminders" 
          :key="index"
          @click="handleReminder(reminder)"
        >
          <view class="reminder-icon">{{ reminder.icon }}</view>
          <view class="reminder-content">
            <text class="reminder-title">{{ reminder.title }}</text>
            <text class="reminder-desc">{{ reminder.desc }}</text>
            <view class="reminder-meta">
              <text class="reminder-time">{{ reminder.time }}</text>
              <text class="reminder-pet" v-if="reminder.petName">{{ reminder.petName }}</text>
            </view>
          </view>
          <view class="reminder-action">
            <text class="check-btn" @click.stop="markAsDone(reminder)">✓</text>
          </view>
        </view>

        <view class="empty-state" v-if="filteredReminders.length === 0">
          <text class="empty-emoji">✅</text>
          <text class="empty-text">暂无提醒</text>
          <text class="empty-desc">所有提醒都已处理完成</text>
        </view>
      </view>
    </scroll-view>

    <!-- 设置按钮 -->
    <view class="settings-btn" @click="goToSettings">
      <text class="settings-icon">⚙️</text>
      <text class="settings-text">提醒设置</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 'all',
      allReminders: [],
      reminders: []
    }
  },
  computed: {
    filteredReminders() {
      if (this.currentTab === 'all') {
        return this.reminders
      }
      return this.reminders.filter(r => r.type === this.currentTab)
    }
  },
  onLoad() {
    this.loadReminders()
  },
  onShow() {
    this.loadReminders()
  },
  methods: {
    async loadReminders() {
      try {
        const userStr = uni.getStorageSync('user')
        const user = JSON.parse(userStr)
        
        // 使用新的提醒管理云函数
        const res = await uniCloud.callFunction({
          name: 'reminder-manage',
          data: {
            action: 'list',
            familyId: user.familyId
          }
        })
        
        if (res.result.code === 200) {
          this.reminders = res.result.data.reminders || []
          this.allReminders = this.reminders
        }
      } catch (e) {
        console.error('加载提醒失败:', e)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },
    
    handleReminder(reminder) {
      if (reminder.type === 'deworming' || reminder.type === 'vaccine') {
        uni.navigateTo({
          url: `/pages/pet-detail/pet-detail?petId=${reminder.petId}`
        })
      }
    },
    
    async markAsDone(reminder) {
      // 虚拟提醒（生日、体重）不需要调用云函数
      if (reminder._id?.startsWith('birthday_') || reminder._id?.startsWith('weight_')) {
        uni.showToast({
          title: '已标记完成',
          icon: 'success'
        })
        this.loadReminders()
        return
      }
      
      uni.showLoading({ title: '处理中...' })
      
      try {
        // 计算下一次提醒时间
        const now = Date.now()
        let nextReminder = 0
        
        if (reminder.type === 'deworming') {
          // 驱虫默认 3 个月后
          nextReminder = now + 90 * 24 * 60 * 60 * 1000
        } else if (reminder.type === 'vaccine') {
          // 疫苗默认 1 年后
          nextReminder = now + 365 * 24 * 60 * 60 * 1000
        }
        
        const res = await uniCloud.callFunction({
          name: 'reminder-manage',
          data: {
            action: 'done',
            reminderId: reminder._id,
            data: {
              nextReminder,
              remindInterval: true
            }
          }
        })
        
        if (res.result.code === 200) {
          uni.showToast({
            title: '已标记完成',
            icon: 'success'
          })
          this.loadReminders()
        } else {
          uni.showToast({
            title: res.result.message || '操作失败',
            icon: 'none'
          })
        }
      } catch (e) {
        console.error('标记完成失败:', e)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    goToSettings() {
      uni.navigateTo({
        url: '/pages/settings/settings'
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

.tabs {
  display: flex;
  gap: 8px;
  padding: 16px;
  overflow-x: auto;
  white-space: nowrap;
  background: #ffffff;
}

.tab {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: #f1f5f9;
  border-radius: 9999px;
  font-size: 14px;
  color: #64748b;
  transition: all 0.2s ease;
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.reminder-scroll {
  height: calc(100vh - 220px);
}

.reminder-list {
  padding: 0 16px;
}

.reminder-item {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.reminder-icon {
  font-size: 28px;
  margin-right: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 50%;
}

.reminder-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reminder-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.reminder-desc {
  font-size: 13px;
  color: #64748b;
}

.reminder-meta {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.reminder-time {
  font-size: 12px;
  color: #fa709a;
  font-weight: 500;
}

.reminder-pet {
  font-size: 12px;
  color: #94a3b8;
}

.reminder-action {
  margin-left: 12px;
}

.check-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-state .empty-emoji {
  font-size: 60px;
  display: block;
  margin-bottom: 16px;
}

.empty-state .empty-text {
  font-size: 16px;
  color: #64748b;
  display: block;
  margin-bottom: 8px;
}

.empty-state .empty-desc {
  font-size: 14px;
  color: #94a3b8;
}

.settings-btn {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  padding: 14px 32px;
  border-radius: 9999px;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
}

.settings-icon {
  font-size: 18px;
}

.settings-text {
  font-size: 15px;
  font-weight: 600;
}
</style>
