<template>
  <view class="container">
    <view class="header">
      <text class="title">⚙️ 提醒设置</text>
      <text class="subtitle">自定义提醒通知</text>
    </view>

    <scroll-view scroll-y class="content">
      <!-- 提醒开关 -->
      <view class="section">
        <view class="section-title">📢 提醒类型</view>
        
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-icon">💊</text>
            <view class="setting-text">
              <text class="setting-label">驱虫提醒</text>
              <text class="setting-desc">驱虫到期前提醒</text>
            </view>
          </view>
          <switch :checked="settings.dewormingEnabled" @change="onToggle('dewormingEnabled')" />
        </view>

        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-icon">💉</text>
            <view class="setting-text">
              <text class="setting-label">疫苗提醒</text>
              <text class="setting-desc">疫苗接种提醒</text>
            </view>
          </view>
          <switch :checked="settings.vaccineEnabled" @change="onToggle('vaccineEnabled')" />
        </view>

        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-icon">💊</text>
            <view class="setting-text">
              <text class="setting-label">用药提醒</text>
              <text class="setting-desc">按时服药提醒</text>
            </view>
          </view>
          <switch :checked="settings.medicationEnabled" @change="onToggle('medicationEnabled')" />
        </view>

        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-icon">🎂</text>
            <view class="setting-text">
              <text class="setting-label">生日提醒</text>
              <text class="setting-desc">宠物生日祝福</text>
            </view>
          </view>
          <switch :checked="settings.birthdayEnabled" @change="onToggle('birthdayEnabled')" />
        </view>

        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-icon">⚖️</text>
            <view class="setting-text">
              <text class="setting-label">称重提醒</text>
              <text class="setting-desc">每月 1 号提醒称重</text>
            </view>
          </view>
          <switch :checked="settings.weightEnabled" @change="onToggle('weightEnabled')" />
        </view>
      </view>

      <!-- 提醒时间设置 -->
      <view class="section">
        <view class="section-title">⏰ 提醒时间</view>
        
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">提前提醒天数</text>
          </view>
          <picker :range="aheadDays" :value="aheadDayIndex" @change="onAheadDayChange">
            <view class="picker-value">
              <text>{{ aheadDays[aheadDayIndex] }}天</text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>

        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">每日通知时间</text>
          </view>
          <picker mode="time" :value="notifyTime" @change="onNotifyTimeChange">
            <view class="picker-value">
              <text>{{ notifyTime }}</text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>
      </view>

      <!-- 通知方式 -->
      <view class="section">
        <view class="section-title">🔔 通知方式</view>
        
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">应用内通知</text>
            <text class="setting-desc">打开应用时显示提醒</text>
          </view>
          <switch :checked="settings.inAppNotify" disabled color="#667eea" />
        </view>

        <!-- <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">推送通知</text>
            <text class="setting-desc">需要配置推送服务</text>
          </view>
          <switch :checked="settings.pushNotify" @change="onToggle('pushNotify')" />
        </view> -->
      </view>

      <!-- 静音时段 -->
      <view class="section">
        <view class="section-title">🌙 免打扰时段</view>
        
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">开启免打扰</text>
          </view>
          <switch :checked="settings.quietModeEnabled" @change="onToggle('quietModeEnabled')" />
        </view>

        <view class="setting-item" v-if="settings.quietModeEnabled">
          <view class="setting-info">
            <text class="setting-label">开始时间</text>
          </view>
          <picker mode="time" :value="quietStartTime" @change="onQuietStartChange">
            <view class="picker-value">
              <text>{{ quietStartTime }}</text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>

        <view class="setting-item" v-if="settings.quietModeEnabled">
          <view class="setting-info">
            <text class="setting-label">结束时间</text>
          </view>
          <picker mode="time" :value="quietEndTime" @change="onQuietEndChange">
            <view class="picker-value">
              <text>{{ quietEndTime }}</text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>
      </view>
    </scroll-view>

    <!-- 保存按钮 -->
    <view class="save-btn" @click="saveSettings">
      <text>💾 保存设置</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      settings: {
        dewormingEnabled: true,
        vaccineEnabled: true,
        medicationEnabled: true,
        birthdayEnabled: true,
        weightEnabled: true,
        inAppNotify: true,
        pushNotify: false,
        quietModeEnabled: false,
        quietStartTime: '22:00',
        quietEndTime: '08:00',
        aheadDays: 7,
        notifyTime: '09:00'
      },
      aheadDays: ['3 天', '7 天', '14 天', '30 天'],
      aheadDayIndex: 1,
      notifyTime: '09:00',
      quietStartTime: '22:00',
      quietEndTime: '08:00'
    }
  },
  onLoad() {
    this.loadSettings()
  },
  methods: {
    async loadSettings() {
      try {
        const userStr = uni.getStorageSync('user')
        const user = JSON.parse(userStr)
        
        const res = await uniCloud.callFunction({
          name: 'reminder-manage',
          data: {
            action: 'settings',
            familyId: user.familyId
          }
        })
        
        if (res.result.code === 200 && res.result.data.settings) {
          this.settings = { ...this.settings, ...res.result.data.settings }
          this.notifyTime = this.settings.notifyTime || '09:00'
          this.quietStartTime = this.settings.quietStartTime || '22:00'
          this.quietEndTime = this.settings.quietEndTime || '08:00'
          
          const daysMap = { 3: 0, 7: 1, 14: 2, 30: 3 }
          this.aheadDayIndex = daysMap[this.settings.aheadDays] || 1
        }
      } catch (e) {
        console.error('加载设置失败:', e)
      }
    },
    
    onToggle(key) {
      this.settings[key] = !this.settings[key]
    },
    
    onAheadDayChange(e) {
      this.aheadDayIndex = e.detail.value
      const daysMap = [3, 7, 14, 30]
      this.settings.aheadDays = daysMap[this.aheadDayIndex]
    },
    
    onNotifyTimeChange(e) {
      this.notifyTime = e.detail.value
    },
    
    onQuietStartChange(e) {
      this.quietStartTime = e.detail.value
    },
    
    onQuietEndChange(e) {
      this.quietEndTime = e.detail.value
    },
    
    async saveSettings() {
      try {
        const userStr = uni.getStorageSync('user')
        const user = JSON.parse(userStr)
        
        const res = await uniCloud.callFunction({
          name: 'reminder-manage',
          data: {
            action: 'settings',
            familyId: user.familyId,
            data: {
              settings: {
                ...this.settings,
                notifyTime: this.notifyTime,
                quietStartTime: this.quietStartTime,
                quietEndTime: this.quietEndTime,
                aheadDays: this.settings.aheadDays || 7
              }
            }
          }
        })
        
        if (res.result.code === 200) {
          uni.showToast({ title: '保存成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1000)
        } else {
          uni.showToast({ title: res.result.message, icon: 'none' })
        }
      } catch (e) {
        console.error('保存设置失败:', e)
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 80px;
}

.header {
  padding: 20px 16px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .title {
    display: block;
    font-size: 24px;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 4px;
  }
  
  .subtitle {
    display: block;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }
}

.content {
  height: calc(100vh - 140px);
}

.section {
  margin-top: 20px;
  background: #ffffff;
  padding: 16px 0;
}

.section-title {
  padding: 0 16px 12px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 8px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
}

.setting-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-icon {
  font-size: 24px;
}

.setting-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-label {
  font-size: 15px;
  color: #1e293b;
  font-weight: 500;
}

.setting-desc {
  font-size: 13px;
  color: #64748b;
}

.picker-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #64748b;
  
  .arrow {
    font-size: 12px;
  }
}

.save-btn {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>
