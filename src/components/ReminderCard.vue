<template>
  <view class="reminder-card" v-if="reminders.length > 0">
    <view class="card-header">
      <text class="card-title">📅 今日提醒</text>
      <text class="card-count">{{ reminders.length }} 条待处理</text>
    </view>
    
    <view class="reminder-list">
      <view 
        class="reminder-item" 
        v-for="(reminder, index) in reminders" 
        :key="index"
        @click="handleReminder(reminder)"
      >
        <view class="reminder-icon">{{ reminder.icon }}</view>
        <view class="reminder-content">
          <text class="reminder-title">{{ reminder.title }}</text>
          <text class="reminder-desc">{{ reminder.desc }}</text>
          <text class="reminder-time" v-if="reminder.time">{{ reminder.time }}</text>
        </view>
        <view class="reminder-action">
          <text class="check-btn" @click.stop="markAsDone(reminder)">✓</text>
        </view>
      </view>
    </view>
    
    <view class="card-footer" @click="viewAll">
      <text class="footer-text">查看全部提醒 ›</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ReminderCard',
  data() {
    return {
      reminders: []
    }
  },
  methods: {
    async loadReminders() {
      try {
        const userStr = uni.getStorageSync('user')
        const user = JSON.parse(userStr)
        
        const res = await uniCloud.callFunction({
          name: 'check-reminders',
          data: {
            familyId: user.familyId,
            daysAhead: 7
          }
        })
        
        if (res.result.code === 200) {
          this.formatReminders(res.result.data.reminders)
        }
      } catch (e) {
        console.error('加载提醒失败:', e)
      }
    },
    
    formatReminders(data) {
      const reminders = []
      
      // 驱虫提醒
      if (data.deworming && data.deworming.length > 0) {
        data.deworming.forEach(item => {
          reminders.push({
            type: 'deworming',
            icon: '💊',
            title: `${item.petName} - 驱虫提醒`,
            desc: item.type === 'internal' ? '体内驱虫' : '体外驱虫',
            time: `剩余 ${item.daysLeft} 天`,
            petId: item.petId,
            daysLeft: item.daysLeft
          })
        })
      }
      
      // 疫苗提醒
      if (data.vaccine && data.vaccine.length > 0) {
        data.vaccine.forEach(item => {
          reminders.push({
            type: 'vaccine',
            icon: '💉',
            title: `${item.petName} - 疫苗提醒`,
            desc: item.vaccineName,
            time: `剩余 ${item.daysLeft} 天`,
            petId: item.petId,
            daysLeft: item.daysLeft
          })
        })
      }
      
      // 生日提醒
      if (data.birthday && data.birthday.length > 0) {
        data.birthday.forEach(item => {
          reminders.push({
            type: 'birthday',
            icon: '🎂',
            title: `${item.petName} 生日快到了！`,
            desc: `还有 ${item.daysUntil} 天就 ${item.age} 岁了`,
            time: `${item.daysUntil} 天后`,
            petId: item.petId,
            daysLeft: item.daysUntil
          })
        })
      }
      
      // 称重提醒
      if (data.weight && data.weight.length > 0) {
        data.weight.forEach(item => {
          reminders.push({
            type: 'weight',
            icon: '⚖️',
            title: '该给宠物称重啦',
            desc: item.petName + ' - ' + item.message,
            time: '今天',
            petId: null
          })
        })
      }
      
      // 按紧急程度排序
      reminders.sort((a, b) => (a.daysLeft || 999) - (b.daysLeft || 999))
      
      this.reminders = reminders.slice(0, 5) // 最多显示 5 条
    },
    
    handleReminder(reminder) {
      if (reminder.type === 'deworming' || reminder.type === 'vaccine') {
        uni.navigateTo({
          url: `/pages/pet-detail/pet-detail?petId=${reminder.petId}`
        })
      }
    },
    
    markAsDone(reminder) {
      uni.showToast({
        title: '已标记完成',
        icon: 'success'
      })
      this.loadReminders()
    },
    
    viewAll() {
      uni.navigateTo({
        url: '/pages/reminders/reminders'
      })
    }
  },
  mounted() {
    this.loadReminders()
  }
}
</script>

<style scoped>
.reminder-card {
  background: #ffffff;
  border-radius: 16px;
  margin: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 12px;
  border-bottom: 1px solid #f1f5f9;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #1e293b;
}

.card-count {
  font-size: 12px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 12px;
  border-radius: 9999px;
}

.reminder-list {
  padding: 0 16px;
}

.reminder-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.reminder-item:last-child {
  border-bottom: none;
}

.reminder-icon {
  font-size: 24px;
  margin-right: 12px;
  width: 40px;
  height: 40px;
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
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.reminder-desc {
  font-size: 12px;
  color: #64748b;
}

.reminder-time {
  font-size: 12px;
  color: #fa709a;
  font-weight: 500;
}

.reminder-action {
  margin-left: 12px;
}

.check-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.card-footer {
  padding: 12px 16px;
  background: #f8fafc;
  text-align: center;
}

.footer-text {
  font-size: 13px;
  color: #667eea;
}
</style>
