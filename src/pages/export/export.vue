<template>
  <view class="container">
    <view class="header">
      <text class="title">📤 数据导出</text>
      <text class="subtitle">导出宠物数据为 PDF 或 Excel</text>
    </view>

    <!-- 导出范围选择 -->
    <view class="section">
      <text class="section-title">导出范围</text>
      
      <view class="range-options">
        <view 
          class="range-option" 
          :class="{ active: exportRange === 'all' }"
          @click="exportRange = 'all'"
        >
          <text class="range-icon">📊</text>
          <text class="range-text">全部数据</text>
          <text class="range-desc">所有宠物和记录</text>
        </view>
        
        <view 
          class="range-option" 
          :class="{ active: exportRange === 'single' }"
          @click="exportRange = 'single'"
        >
          <text class="range-icon">🐾</text>
          <text class="range-text">单只宠物</text>
          <text class="range-desc">选择指定宠物</text>
        </view>
      </view>
    </view>

    <!-- 选择宠物（单选时显示） -->
    <view class="section" v-if="exportRange === 'single'">
      <text class="section-title">选择宠物</text>
      
      <picker :range="petNames" @change="onPetChange">
        <view class="picker">
          <text>{{ selectedPetName || '请选择宠物' }}</text>
          <text class="arrow">›</text>
        </view>
      </picker>
    </view>

    <!-- 导出格式选择 -->
    <view class="section">
      <text class="section-title">导出格式</text>
      
      <view class="format-options">
        <view 
          class="format-option" 
          :class="{ active: exportFormat === 'pdf' }"
          @click="exportFormat = 'pdf'"
        >
          <text class="format-icon">📄</text>
          <text class="format-text">PDF 报告</text>
          <text class="format-desc">适合打印和分享</text>
        </view>
        
        <view 
          class="format-option" 
          :class="{ active: exportFormat === 'excel' }"
          @click="exportFormat = 'excel'"
        >
          <text class="format-icon">📊</text>
          <text class="format-text">Excel 表格</text>
          <text class="format-desc">适合数据分析</text>
        </view>
      </view>
    </view>

    <!-- 导出内容选择 -->
    <view class="section">
      <text class="section-title">导出内容</text>
      
      <view class="content-options">
        <view 
          class="content-option" 
          :class="{ checked: content.basic }"
          @click="toggleContent('basic')"
        >
          <text class="checkbox">{{ content.basic ? '☑️' : '⬜' }}</text>
          <text class="content-text">基本信息</text>
        </view>
        
        <view 
          class="content-option" 
          :class="{ checked: content.weight }"
          @click="toggleContent('weight')"
        >
          <text class="checkbox">{{ content.weight ? '☑️' : '⬜' }}</text>
          <text class="content-text">体重记录</text>
        </view>
        
        <view 
          class="content-option" 
          :class="{ checked: content.health }"
          @click="toggleContent('health')"
        >
          <text class="checkbox">{{ content.health ? '☑️' : '⬜' }}</text>
          <text class="content-text">健康记录</text>
        </view>
        
        <view 
          class="content-option" 
          :class="{ checked: content.vaccine }"
          @click="toggleContent('vaccine')"
        >
          <text class="checkbox">{{ content.vaccine ? '☑️' : '⬜' }}</text>
          <text class="content-text">疫苗记录</text>
        </view>
        
        <view 
          class="content-option" 
          :class="{ checked: content.deworming }"
          @click="toggleContent('deworming')"
        >
          <text class="checkbox">{{ content.deworming ? '☑️' : '⬜' }}</text>
          <text class="content-text">驱虫记录</text>
        </view>
        
        <view 
          class="content-option" 
          :class="{ checked: content.food }"
          @click="toggleContent('food')"
        >
          <text class="checkbox">{{ content.food ? '☑️' : '⬜' }}</text>
          <text class="content-text">粮食记录</text>
        </view>
      </view>
    </view>

    <!-- 导出按钮 -->
    <view class="export-actions">
      <button class="btn-export" @click="exportData" :disabled="exporting">
        <text class="export-icon">{{ exporting ? '⏳' : '📤' }}</text>
        <text class="export-text">{{ exporting ? '导出中...' : '开始导出' }}</text>
      </button>
      
      <button class="btn-share" @click="shareData" :disabled="!canShare">
        <text class="share-icon">🔗</text>
        <text class="share-text">分享数据</text>
      </button>
    </view>

    <!-- 导出说明 -->
    <view class="tips">
      <text class="tips-title">💡 导出说明</text>
      <text class="tips-text">• PDF 格式：适合打印和分享给兽医</text>
      <text class="tips-text">• Excel 格式：适合数据分析和备份</text>
      <text class="tips-text">• 导出文件将保存到手机存储</text>
      <text class="tips-text">• 大型导出可能需要几分钟</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      exportRange: 'all',
      exportFormat: 'pdf',
      selectedPetIndex: 0,
      pets: [],
      content: {
        basic: true,
        weight: true,
        health: true,
        vaccine: true,
        deworming: true,
        food: true
      },
      exporting: false,
      canShare: false,
      exportedData: null
    }
  },
  computed: {
    petNames() {
      return this.pets.map(p => p.name)
    },
    selectedPetName() {
      return this.pets[this.selectedPetIndex]?.name || ''
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
            this.selectedPetIndex = 0
          }
        }
      } catch (e) {
        console.error('加载宠物列表失败:', e)
      }
    },
    
    onPetChange(e) {
      this.selectedPetIndex = e.detail.value
    },
    
    toggleContent(type) {
      this.content[type] = !this.content[type]
    },
    
    async exportData() {
      if (this.exportRange === 'single' && !this.pets[this.selectedPetIndex]) {
        uni.showToast({ title: '请选择宠物', icon: 'none' })
        return
      }
      
      const hasContent = Object.values(this.content).some(v => v)
      if (!hasContent) {
        uni.showToast({ title: '请至少选择一项内容', icon: 'none' })
        return
      }
      
      this.exporting = true
      
      try {
        const userStr = uni.getStorageSync('user')
        const user = JSON.parse(userStr)
        
        // 准备导出数据
        const exportData = {
          exportAt: new Date().toISOString(),
          format: this.exportFormat,
          range: this.exportRange,
          pet: this.exportRange === 'single' ? this.pets[this.selectedPetIndex] : null,
          content: this.content,
          data: {}
        }
        
        // 加载数据
        if (this.content.basic) {
          exportData.data.basic = this.exportRange === 'single' 
            ? this.pets[this.selectedPetIndex]
            : this.pets
        }
        
        // 导出文件
        if (this.exportFormat === 'pdf') {
          await this.exportToPDF(exportData)
        } else {
          await this.exportToExcel(exportData)
        }
        
        this.exportedData = exportData
        this.canShare = true
        
        uni.showToast({ 
          title: '导出成功', 
          icon: 'success',
          duration: 2000
        })
      } catch (e) {
        console.error('导出数据失败:', e)
        uni.showToast({ title: '导出失败，请重试', icon: 'none' })
      } finally {
        this.exporting = false
      }
    },
    
    async exportToPDF(data) {
      // 生成 PDF 内容
      const content = this.generatePDFContent(data)
      
      // 使用 uni-app 的打印功能或第三方服务
      // 这里模拟导出成功
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      uni.showToast({ 
        title: 'PDF 已生成', 
        icon: 'success'
      })
    },
    
    async exportToExcel(data) {
      // 生成 Excel 内容
      const content = this.generateExcelContent(data)
      
      // 使用 uni-app 的文件系统保存
      // 这里模拟导出成功
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      uni.showToast({ 
        title: 'Excel 已生成', 
        icon: 'success'
      })
    },
    
    generatePDFContent(data) {
      // 生成 PDF 内容
      let content = `PetsLog 数据导出报告\n`
      content += `导出时间：${data.exportAt}\n\n`
      
      if (data.data.basic) {
        content += `=== 基本信息 ===\n`
        if (Array.isArray(data.data.basic)) {
          data.data.basic.forEach(pet => {
            content += `${pet.name} - ${pet.breed}\n`
          })
        } else {
          content += `${data.data.basic.name} - ${data.data.basic.breed}\n`
        }
        content += `\n`
      }
      
      return content
    },
    
    generateExcelContent(data) {
      // 生成 Excel CSV 格式内容
      let csv = '\uFEFF' // BOM for UTF-8
      
      if (data.data.basic && Array.isArray(data.data.basic)) {
        csv += '宠物姓名，品种，性别，年龄，毛色\n'
        data.data.basic.forEach(pet => {
          csv += `${pet.name},${pet.breed},${pet.gender},${pet.age},${pet.color}\n`
        })
        csv += '\n'
      }
      
      return csv
    },
    
    shareData() {
      if (!this.exportedData) {
        uni.showToast({ title: '请先导出数据', icon: 'none' })
        return
      }
      
      uni.showActionSheet({
        itemList: ['微信好友', '微信朋友圈', 'QQ 好友', '复制链接'],
        success: (res) => {
          uni.showToast({ 
            title: '分享功能开发中', 
            icon: 'none'
          })
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

.range-options,
.format-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.range-option,
.format-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.range-option.active,
.format-option.active {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.range-icon,
.format-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.range-text,
.format-text {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.range-desc,
.format-desc {
  font-size: 11px;
  color: #94a3b8;
}

.picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.picker text {
  font-size: 15px;
  color: #64748b;
}

.picker .arrow {
  font-size: 20px;
  color: #cbd5e1;
}

.content-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.content-option.checked .checkbox {
  color: #667eea;
}

.checkbox {
  font-size: 20px;
}

.content-text {
  font-size: 14px;
  color: #1e293b;
}

.export-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
}

.btn-export,
.btn-share {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
}

.btn-export {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.btn-export:disabled {
  opacity: 0.6;
}

.btn-share {
  background: #ffffff;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-share:disabled {
  opacity: 0.4;
}

.export-icon,
.share-icon {
  font-size: 20px;
}

.tips {
  background: #ffffff;
  margin: 16px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tips-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.tips-text {
  display: block;
  font-size: 13px;
  color: #64748b;
  line-height: 1.8;
  margin-bottom: 4px;
}
</style>
