<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <text class="title">💊 用药记录</text>
      <text class="subtitle">管理宠物用药计划</text>
    </view>

    <!-- 宠物选择器 -->
    <view class="pet-selector" v-if="!petId">
      <picker :range="petNames" :value="petIndex" @change="onPetChange">
        <view class="picker">
          <text>{{ petNames[petIndex] || '选择宠物' }}</text>
          <text class="arrow">▼</text>
        </view>
      </picker>
    </view>

    <!-- 用药记录列表 -->
    <scroll-view scroll-y class="content">
      <view class="medication-list">
        <view 
          class="medication-card" 
          v-for="(item, index) in medications" 
          :key="item._id || index"
          :class="item.status"
        >
          <view class="card-header">
            <view class="medicine-info">
              <text class="medicine-name">{{ item.medicineName }}</text>
              <text class="medicine-purpose" v-if="item.purpose">{{ item.purpose }}</text>
            </view>
            <view class="status-tag" :class="item.status">
              {{ getStatusText(item.status) }}
            </view>
          </view>

          <view class="card-body">
            <view class="info-row">
              <text class="label">💊 剂量：</text>
              <text class="value">{{ item.dosage }}</text>
            </view>
            <view class="info-row">
              <text class="label">⏰ 频率：</text>
              <text class="value">{{ getFrequencyText(item.frequency) }}</text>
            </view>
            <view class="info-row" v-if="item.instructions">
              <text class="label">📝 说明：</text>
              <text class="value">{{ item.instructions }}</text>
            </view>
            <view class="info-row">
              <text class="label">📅 下次用药：</text>
              <text class="value" :class="{ urgent: isUrgent(item.nextDoseTime) }">
                {{ formatTime(item.nextDoseTime) }}
              </text>
            </view>
          </view>

          <view class="card-actions">
            <button class="action-btn" @click="recordDose(item)">✅ 已用药</button>
            <button class="action-btn" @click="editMedication(item)">✏️ 编辑</button>
            <button class="action-btn danger" @click="deleteMedication(item)">🗑️ 删除</button>
          </view>
        </view>

        <view class="empty-state" v-if="medications.length === 0">
          <text class="empty-emoji">💊</text>
          <text class="empty-text">暂无用药记录</text>
        </view>
      </view>
    </scroll-view>

    <!-- 添加按钮 -->
    <view class="add-btn" @click="showAddForm">
      <text class="add-icon">+</text>
    </view>

    <!-- 添加/编辑表单弹窗 -->
    <view class="form-modal" v-if="showForm">
      <view class="form-content">
        <view class="form-header">
          <text class="form-title">{{ isEditing ? '编辑用药' : '添加用药' }}</text>
          <text class="close-btn" @click="closeForm">✕</text>
        </view>

        <scroll-view scroll-y class="form-body">
          <view class="form-group">
            <text class="form-label">药品名称 *</text>
            <input 
              class="input" 
              v-model="formData.medicineName"
              placeholder="如：苯巴比妥片"
            />
          </view>

          <view class="form-group">
            <text class="form-label">每次剂量 *</text>
            <input 
              class="input" 
              v-model="formData.dosage"
              placeholder="如：1 片、5ml"
            />
          </view>

          <view class="form-group">
            <text class="form-label">用药频率 *</text>
            <picker :range="frequencyOptions" :value="frequencyIndex" @change="onFrequencyChange">
              <view class="picker">
                <text>{{ frequencyOptions[frequencyIndex] }}</text>
                <text class="arrow">▼</text>
              </view>
            </picker>
          </view>

          <view class="form-group" v-if="formData.frequency === 'custom'">
            <text class="form-label">自定义频率</text>
            <input 
              class="input" 
              v-model="formData.frequencyCustom"
              placeholder="如：每 8 小时一次"
            />
          </view>

          <view class="form-group">
            <text class="form-label">用药目的</text>
            <input 
              class="input" 
              v-model="formData.purpose"
              placeholder="如：控制癫痫"
            />
          </view>

          <view class="form-group">
            <text class="form-label">用药说明</text>
            <textarea 
              class="textarea" 
              v-model="formData.instructions"
              placeholder="如：饭后服用、避免与牛奶同服等"
            />
          </view>

          <view class="form-group">
            <text class="form-label">处方医院</text>
            <input 
              class="input" 
              v-model="formData.prescriptionHospital"
              placeholder="可选"
            />
          </view>

          <view class="form-group">
            <text class="form-label">处方医生</text>
            <input 
              class="input" 
              v-model="formData.prescriptionDoctor"
              placeholder="可选"
            />
          </view>

          <view class="form-group">
            <label class="checkbox-label">
              <switch :checked="formData.remindEnabled" @change="onRemindChange" />
              <text class="checkbox-text">启用用药提醒</text>
            </label>
          </view>

          <view class="form-group" v-if="formData.remindEnabled">
            <text class="form-label">提醒时间</text>
            <view class="time-tags">
              <view 
                class="time-tag" 
                v-for="(time, idx) in formData.remindTimes" 
                :key="idx"
              >
                {{ time }}
                <text class="remove-tag" @click="removeTime(idx)">✕</text>
              </view>
              <view class="add-time-btn" @click="addTime">
                <text>+ 添加时间</text>
              </view>
            </view>
          </view>

          <view class="form-group">
            <text class="form-label">备注</text>
            <textarea 
              class="textarea" 
              v-model="formData.notes"
              placeholder="其他需要注意的事项"
            />
          </view>
        </scroll-view>

        <view class="form-footer">
          <button class="btn btn-secondary" @click="closeForm">取消</button>
          <button class="btn btn-primary" @click="submitForm">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      petId: '',
      pets: [],
      petIndex: 0,
      petNames: [],
      medications: [],
      showForm: false,
      isEditing: false,
      formData: {
        medicineName: '',
        dosage: '',
        frequency: 'twice_daily',
        frequencyCustom: '',
        purpose: '',
        instructions: '',
        prescriptionHospital: '',
        prescriptionDoctor: '',
        remindEnabled: false,
        remindTimes: [],
        notes: ''
      },
      frequencyOptions: [
        '每天 1 次',
        '每天 2 次',
        '每天 3 次',
        '按需使用',
        '自定义'
      ],
      frequencyIndex: 1
    }
  },
  onLoad(options) {
    if (options.petId) {
      this.petId = options.petId
    }
    this.loadPets()
    this.loadMedications()
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
          this.petNames = this.pets.map(p => p.name)
          
          if (this.petId && this.pets.length > 0) {
            const index = this.pets.findIndex(p => p._id === this.petId)
            this.petIndex = index >= 0 ? index : 0
          }
        }
      } catch (e) {
        console.error('加载宠物失败:', e)
      }
    },
    
    async loadMedications() {
      if (!this.petId) return
      
      try {
        const res = await uniCloud.callFunction({
          name: 'medication-record',
          data: {
            action: 'list',
            petId: this.petId
          }
        })
        
        if (res.result.code === 200) {
          this.medications = res.result.data.records || []
        }
      } catch (e) {
        console.error('加载用药记录失败:', e)
      }
    },
    
    onPetChange(e) {
      this.petIndex = e.detail.value
      this.petId = this.pets[this.petIndex]._id
      this.loadMedications()
    },
    
    onFrequencyChange(e) {
      this.frequencyIndex = e.detail.value
      const freqMap = {
        0: 'once_daily',
        1: 'twice_daily',
        2: 'three_times_daily',
        3: 'as_needed',
        4: 'custom'
      }
      this.formData.frequency = freqMap[this.frequencyIndex]
    },
    
    onRemindChange(e) {
      this.formData.remindEnabled = e.detail.value
    },
    
    addTime() {
      const now = new Date()
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      this.formData.remindTimes.push(time)
    },
    
    removeTime(idx) {
      this.formData.remindTimes.splice(idx, 1)
    },
    
    showAddForm() {
      if (!this.petId) {
        uni.showToast({ title: '请先选择宠物', icon: 'none' })
        return
      }
      this.resetForm()
      this.showForm = true
      this.isEditing = false
    },
    
    editMedication(item) {
      this.formData = {
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        frequencyCustom: item.frequencyCustom || '',
        purpose: item.purpose || '',
        instructions: item.instructions || '',
        prescriptionHospital: item.prescriptionHospital || '',
        prescriptionDoctor: item.prescriptionDoctor || '',
        remindEnabled: item.remindEnabled || false,
        remindTimes: item.remindTimes || [],
        notes: item.notes || ''
      }
      
      const freqMap = {
        'once_daily': 0,
        'twice_daily': 1,
        'three_times_daily': 2,
        'as_needed': 3,
        'custom': 4
      }
      this.frequencyIndex = freqMap[item.frequency] || 1
      
      this.showForm = true
      this.isEditing = true
      this.editingId = item._id
    },
    
    closeForm() {
      this.showForm = false
      this.resetForm()
    },
    
    resetForm() {
      this.formData = {
        medicineName: '',
        dosage: '',
        frequency: 'twice_daily',
        frequencyCustom: '',
        purpose: '',
        instructions: '',
        prescriptionHospital: '',
        prescriptionDoctor: '',
        remindEnabled: false,
        remindTimes: [],
        notes: ''
      }
      this.frequencyIndex = 1
    },
    
    async submitForm() {
      const { medicineName, dosage, frequency } = this.formData
      if (!medicineName || !dosage || !frequency) {
        uni.showToast({ title: '请填写必填项', icon: 'none' })
        return
      }
      
      const userStr = uni.getStorageSync('user')
      const user = JSON.parse(userStr)
      
      try {
        const action = this.isEditing ? 'update' : 'create'
        const data = {
          action,
          petId: this.petId,
          petName: this.petNames[this.petIndex],
          ...this.formData
        }
        
        if (this.isEditing) {
          data.recordId = this.editingId
        }
        
        const res = await uniCloud.callFunction({
          name: 'medication-record',
          data
        })
        
        if (res.result.code === 200 || res.result.code === 201) {
          uni.showToast({ 
            title: this.isEditing ? '更新成功' : '添加成功', 
            icon: 'success' 
          })
          this.closeForm()
          this.loadMedications()
        } else {
          uni.showToast({ title: res.result.message, icon: 'none' })
        }
      } catch (e) {
        console.error('保存失败:', e)
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    },
    
    async recordDose(item) {
      try {
        const res = await uniCloud.callFunction({
          name: 'medication-record',
          data: {
            action: 'record_dose',
            recordId: item._id
          }
        })
        
        if (res.result.code === 200) {
          uni.showToast({ title: '已记录', icon: 'success' })
          this.loadMedications()
        }
      } catch (e) {
        console.error('记录失败:', e)
        uni.showToast({ title: '记录失败', icon: 'none' })
      }
    },
    
    deleteMedication(item) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除${item.medicineName}的用药记录吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const delRes = await uniCloud.callFunction({
                name: 'medication-record',
                data: {
                  action: 'delete',
                  recordId: item._id
                }
              })
              
              if (delRes.result.code === 200) {
                uni.showToast({ title: '删除成功', icon: 'success' })
                this.loadMedications()
              }
            } catch (e) {
              console.error('删除失败:', e)
              uni.showToast({ title: '删除失败', icon: 'none' })
            }
          }
        }
      })
    },
    
    getStatusText(status) {
      const map = {
        ongoing: '进行中',
        completed: '已完成',
        paused: '已暂停',
        discontinued: '已停止'
      }
      return map[status] || status
    },
    
    getFrequencyText(freq) {
      const map = {
        once_daily: '每天 1 次',
        twice_daily: '每天 2 次',
        three_times_daily: '每天 3 次',
        as_needed: '按需使用',
        custom: '自定义'
      }
      return map[freq] || freq
    },
    
    formatTime(timestamp) {
      if (!timestamp) return '未设置'
      const date = new Date(timestamp)
      const now = new Date()
      const diff = timestamp - now
      
      if (diff < 0) {
        return '已过期'
      } else if (diff < 1000 * 60 * 60) {
        return '即将用药'
      } else {
        return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      }
    },
    
    isUrgent(nextDoseTime) {
      if (!nextDoseTime) return false
      return nextDoseTime - Date.now() < 1000 * 60 * 60 // 1 小时内
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

.pet-selector {
  padding: 16px;
  background: #ffffff;
  
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
    }
  }
}

.content {
  height: calc(100vh - 200px);
}

.medication-list {
  padding: 16px;
}

.medication-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #667eea;
  
  &.ongoing { border-left-color: #10b981; }
  &.completed { border-left-color: #6b7280; }
  &.paused { border-left-color: #f59e0b; }
  &.discontinued { border-left-color: #ef4444; }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.medicine-info {
  flex: 1;
}

.medicine-name {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.medicine-purpose {
  display: block;
  font-size: 13px;
  color: #64748b;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  background: #e0e7ff;
  color: #667eea;
  
  &.ongoing { background: #d1fae5; color: #10b981; }
  &.completed { background: #f3f4f6; color: #6b7280; }
  &.paused { background: #fef3c7; color: #f59e0b; }
  &.discontinued { background: #fee2e2; color: #ef4444; }
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  font-size: 14px;
  
  .label {
    color: #64748b;
    margin-right: 8px;
    min-width: 80px;
  }
  
  .value {
    color: #1e293b;
    flex: 1;
    
    &.urgent {
      color: #ef4444;
      font-weight: 600;
    }
  }
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: #f1f5f9;
  color: #1e293b;
  font-size: 13px;
  
  &.danger {
    background: #fee2e2;
    color: #ef4444;
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  
  .empty-emoji {
    display: block;
    font-size: 64px;
    margin-bottom: 16px;
  }
  
  .empty-text {
    display: block;
    font-size: 16px;
    color: #64748b;
  }
}

.add-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  
  .add-icon {
    font-size: 32px;
    color: #ffffff;
    font-weight: 300;
  }
}

.form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.form-content {
  background: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.form-title {
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  font-size: 24px;
  color: #64748b;
}

.form-body {
  flex: 1;
  padding: 16px;
  max-height: 60vh;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 8px;
}

.input, .textarea, .picker {
  width: 100%;
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

.textarea {
  min-height: 80px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.time-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: #e0e7ff;
  border-radius: 16px;
  font-size: 13px;
  color: #667eea;
  
  .remove-tag {
    margin-left: 6px;
    cursor: pointer;
  }
}

.add-time-btn {
  display: inline-flex;
  padding: 6px 12px;
  background: #f1f5f9;
  border-radius: 16px;
  font-size: 13px;
  color: #64748b;
}

.form-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  
  &.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
  }
  
  &.btn-secondary {
    background: #f1f5f9;
    color: #1e293b;
  }
}
</style>
