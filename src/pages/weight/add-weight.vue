<template>
  <view class="container">
    <view class="form-card">
      <view class="card-title">
        <text>⚖️ 添加体重记录</text>
        <view v-if="networkStatus" class="network-status" :class="{ offline: !isOnline }">
          <text>{{ networkStatus }}</text>
        </view>
      </view>
      
      <!-- 选择宠物 -->
      <view class="form-group">
        <text class="form-label">宠物</text>
        <picker :range="petNames" :value="petIndex" @change="onPetChange">
          <view class="picker">
            <text>{{ petNames[petIndex] || '请选择宠物' }}</text>
            <text class="arrow">▼</text>
          </view>
        </picker>
      </view>
      
      <!-- 体重输入（支持语音） -->
      <view class="form-group">
        <text class="form-label">
          体重 (kg)
          <text class="optional">🎤 支持语音输入</text>
        </text>
        <view class="input-with-voice">
          <input
            class="input"
            type="number"
            v-model="formData.weight"
            placeholder="请输入体重"
            :disabled="isRecording"
          />
          <voice-input
            :disabled="isRecording"
            hint="按住说体重"
            @result="onVoiceResult"
            @start="isRecording = true"
            @end="isRecording = false"
            @error="onVoiceError"
          />
        </view>
        <view v-if="isRecording" class="recording-status">
          <text>🎙️ 正在听... 请说"3.5 公斤"或"3.5kg"</text>
        </view>
      </view>
      
      <!-- 日期 -->
      <view class="form-group">
        <text class="form-label">日期</text>
        <picker 
          mode="date" 
          :value="formData.date" 
          @change="onDateChange"
        >
          <view class="picker">
            <text>{{ formData.date || '请选择日期' }}</text>
            <text class="arrow">▼</text>
          </view>
        </picker>
      </view>
      
      <!-- 备注（可选） -->
      <view class="form-group">
        <text class="form-label">备注（可选）</text>
        <textarea
          class="textarea"
          v-model="formData.note"
          placeholder="例如：刚吃完早饭、运动后等"
          maxlength="200"
        />
      </view>
      
      <!-- 提交按钮 -->
      <view class="button-group">
        <button 
          class="btn btn-primary btn-block" 
          @click="submit"
          :disabled="!canSubmit"
        >
          {{ isOnline ? '💾 保存' : '📴 保存到离线缓存' }}
        </button>
        
        <button 
          v-if="hasPendingData"
          class="btn btn-secondary btn-block"
          @click="syncData"
        >
          🔄 同步离线数据 ({{ pendingCount }}条)
        </button>
      </view>
    </view>
    
    <!-- 使用说明 -->
    <view class="tips-card">
      <view class="tips-title">💡 语音输入技巧</view>
      <view class="tips-list">
        <view class="tip-item">• 按住按钮说"3.5 公斤"或"3.5kg"</view>
        <view class="tip-item">• 说数字即可，如"三点五"</view>
        <view class="tip-item">• 离线时数据会自动缓存</view>
        <view class="tip-item">• 网络恢复后一键同步</view>
      </view>
    </view>
  </view>
</template>

<script>
import VoiceInput from '@/components/VoiceInput.vue'
import { isNetworkConnected, getNetworkStatusText } from '@/utils/network'
import { 
  getOfflineCache, 
  addToOfflineCache, 
  syncOfflineCache,
  hasPendingSync,
  getCacheSize 
} from '@/utils/offline-cache'

export default {
  components: {
    VoiceInput
  },
  data() {
    return {
      pets: [],
      petNames: [],
      petIndex: 0,
      formData: {
        petId: '',
        weight: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
      },
      isRecording: false,
      isOnline: true,
      networkStatus: '',
      hasPendingData: false,
      pendingCount: 0,
      networkTimer: null
    }
  },
  computed: {
    canSubmit() {
      return this.formData.petId && this.formData.weight && this.formData.date
    }
  },
  onLoad() {
    this.loadPets()
    this.checkNetwork()
    this.checkPendingData()
    
    // 定期检查网络状态
    this.networkTimer = setInterval(() => {
      this.checkNetwork()
      this.checkPendingData()
    }, 5000)
  },
  onUnload() {
    if (this.networkTimer) {
      clearInterval(this.networkTimer)
    }
  },
  methods: {
    /**
     * 加载宠物列表
     */
    async loadPets() {
      try {
        const res = await uniCloud.callFunction({
          name: 'pet-list'
        })
        
        if (res.result && res.result.data) {
          this.pets = res.result.data
          this.petNames = this.pets.map(pet => pet.name)
          
          if (this.pets.length > 0) {
            this.formData.petId = this.pets[0]._id
          }
        }
      } catch (error) {
        console.error('[AddWeight] 加载宠物失败:', error)
        uni.showToast({
          title: '加载宠物失败',
          icon: 'none'
        })
      }
    },
    
    /**
     * 检查网络状态
     */
    checkNetwork() {
      this.isOnline = isNetworkConnected()
      this.networkStatus = getNetworkStatusText()
    },
    
    /**
     * 检查待同步数据
     */
    checkPendingData() {
      this.hasPendingData = hasPendingSync()
      this.pendingCount = getCacheSize()
    },
    
    /**
     * 选择宠物
     */
    onPetChange(e) {
      this.petIndex = e.detail.value
      this.formData.petId = this.pets[this.petIndex]?._id || ''
    },
    
    /**
     * 选择日期
     */
    onDateChange(e) {
      this.formData.date = e.detail.value
    },
    
    /**
     * 语音识别结果处理
     */
    onVoiceResult(result) {
      console.log('[AddWeight] 语音识别结果:', result)
      
      // H5 端直接返回文本
      if (typeof result === 'string') {
        this.parseVoiceResult(result)
        return
      }
      
      // 小程序端返回音频文件
      if (result.type === 'audio') {
        // 这里可以调用语音识别 API
        // 临时方案：提示用户手动输入
        uni.showToast({
          title: '🎤 录音完成，请手动输入体重',
          icon: 'none'
        })
      }
    },
    
    /**
     * 解析语音识别结果
     */
    parseVoiceResult(text) {
      // 提取数字（支持中文数字）
      const numberMap = {
        '零': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4,
        '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
      }
      
      // 尝试提取阿拉伯数字
      const match = text.match(/(\d+\.?\d*)/)
      if (match) {
        this.formData.weight = match[1]
        uni.showToast({
          title: `✅ 识别：${match[1]} kg`,
          icon: 'success'
        })
        return
      }
      
      // 尝试解析中文数字（简单版本）
      let chineseNumber = ''
      for (const char of text) {
        if (numberMap.hasOwnProperty(char)) {
          chineseNumber += numberMap[char]
        }
      }
      
      if (chineseNumber) {
        this.formData.weight = chineseNumber.toString()
        uni.showToast({
          title: `✅ 识别：${chineseNumber} kg`,
          icon: 'success'
        })
      }
    },
    
    /**
     * 语音识别错误处理
     */
    onVoiceError(error) {
      console.error('[AddWeight] 语音识别错误:', error)
      uni.showToast({
        title: '🎤 识别失败，请手动输入',
        icon: 'none'
      })
    },
    
    /**
     * 提交数据
     */
    async submit() {
      if (!this.canSubmit) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }
      
      const submitData = {
        petId: this.formData.petId,
        weight: parseFloat(this.formData.weight),
        date: this.formData.date,
        note: this.formData.note,
        timestamp: Date.now()
      }
      
      // 在线模式：直接提交
      if (this.isOnline) {
        try {
          await uniCloud.callFunction({
            name: 'weight-record',
            data: {
              action: 'create',
              ...submitData
            }
          })
          
          uni.showToast({
            title: '✅ 保存成功',
            icon: 'success'
          })
          
          // 清空表单
          this.formData.weight = ''
          this.formData.note = ''
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (error) {
          console.error('[AddWeight] 保存失败:', error)
          
          // 如果是因为网络错误，保存到离线缓存
          if (error.errMsg?.includes('timeout') || error.errMsg?.includes('network')) {
            this.saveToOffline(submitData)
          } else {
            uni.showToast({
              title: '保存失败，请重试',
              icon: 'none'
            })
          }
        }
      } else {
        // 离线模式：保存到缓存
        this.saveToOffline(submitData)
      }
    },
    
    /**
     * 保存到离线缓存
     */
    saveToOffline(data) {
      addToOfflineCache('weight-create', data)
      this.checkPendingData()
    },
    
    /**
     * 同步离线数据
     */
    async syncData() {
      uni.showLoading({ title: '同步中...' })
      
      try {
        const result = await syncOfflineCache(async (type, data) => {
          // 根据类型调用不同的云函数
          if (type === 'weight-create') {
            await uniCloud.callFunction({
              name: 'weight-record',
              data: {
                action: 'create',
                ...data
              }
            })
          }
          // 可以扩展其他类型
        })
        
        console.log('[AddWeight] 同步结果:', result)
        this.checkPendingData()
      } catch (error) {
        console.error('[AddWeight] 同步失败:', error)
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20px;
  min-height: 100vh;
  background-color: #f8fafc;
}

.form-card, .tips-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.network-status {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  
  &.offline {
    background: rgba(245, 87, 108, 0.1);
    color: #f5576c;
  }
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 8px;
  
  .optional {
    font-size: 12px;
    color: #667eea;
    margin-left: 8px;
    font-weight: 400;
  }
}

.picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f1f5f9;
  border-radius: 12px;
  font-size: 15px;
  
  .arrow {
    color: #94a3b8;
    font-size: 12px;
  }
}

.input-with-voice {
  display: flex;
  gap: 12px;
  align-items: center;
}

.input {
  flex: 1;
  padding: 12px 16px;
  background: #f1f5f9;
  border-radius: 12px;
  font-size: 15px;
  border: 2px solid transparent;
  
  &:focus {
    border-color: #667eea;
    background: #ffffff;
  }
}

.textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px 16px;
  background: #f1f5f9;
  border-radius: 12px;
  font-size: 15px;
  border: 2px solid transparent;
  box-sizing: border-box;
  
  &:focus {
    border-color: #667eea;
    background: #ffffff;
  }
}

.recording-status {
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(245, 87, 108, 0.1);
  border-radius: 8px;
  color: #f5576c;
  font-size: 13px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.button-group {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-block {
  width: 100%;
}

.tips-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1e293b;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
}
</style>
