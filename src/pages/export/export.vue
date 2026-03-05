<template>
  <view class="container">
    <view class="header">
      <text class="title">📤 数据导出</text>
      <text class="subtitle">导出宠物数据和相关记录</text>
    </view>

    <view class="content">
      <!-- 导出范围选择 -->
      <view class="section">
        <text class="section-title">导出范围</text>
        <view class="radio-group">
          <view 
            class="radio-item" 
            :class="{ active: exportScope === 'all' }"
            @click="exportScope = 'all'"
          >
            <text class="radio-icon">{{ exportScope === 'all' ? '🔘' : '⚪' }}</text>
            <text class="radio-label">全部宠物</text>
          </view>
          <view 
            class="radio-item" 
            :class="{ active: exportScope === 'single' }"
            @click="exportScope = 'single'"
          >
            <text class="radio-icon">{{ exportScope === 'single' ? '🔘' : '⚪' }}</text>
            <text class="radio-label">单只宠物</text>
          </view>
        </view>
      </view>

      <!-- 选择宠物（单选时显示） -->
      <view class="section" v-if="exportScope === 'single'">
        <text class="section-title">选择宠物</text>
        <picker :range="petOptions" range-key="name" @change="onPetChange">
          <view class="picker">
            <text>{{ selectedPetName || '请选择宠物' }}</text>
            <text class="arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 导出格式选择 -->
      <view class="section">
        <text class="section-title">导出格式</text>
        <view class="radio-group">
          <view 
            class="radio-item" 
            :class="{ active: exportFormat === 'json' }"
            @click="exportFormat = 'json'"
          >
            <text class="radio-icon">{{ exportFormat === 'json' ? '🔘' : '⚪' }}</text>
            <text class="radio-label">JSON（结构化数据）</text>
          </view>
          <view 
            class="radio-item" 
            :class="{ active: exportFormat === 'csv' }"
            @click="exportFormat = 'csv'"
          >
            <text class="radio-icon">{{ exportFormat === 'csv' ? '🔘' : '⚪' }}</text>
            <text class="radio-label">CSV（Excel 可打开）</text>
          </view>
        </view>
      </view>

      <!-- 导出字段选择 -->
      <view class="section">
        <text class="section-title">导出内容</text>
        <view class="checkbox-group">
          <view class="checkbox-item" @click="toggleField('basic')">
            <text class="checkbox-icon">{{ selectedFields.includes('basic') ? '✅' : '⬜' }}</text>
            <text class="checkbox-label">基本信息</text>
          </view>
          <view class="checkbox-item" @click="toggleField('weight')">
            <text class="checkbox-icon">{{ selectedFields.includes('weight') ? '✅' : '⬜' }}</text>
            <text class="checkbox-label">体重记录</text>
          </view>
          <view class="checkbox-item" @click="toggleField('deworming')">
            <text class="checkbox-icon">{{ selectedFields.includes('deworming') ? '✅' : '⬜' }}</text>
            <text class="checkbox-label">驱虫记录</text>
          </view>
          <view class="checkbox-item" @click="toggleField('vaccine')">
            <text class="checkbox-icon">{{ selectedFields.includes('vaccine') ? '✅' : '⬜' }}</text>
            <text class="checkbox-label">疫苗记录</text>
          </view>
          <view class="checkbox-item" @click="toggleField('health')">
            <text class="checkbox-icon">{{ selectedFields.includes('health') ? '✅' : '⬜' }}</text>
            <text class="checkbox-label">健康记录</text>
          </view>
          <view class="checkbox-item" @click="toggleField('food')">
            <text class="checkbox-icon">{{ selectedFields.includes('food') ? '✅' : '⬜' }}</text>
            <text class="checkbox-label">粮食记录</text>
          </view>
        </view>
      </view>

      <!-- 导出按钮 -->
      <view class="section">
        <button class="btn-export" @click="exportData" :disabled="exporting">
          {{ exporting ? '导出中...' : '📤 开始导出' }}
        </button>
      </view>

      <!-- 导出说明 -->
      <view class="tips">
        <text class="tips-title">💡 导出说明</text>
        <text class="tips-text">• JSON 格式：适合程序读取，保留完整数据结构</text>
        <text class="tips-text">• CSV 格式：适合 Excel 打开，方便查看和打印</text>
        <text class="tips-text">• 导出数据包含宠物基本信息和所有相关记录</text>
        <text class="tips-text">• 导出文件将自动下载到本地</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      exportScope: 'all', // all | single
      exportFormat: 'json', // json | csv
      selectedFields: ['basic', 'weight', 'deworming', 'vaccine', 'health', 'food'],
      pets: [],
      selectedPetId: '',
      selectedPetName: '',
      exporting: false
    }
  },
  computed: {
    petOptions() {
      return this.pets.map(pet => ({
        _id: pet._id,
        name: pet.name
      }))
    }
  },
  onLoad() {
    this.loadPets()
  },
  methods: {
    async loadPets() {
      try {
        const userStr = uni.getStorageSync('user')
        const user = JSON.parse(userStr)
        
        const res = await uniCloud.callFunction({
          name: 'pet-list',
          data: { familyId: user.familyId }
        })
        
        if (res.result.code === 200) {
          this.pets = res.result.data.pets || []
          if (this.pets.length > 0) {
            this.selectedPetId = this.pets[0]._id
            this.selectedPetName = this.pets[0].name
          }
        }
      } catch (e) {
        console.error('加载宠物列表失败:', e)
      }
    },
    
    onPetChange(e) {
      const index = e.detail.value
      const pet = this.petOptions[index]
      this.selectedPetId = pet._id
      this.selectedPetName = pet.name
    },
    
    toggleField(field) {
      const index = this.selectedFields.indexOf(field)
      if (index > -1) {
        this.selectedFields.splice(index, 1)
      } else {
        this.selectedFields.push(field)
      }
    },
    
    async exportData() {
      if (this.exporting) return
      
      if (this.selectedFields.length === 0) {
        uni.showToast({ title: '请至少选择一个导出内容', icon: 'none' })
        return
      }
      
      this.exporting = true
      
      try {
        const userStr = uni.getStorageSync('user')
        const user = JSON.parse(userStr)
        
        // 映射字段
        const fieldMap = {
          basic: ['name', 'species', 'breed', 'gender', 'birthday', 'age', 'color', 'neutered', 'notes'],
          weight: ['weight', 'recordedAt', 'note'],
          deworming: ['type', 'brand', 'product', 'usedAt', 'nextReminder'],
          vaccine: ['name', 'type', 'brand', 'vaccinatedAt', 'nextReminder'],
          health: ['symptom', 'observation', 'status', 'recordedAt', 'attachments'],
          food: ['brand', 'product', 'type', 'startDate', 'endDate']
        }
        
        const fields = []
        this.selectedFields.forEach(key => {
          if (fieldMap[key]) {
            fields.push(...fieldMap[key])
          }
        })
        
        // 调用导出云函数
        const exportParams = {
          familyId: user.familyId,
          format: this.exportFormat,
          fields: fields
        }
        
        if (this.exportScope === 'single' && this.selectedPetId) {
          exportParams.petId = this.selectedPetId
        }
        
        const res = await uniCloud.callFunction({
          name: 'export-data',
          data: exportParams
        })
        
        if (res.result.code === 200) {
          // 下载文件
          this.downloadFile(res.result.data.content, this.exportFormat)
        } else {
          uni.showToast({ title: res.result.message, icon: 'none' })
        }
      } catch (e) {
        console.error('导出数据失败:', e)
        uni.showToast({ title: '导出失败，请稍后重试', icon: 'none' })
      } finally {
        this.exporting = false
      }
    },
    
    downloadFile(content, format) {
      const timestamp = new Date().getTime()
      const filename = `petslog_export_${timestamp}.${format}`
      
      if (format === 'json') {
        const jsonStr = JSON.stringify(content, null, 2)
        this.saveFile(jsonStr, filename, 'application/json')
      } else {
        this.saveFile(content, filename, 'text/csv')
      }
    },
    
    saveFile(content, filename, mimeType) {
      // H5 端下载
      // #ifdef H5
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      uni.showToast({ title: '导出成功', icon: 'success' })
      // #endif
      
      // 小程序端下载
      // #ifdef MP-WEIXIN
      const filePath = `${wx.env.USER_DATA_PATH}/${filename}`
      const fs = wx.getFileSystemManager()
      fs.writeFile({
        filePath,
        data: content,
        encoding: 'utf-8',
        success: () => {
          wx.showToast({ title: '导出成功', icon: 'success' })
        },
        fail: (err) => {
          console.error('保存文件失败:', err)
          uni.showToast({ title: '保存失败', icon: 'none' })
        }
      })
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.header {
  text-align: center;
  padding: 30px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  margin-bottom: 20px;
  
  .title {
    display: block;
    font-size: 28px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 10px;
  }
  
  .subtitle {
    display: block;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }
}

.content {
  .section {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 15px;
    
    .section-title {
      display: block;
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 15px;
    }
  }
  
  .radio-group {
    .radio-item {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      border-radius: 8px;
      margin-bottom: 10px;
      background: #f5f5f5;
      
      &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        
        .radio-label {
          color: #fff;
        }
      }
      
      .radio-icon {
        font-size: 20px;
        margin-right: 10px;
      }
      
      .radio-label {
        font-size: 15px;
        color: #333;
      }
    }
  }
  
  .picker {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #f5f5f5;
    border-radius: 8px;
    
    .arrow {
      font-size: 20px;
      color: #999;
    }
  }
  
  .checkbox-group {
    .checkbox-item {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      border-radius: 8px;
      margin-bottom: 10px;
      background: #f5f5f5;
      
      .checkbox-icon {
        font-size: 20px;
        margin-right: 10px;
      }
      
      .checkbox-label {
        font-size: 15px;
        color: #333;
      }
    }
  }
  
  .btn-export {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 15px;
    font-size: 16px;
    font-weight: bold;
    
    &:disabled {
      opacity: 0.6;
    }
  }
  
  .tips {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-top: 20px;
    
    .tips-title {
      display: block;
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 15px;
    }
    
    .tips-text {
      display: block;
      font-size: 14px;
      color: #666;
      line-height: 1.8;
      margin-bottom: 8px;
    }
  }
}
</style>
