<template>
  <view class="container">
    <view class="header">
      <text class="title">⏰ 提醒设置</text>
    </view>

    <view class="reminder-list">
      <!-- 驱虫提醒 -->
      <view class="reminder-item">
        <view class="reminder-header">
          <text class="reminder-icon">💊</text>
          <view class="reminder-info">
            <text class="reminder-name">驱虫提醒</text>
            <text class="reminder-desc">体内/体外驱虫到期提醒</text>
          </view>
          <switch :checked="reminders.deworming.enabled" @change="onDewormingChange" color="#667eea" />
        </view>
        <view class="reminder-settings" v-if="reminders.deworming.enabled">
          <view class="setting-row">
            <text class="setting-label">提醒周期</text>
            <picker :value="dewormingPeriodIndex" :range="dewormingPeriods" @change="onDewormingPeriodChange">
              <view class="picker">{{ dewormingPeriods[dewormingPeriodIndex] }}</view>
            </picker>
          </view>
        </view>
      </view>

      <!-- 疫苗提醒 -->
      <view class="reminder-item">
        <view class="reminder-header">
          <text class="reminder-icon">💉</text>
          <view class="reminder-info">
            <text class="reminder-name">疫苗提醒</text>
            <text class="reminder-desc">疫苗加强针到期提醒</text>
          </view>
          <switch :checked="reminders.vaccine.enabled" @change="onVaccineChange" color="#667eea" />
        </view>
        <view class="reminder-settings" v-if="reminders.vaccine.enabled">
          <view class="setting-row">
            <text class="setting-label">提前提醒</text>
            <picker :value="vaccineAdvanceIndex" :range="vaccineAdvance" @change="onVaccineAdvanceChange">
              <view class="picker">{{ vaccineAdvance[vaccineAdvanceIndex] }}</view>
            </picker>
          </view>
        </view>
      </view>

      <!-- 称重提醒 -->
      <view class="reminder-item">
        <view class="reminder-header">
          <text class="reminder-icon">⚖️</text>
          <view class="reminder-info">
            <text class="reminder-name">称重提醒</text>
            <text class="reminder-desc">每月定期称重提醒</text>
          </view>
          <switch :checked="reminders.weight.enabled" @change="onWeightChange" color="#667eea" />
        </view>
        <view class="reminder-settings" v-if="reminders.weight.enabled">
          <view class="setting-row">
            <text class="setting-label">提醒日期</text>
            <picker mode="selector" :value="weightDayIndex" :range="weightDays" @change="onWeightDayChange">
              <view class="picker">每月{{ weightDays[weightDayIndex] }}日</view>
            </picker>
          </view>
        </view>
      </view>

      <!-- 生日提醒 -->
      <view class="reminder-item">
        <view class="reminder-header">
          <text class="reminder-icon">🎂</text>
          <view class="reminder-info">
            <text class="reminder-name">生日提醒</text>
            <text class="reminder-desc">宠物生日前提醒</text>
          </view>
          <switch :checked="reminders.birthday.enabled" @change="onBirthdayChange" color="#667eea" />
        </view>
        <view class="reminder-settings" v-if="reminders.birthday.enabled">
          <view class="setting-row">
            <text class="setting-label">提前提醒</text>
            <picker :value="birthdayAdvanceIndex" :range="birthdayAdvance" @change="onBirthdayAdvanceChange">
              <view class="picker">{{ birthdayAdvance[birthdayAdvanceIndex] }}</view>
            </picker>
          </view>
        </view>
      </view>
    </view>

    <view class="tips">
      <text class="tips-title">💡 温馨提示</text>
      <text class="tips-text">提醒会在您打开小程序或网页时弹出提示，不会发送消息通知。</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      reminders: {
        deworming: { enabled: true },
        vaccine: { enabled: true },
        weight: { enabled: true },
        birthday: { enabled: false }
      },
      dewormingPeriods: ['每月', '每 2 月', '每 3 月'],
      dewormingPeriodIndex: 2,
      vaccineAdvance: ['不提醒', '提前 1 周', '提前 2 周', '提前 1 个月'],
      vaccineAdvanceIndex: 1,
      weightDays: ['1', '5', '10', '15', '20', '25'],
      weightDayIndex: 0,
      birthdayAdvance: ['不提醒', '提前 1 周', '提前 1 个月'],
      birthdayAdvanceIndex: 1
    }
  },
  methods: {
    onDewormingChange(e) {
      this.reminders.deworming.enabled = e.detail.value;
    },
    onDewormingPeriodChange(e) {
      this.dewormingPeriodIndex = e.detail.value;
    },
    onVaccineChange(e) {
      this.reminders.vaccine.enabled = e.detail.value;
    },
    onVaccineAdvanceChange(e) {
      this.vaccineAdvanceIndex = e.detail.value;
    },
    onWeightChange(e) {
      this.reminders.weight.enabled = e.detail.value;
    },
    onWeightDayChange(e) {
      this.weightDayIndex = e.detail.value;
    },
    onBirthdayChange(e) {
      this.reminders.birthday.enabled = e.detail.value;
    },
    onBirthdayAdvanceChange(e) {
      this.birthdayAdvanceIndex = e.detail.value;
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20px;
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  margin-bottom: 20px;
  padding-top: 20px;
  
  .title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }
}

.reminder-list {
  .reminder-item {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    
    .reminder-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      
      .reminder-icon {
        font-size: 30px;
        margin-right: 15px;
      }
      
      .reminder-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        
        .reminder-name {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin-bottom: 3px;
        }
        
        .reminder-desc {
          font-size: 12px;
          color: #999;
        }
      }
    }
    
    .reminder-settings {
      border-top: 1px solid #eee;
      padding-top: 15px;
      
      .setting-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        
        .setting-label {
          font-size: 14px;
          color: #666;
        }
        
        .picker {
          padding: 8px 15px;
          background: #f5f5f5;
          border-radius: 8px;
          font-size: 14px;
          color: #333;
          min-width: 120px;
          text-align: right;
        }
      }
    }
  }
}

.tips {
  margin-top: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #e7f3ff 0%, #d0e8ff 100%);
  border-radius: 12px;
  border-left: 4px solid #2196f3;
  
  .tips-title {
    display: block;
    font-size: 14px;
    font-weight: bold;
    color: #1565c0;
    margin-bottom: 8px;
  }
  
  .tips-text {
    display: block;
    font-size: 13px;
    color: #1565c0;
    line-height: 1.6;
  }
}
</style>
