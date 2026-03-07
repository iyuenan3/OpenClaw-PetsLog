<template>
  <view class="voice-input-container">
    <button 
      class="voice-btn" 
      :class="{ 'recording': isRecording, 'disabled': disabled }"
      @touchstart="startRecording"
      @touchend="stopRecording"
      @mousedown="startRecording"
      @mouseup="stopRecording"
      @mouseleave="stopRecording"
      :disabled="disabled"
    >
      <text class="icon">{{ isRecording ? '🎙️' : '🎤' }}</text>
      <text v-if="showText" class="hint">{{ hint }}</text>
    </button>
    
    <!-- 录音状态提示 -->
    <view v-if="isRecording" class="recording-hint">
      <text>🔴 正在录音... 松开发送</text>
    </view>
  </view>
</template>

<script>
/**
 * 语音输入组件
 * 支持：
 * - 微信小程序：使用微信语音识别
 * - H5 端：使用 Web Speech API
 */
export default {
  name: 'VoiceInput',
  props: {
    // 提示文本
    hint: {
      type: String,
      default: '按住说话'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否显示提示文本
    showText: {
      type: Boolean,
      default: true
    },
    // 语言（H5 端使用）
    lang: {
      type: String,
      default: 'zh-CN'
    }
  },
  emits: ['result', 'start', 'end', 'error'],
  data() {
    return {
      isRecording: false,
      recognition: null
    }
  },
  mounted() {
    // #ifdef H5
    this.initWebSpeech()
    // #endif
  },
  methods: {
    /**
     * 初始化 Web Speech API（H5 端）
     */
    initWebSpeech() {
      // #ifdef H5
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.recognition.lang = this.lang
        this.recognition.continuous = false
        this.recognition.interimResults = false
        
        this.recognition.onstart = () => {
          this.isRecording = true
          this.$emit('start')
        }
        
        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          this.$emit('result', transcript)
        }
        
        this.recognition.onerror = (event) => {
          console.error('[VoiceInput] 语音识别错误:', event.error)
          this.$emit('error', event.error)
          this.isRecording = false
        }
        
        this.recognition.onend = () => {
          this.isRecording = false
          this.$emit('end')
        }
      } else {
        console.warn('[VoiceInput] 浏览器不支持语音识别')
      }
      // #endif
    },
    
    /**
     * 开始录音
     */
    async startRecording() {
      if (this.disabled || this.isRecording) return
      
      // #ifdef MP-WEIXIN
      // 微信小程序：开始录音
      try {
        const res = await uni.startRecord()
        this.isRecording = true
        this.$emit('start')
        
        // 保存临时录音路径
        this.tempRecordPath = res.tempFilePath
      } catch (error) {
        console.error('[VoiceInput] 录音失败:', error)
        this.$emit('error', error)
      }
      // #endif
      
      // #ifdef H5
      // H5 端：使用 Web Speech API
      if (this.recognition) {
        try {
          this.recognition.start()
        } catch (error) {
          console.error('[VoiceInput] 启动语音识别失败:', error)
          this.$emit('error', error)
        }
      } else {
        uni.showToast({
          title: '浏览器不支持语音识别',
          icon: 'none'
        })
      }
      // #endif
    },
    
    /**
     * 停止录音
     */
    async stopRecording() {
      if (!this.isRecording) return
      
      // #ifdef MP-WEIXIN
      // 微信小程序：停止录音并识别
      try {
        const res = await uni.stopRecord()
        this.isRecording = false
        this.$emit('end')
        
        // 使用微信语音识别
        if (res.tempFilePath) {
          this.recognizeWeChat(res.tempFilePath)
        }
      } catch (error) {
        console.error('[VoiceInput] 停止录音失败:', error)
        this.$emit('error', error)
        this.isRecording = false
      }
      // #endif
      
      // #ifdef H5
      // H5 端：Web Speech API 会自动停止
      if (this.recognition) {
        try {
          this.recognition.stop()
        } catch (error) {
          console.error('[VoiceInput] 停止语音识别失败:', error)
        }
      }
      // #endif
    },
    
    /**
     * 微信小程序语音识别
     */
    async recognizeWeChat(filePath) {
      // #ifdef MP-WEIXIN
      try {
        // 注意：微信语音识别需要后端支持
        // 这里提供一个示例，实际使用需要配置云开发或自己的服务器
        uni.showLoading({ title: '识别中...' })
        
        // 如果需要上传到服务器识别，可以在这里处理
        // uni.uploadFile({ ... })
        
        uni.hideLoading()
        
        // 临时方案：直接返回文件路径，由父组件处理
        this.$emit('result', {
          type: 'audio',
          path: filePath
        })
      } catch (error) {
        console.error('[VoiceInput] 语音识别失败:', error)
        this.$emit('error', error)
      } finally {
        uni.hideLoading()
      }
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
.voice-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.voice-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 24px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  
  .icon {
    font-size: 20px;
  }
  
  .hint {
    font-size: 14px;
    opacity: 0.9;
  }
  
  &:active:not(.disabled) {
    transform: scale(0.95);
    box-shadow: 0 2px 6px rgba(102, 126, 234, 0.2);
  }
  
  &.recording {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
    animation: pulse 1s infinite;
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.recording-hint {
  margin-top: 12px;
  padding: 8px 16px;
  background: rgba(245, 87, 108, 0.1);
  border-radius: 16px;
  color: #f5576c;
  font-size: 14px;
  animation: fadeIn 0.3s ease;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
