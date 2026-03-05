<template>
  <view class="container">
    <!-- 宠物头部卡片 -->
    <view class="pet-header-card">
      <view class="avatar-wrapper">
        <image 
          class="avatar avatar-xl" 
          :src="petInfo.avatar || '/static/logo.png'" 
          mode="aspectFill"
          lazy-load
        />
      </view>
      <view class="pet-info">
        <text class="pet-name">{{ petInfo.name }}</text>
        <text class="pet-breed">{{ petInfo.breed || '未知品种' }}</text>
        <view class="pet-meta">
          <text>{{ petInfo.age || '未知年龄' }}</text>
          <text class="dot">•</text>
          <text>{{ petInfo.gender === 'male' ? '公' : petInfo.gender === 'female' ? '母' : '未知' }}</text>
        </view>
      </view>
      <view class="edit-btn" @click="editPet">✏️</view>
    </view>

    <!-- 可滚动 Tab 栏 -->
    <scroll-view scroll-x class="tab-scroll" show-scrollbar="false">
      <view class="tabs">
        <view class="tab" :class="{ active: currentTab === 'overview' }" @click="currentTab = 'overview'">
          <text>📋 概览</text>
        </view>
        <view class="tab" :class="{ active: currentTab === 'weight' }" @click="currentTab = 'weight'">
          <text>⚖️ 体重</text>
        </view>
        <view class="tab" :class="{ active: currentTab === 'health' }" @click="currentTab = 'health'">
          <text>🏥 健康</text>
        </view>
        <view class="tab" :class="{ active: currentTab === 'food' }" @click="currentTab = 'food'">
          <text>🍖 粮食</text>
        </view>
        <view class="tab" :class="{ active: currentTab === 'vaccine' }" @click="currentTab = 'vaccine'">
          <text>💉 疫苗</text>
        </view>
        <view class="tab" :class="{ active: currentTab === 'deworming' }" @click="currentTab = 'deworming'">
          <text>💊 驱虫</text>
        </view>
      </view>
    </scroll-view>

    <!-- 内容区域 -->
    <view class="content">
      <!-- 概览 -->
      <view v-if="currentTab === 'overview'" class="overview">
        <view class="card">
          <text class="card-title">基本信息</text>
          <view class="info-list">
            <view class="info-item">
              <text class="info-label">品种：</text>
              <text class="info-value">{{ petInfo.breed || '-' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">性别：</text>
              <text class="info-value">{{ petInfo.gender === 'male' ? '公' : petInfo.gender === 'female' ? '母' : '-' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">年龄：</text>
              <text class="info-value">{{ petInfo.age || '-' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">毛色：</text>
              <text class="info-value">{{ petInfo.color || '-' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">绝育：</text>
              <text class="info-value">{{ petInfo.neutered ? '已绝育' : '未绝育' }}</text>
            </view>
            <view class="info-item" v-if="petInfo.neutered">
              <text class="info-label">绝育日期：</text>
              <text class="info-value">{{ formatDate(petInfo.neuterDate) }}</text>
            </view>
            <view class="info-item" v-if="petInfo.notes">
              <text class="info-label">备注：</text>
              <text class="info-value">{{ petInfo.notes }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 体重 -->
      <view v-else-if="currentTab === 'weight'" class="tab-content">
        <!-- 体重曲线图 -->
        <view class="chart-card" v-if="weightRecords.length > 0">
          <weight-chart :records="weightRecords" :height="280" />
        </view>
        
        <button class="btn btn-primary btn-block" @click="addRecord('weight')">+ 添加体重记录</button>
        
        <view class="record-list">
          <view class="record-item" v-for="(record, index) in weightRecords" :key="record._id || index">
            <view class="record-main">
              <text class="record-value">{{ record.weight }} kg</text>
              <text class="record-note" v-if="record.note">{{ record.note }}</text>
            </view>
            <view class="record-actions">
              <text class="record-date">{{ formatDate(record.recordedAt) }}</text>
              <text class="delete-btn" @click.stop="deleteRecord(record._id)">🗑️</text>
            </view>
          </view>
          <view class="empty-state" v-if="weightRecords.length === 0">
            <text class="empty-emoji">📝</text>
            <text class="empty-text">暂无体重记录</text>
          </view>
        </view>
      </view>

      <!-- 驱虫 -->
      <view v-else-if="currentTab === 'deworming'" class="tab-content">
        <button class="btn btn-primary btn-block" @click="showDewormingForm">+ 添加驱虫记录</button>
        
        <view class="reminder-card" v-if="nextDewormingDate">
          <text class="reminder-title">💊 下次驱虫提醒</text>
          <text class="reminder-date">{{ nextDewormingDate }}</text>
        </view>
        
        <view class="record-list">
          <view class="record-item" v-for="(record, index) in dewormingRecords" :key="record._id || index">
            <view class="record-main">
              <text class="record-type">{{ record.type === 'internal' ? '体内驱虫' : '体外驱虫' }}</text>
              <text class="record-brand">{{ record.brand }} - {{ record.product }}</text>
              <text class="record-date">使用日期：{{ formatDate(record.usedAt) }}</text>
              <text class="record-next" v-if="record.nextReminder">下次提醒：{{ formatDate(record.nextReminder) }}</text>
            </view>
            <view class="record-actions">
              <text class="delete-btn" @click.stop="deleteDewormingRecord(record._id)">🗑️</text>
            </view>
          </view>
          <view class="empty-state" v-if="dewormingRecords.length === 0">
            <text class="empty-emoji">💊</text>
            <text class="empty-text">暂无驱虫记录</text>
          </view>
        </view>
      </view>

      <!-- 疫苗 -->
      <view v-else-if="currentTab === 'vaccine'" class="tab-content">
        <button class="btn btn-primary btn-block" @click="showVaccineForm">+ 添加疫苗记录</button>
        
        <view class="reminder-card" v-if="nextVaccineDate">
          <text class="reminder-title">💉 下次疫苗提醒</text>
          <text class="reminder-date">{{ nextVaccineDate }}</text>
        </view>
        
        <view class="record-list">
          <view class="record-item" v-for="(record, index) in vaccineRecords" :key="record._id || index">
            <view class="record-main">
              <text class="record-type">{{ record.name }}</text>
              <text class="record-brand">{{ record.type }} - {{ record.brand }}</text>
              <text class="record-date">接种日期：{{ formatDate(record.vaccinatedAt) }}</text>
              <text class="record-next" v-if="record.nextReminder">下次接种：{{ formatDate(record.nextReminder) }}</text>
            </view>
            <view class="record-actions">
              <text class="delete-btn" @click.stop="deleteVaccineRecord(record._id)">🗑️</text>
            </view>
          </view>
          <view class="empty-state" v-if="vaccineRecords.length === 0">
            <text class="empty-emoji">💉</text>
            <text class="empty-text">暂无疫苗记录</text>
          </view>
        </view>
      </view>

      <!-- 健康 -->
      <view v-else-if="currentTab === 'health'" class="tab-content">
        <button class="btn btn-primary btn-block" @click="showHealthForm">+ 添加健康记录</button>
        
        <view class="record-list">
          <view class="record-item" v-for="(record, index) in healthRecords" :key="record._id || index">
            <view class="record-main">
              <text class="record-type">{{ record.symptom }}</text>
              <text class="record-brand">观察：{{ record.observation }}</text>
              <text class="record-date">日期：{{ formatDate(record.recordedAt) }}</text>
              <text class="record-status" v-if="record.status">状态：{{ record.status === 'observing' ? '观察中' : record.status === 'treatment' ? '治疗中' : '已恢复' }}</text>
              <text class="record-attachments" v-if="record.attachments && record.attachments.length > 0">📎 {{ record.attachments.length }} 个附件</text>
            </view>
            <view class="record-actions">
              <text class="delete-btn" @click.stop="deleteHealthRecord(record._id)">🗑️</text>
            </view>
          </view>
          <view class="empty-state" v-if="healthRecords.length === 0">
            <text class="empty-emoji">🏥</text>
            <text class="empty-text">暂无健康记录</text>
          </view>
        </view>
      </view>

      <!-- 粮食 -->
      <view v-else-if="currentTab === 'food'" class="tab-content">
        <button class="btn btn-primary btn-block" @click="showFoodForm">+ 添加粮食记录</button>
        
        <view class="current-food-card" v-if="currentFood">
          <text class="current-food-title">🍖 当前粮食</text>
          <text class="current-food-brand">{{ currentFood.brand }} - {{ currentFood.product }}</text>
          <text class="current-food-date" v-if="currentFood.startDate">开始日期：{{ formatDate(currentFood.startDate) }}</text>
        </view>
        
        <view class="record-list">
          <view class="record-item" v-for="(record, index) in foodRecords" :key="record._id || index">
            <view class="record-main">
              <text class="record-type">{{ record.brand }} - {{ record.product }}</text>
              <text class="record-brand">类型：{{ record.type === 'dry' ? '干粮' : record.type === 'wet' ? '湿粮' : '零食' }}</text>
              <text class="record-date">开始日期：{{ formatDate(record.startDate) }}</text>
              <text class="record-next" v-if="record.endDate">结束日期：{{ formatDate(record.endDate) }}</text>
            </view>
            <view class="record-actions">
              <text class="delete-btn" @click.stop="deleteFoodRecord(record._id)">🗑️</text>
            </view>
          </view>
          <view class="empty-state" v-if="foodRecords.length === 0">
            <text class="empty-emoji">🍖</text>
            <text class="empty-text">暂无粮食记录</text>
          </view>
        </view>
      </view>

      <!-- 其他 Tab 占位 -->
      <view v-else class="placeholder">
        <text class="placeholder-emoji">🚧</text>
        <text>{{ getTabName(currentTab) }} 功能开发中...</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="currentTab === 'overview'">
      <button class="btn btn-secondary" @click="deletePet">删除宠物</button>
    </view>
  </view>
</template>

<script>
import WeightChart from '@/components/WeightChart.vue';

export default {
  components: {
    WeightChart
  },
  data() {
    return {
      petId: '',
      petInfo: {
        name: '',
        breed: '',
        age: '',
        gender: '',
        color: '',
        neutered: false,
        neuterDate: 0,
        notes: '',
        avatar: ''
      },
      currentTab: 'overview',
      weightRecords: [],
      dewormingRecords: [],
      vaccineRecords: [],
      healthRecords: [],
      foodRecords: [],
      nextDewormingDate: '',
      nextVaccineDate: '',
      currentFood: null,
      healthSymptom: '',
      healthObservation: '',
      healthFiles: [],
      dewormingForm: {
        type: 'external',
        brand: '',
        product: '',
        usedAt: 0,
        nextReminder: 0,
        remindEnabled: false
      },
      vaccineForm: {
        name: '',
        type: '',
        brand: '',
        product: '',
        vaccinatedAt: 0,
        nextReminder: 0,
        remindEnabled: false
      },
      foodForm: {
        brand: '',
        product: '',
        type: 'dry',
        startDate: 0,
        endDate: 0
      }
    }
  },
  onLoad(options) {
    if (options.petId) {
      this.petId = options.petId;
      this.loadPetDetail();
      this.loadWeightRecords();
      this.loadDewormingRecords();
      this.loadVaccineRecords();
      this.loadFoodRecords();
      this.loadHealthRecords();
    } else if (options.name) {
      this.petInfo.name = options.name;
    }
  },
  onShow() {
    // 每次显示页面时重新加载数据（防止编辑后不更新）
    if (this.petId) {
      this.loadPetDetail();
      this.loadWeightRecords();
      this.loadDewormingRecords();
      this.loadVaccineRecords();
      this.loadFoodRecords();
      this.loadHealthRecords();
    }
  },
  methods: {
    async loadPetDetail() {
      if (!this.petId) return;
      
      try {
        // 从 pet-list 获取宠物详情（因为没有单独的 pet-detail 云函数）
        const userStr = uni.getStorageSync('user');
        const user = JSON.parse(userStr);
        
        const res = await uniCloud.callFunction({
          name: 'pet-list',
          data: { familyId: user.familyId }
        });
        
        if (res.result.code === 200) {
          const pets = res.result.data.pets || [];
          const pet = pets.find(p => p._id === this.petId);
          if (pet) {
            this.petInfo = pet;
          }
        }
      } catch (e) {
        console.error('加载宠物详情失败:', e);
      }
    },
    async loadWeightRecords() {
      if (!this.petId) return;
      try {
        const res = await uniCloud.callFunction({
          name: 'weight-record',
          data: { action: 'list', petId: this.petId }
        });
        if (res.result.code === 200) {
          this.weightRecords = res.result.data.records || [];
        }
      } catch (e) {
        console.error('加载体重记录失败:', e);
      }
    },
    async loadDewormingRecords() {
      if (!this.petId) return;
      try {
        const res = await uniCloud.callFunction({
          name: 'deworming-record',
          data: { action: 'list', petId: this.petId }
        });
        if (res.result.code === 200) {
          this.dewormingRecords = res.result.data.records || [];
          this.calculateNextDeworming();
        }
      } catch (e) {
        console.error('加载驱虫记录失败:', e);
      }
    },
    async loadVaccineRecords() {
      if (!this.petId) return;
      try {
        const res = await uniCloud.callFunction({
          name: 'vaccine-record',
          data: { action: 'list', petId: this.petId }
        });
        if (res.result.code === 200) {
          this.vaccineRecords = res.result.data.records || [];
          this.calculateNextVaccine();
        }
      } catch (e) {
        console.error('加载疫苗记录失败:', e);
      }
    },
    async loadFoodRecords() {
      if (!this.petId) return;
      try {
        const res = await uniCloud.callFunction({
          name: 'food-record',
          data: { action: 'list', petId: this.petId }
        });
        if (res.result.code === 200) {
          this.foodRecords = res.result.data.records || [];
          this.calculateCurrentFood();
        }
      } catch (e) {
        console.error('加载粮食记录失败:', e);
      }
    },
    async loadHealthRecords() {
      if (!this.petId) return;
      try {
        const res = await uniCloud.callFunction({
          name: 'health-record',
          data: { action: 'list', petId: this.petId }
        });
        if (res.result.code === 200) {
          this.healthRecords = res.result.data.records || [];
        }
      } catch (e) {
        console.error('加载健康记录失败:', e);
      }
    },
    calculateNextDeworming() {
      // 找到最近的下次驱虫日期
      const futureRecords = this.dewormingRecords.filter(r => r.nextReminder && r.nextReminder > Date.now());
      if (futureRecords.length > 0) {
        futureRecords.sort((a, b) => a.nextReminder - b.nextReminder);
        this.nextDewormingDate = this.formatDate(futureRecords[0].nextReminder);
      } else {
        this.nextDewormingDate = '';
      }
    },
    calculateNextVaccine() {
      const futureRecords = this.vaccineRecords.filter(r => r.nextReminder && r.nextReminder > Date.now());
      if (futureRecords.length > 0) {
        futureRecords.sort((a, b) => a.nextReminder - b.nextReminder);
        this.nextVaccineDate = this.formatDate(futureRecords[0].nextReminder);
      } else {
        this.nextVaccineDate = '';
      }
    },
    calculateCurrentFood() {
      const currentFoods = this.foodRecords.filter(r => !r.endDate || new Date(r.endDate).getTime() > Date.now());
      if (currentFoods.length > 0) {
        currentFoods.sort((a, b) => b.startDate - a.startDate);
        this.currentFood = currentFoods[0];
      } else {
        this.currentFood = null;
      }
    },
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    editPet() {
      uni.navigateTo({
        url: `/pages/edit-pet/edit-pet?petId=${this.petId}`
      });
    },
    async deletePet() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这只宠物吗？相关记录也会被删除。',
        success: async (res) => {
          if (res.confirm) {
            try {
              const delRes = await uniCloud.callFunction({
                name: 'pet-delete',
                data: { petId: this.petId }
              });
              
              if (delRes.result.code === 200) {
                uni.showToast({ title: '删除成功', icon: 'success' });
                setTimeout(() => {
                  uni.navigateBack();
                }, 1500);
              } else {
                uni.showToast({ title: delRes.result.message, icon: 'none' });
              }
            } catch (e) {
              console.error('删除宠物失败:', e);
              uni.showToast({ title: '删除失败，请稍后重试', icon: 'none' });
            }
          }
        }
      });
    },
    addRecord(type) {
      if (type === 'weight') {
        this.showWeightInput();
      }
    },
    async showWeightInput() {
      uni.showModal({
        title: '添加体重记录',
        editable: true,
        placeholderText: '请输入体重 (kg)',
        success: (res) => {
          if (res.confirm && res.content) {
            const weight = parseFloat(res.content);
            if (isNaN(weight) || weight <= 0) {
              uni.showToast({ title: '请输入有效的体重', icon: 'none' });
            } else {
              this.showWeightNote(weight);
            }
          }
        }
      });
    },
    showWeightNote(weight) {
      uni.showModal({
        title: '添加备注（可选）',
        editable: true,
        placeholderText: '例如：刚吃完早饭、精神状态好等',
        confirmText: '保存',
        cancelText: '跳过',
        success: (res) => {
          if (res.confirm) {
            this.saveWeightRecord(weight, res.content || '');
          } else {
            this.saveWeightRecord(weight, '');
          }
        }
      });
    },
    async saveWeightRecord(weight, note) {
      try {
        const res = await uniCloud.callFunction({
          name: 'weight-record',
          data: {
            action: 'create',
            petId: this.petId,
            weight: weight,
            note: note,
            recordedAt: Date.now()
          }
        });
        
        if (res.result.code === 201) {
          uni.showToast({ title: '添加成功', icon: 'success' });
          this.loadWeightRecords();
        } else {
          uni.showToast({ title: res.result.message, icon: 'none' });
        }
      } catch (e) {
        console.error('保存体重记录失败:', e);
        uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' });
      }
    },
    async deleteRecord(recordId) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条记录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const delRes = await uniCloud.callFunction({
                name: 'weight-record',
                data: { action: 'delete', recordId }
              });
              
              if (delRes.result.code === 200) {
                uni.showToast({ title: '删除成功', icon: 'success' });
                this.loadWeightRecords();
              } else {
                uni.showToast({ title: delRes.result.message, icon: 'none' });
              }
            } catch (e) {
              console.error('删除记录失败:', e);
              uni.showToast({ title: '删除失败，请稍后重试', icon: 'none' });
            }
          }
        }
      });
    },
    showDewormingForm() {
      this.dewormingForm = {
        type: 'external',
        brand: '',
        product: '',
        usedAt: Date.now(),
        nextReminder: 0,
        remindEnabled: false
      };
      uni.showModal({
        title: '添加驱虫记录',
        editable: true,
        placeholderText: '请输入品牌/型号（如：福来恩 体外驱虫）',
        success: (res) => {
          if (res.confirm && res.content) {
            const parts = res.content.split(' ');
            this.dewormingForm.brand = parts[0] || '';
            this.dewormingForm.product = parts[1] || '';
            this.showDewormingTypeSelect();
          }
        }
      });
    },
    showDewormingTypeSelect() {
      uni.showActionSheet({
        itemList: ['体内驱虫', '体外驱虫'],
        success: (res) => {
          this.dewormingForm.type = res.tapIndex === 0 ? 'internal' : 'external';
          this.showDewormingDate();
        }
      });
    },
    showDewormingDate() {
      uni.showModal({
        title: '选择使用日期',
        editable: true,
        placeholderText: '请输入日期（YYYY-MM-DD）',
        success: (res) => {
          if (res.confirm && res.content) {
            this.dewormingForm.usedAt = new Date(res.content).getTime();
            this.showDewormingReminder();
          }
        }
      });
    },
    showDewormingReminder() {
      uni.showModal({
        title: '设置下次提醒',
        editable: true,
        placeholderText: '请输入下次驱虫日期（YYYY-MM-DD）',
        confirmText: '设置',
        cancelText: '跳过',
        success: (res) => {
          if (res.confirm && res.content) {
            this.dewormingForm.nextReminder = new Date(res.content).getTime();
            this.dewormingForm.remindEnabled = true;
          }
          this.saveDewormingRecord();
        }
      });
    },
    async saveDewormingRecord() {
      try {
        const res = await uniCloud.callFunction({
          name: 'deworming-record',
          data: {
            action: 'create',
            petId: this.petId,
            ...this.dewormingForm
          }
        });
        
        if (res.result.code === 201) {
          uni.showToast({ title: '添加成功', icon: 'success' });
          this.loadDewormingRecords();
        } else {
          uni.showToast({ title: res.result.message, icon: 'none' });
        }
      } catch (e) {
        console.error('保存驱虫记录失败:', e);
        uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' });
      }
    },
    async deleteDewormingRecord(recordId) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条驱虫记录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const delRes = await uniCloud.callFunction({
                name: 'deworming-record',
                data: { action: 'delete', recordId }
              });
              
              if (delRes.result.code === 200) {
                uni.showToast({ title: '删除成功', icon: 'success' });
                this.loadDewormingRecords();
              } else {
                uni.showToast({ title: delRes.result.message, icon: 'none' });
              }
            } catch (e) {
              console.error('删除驱虫记录失败:', e);
              uni.showToast({ title: '删除失败，请稍后重试', icon: 'none' });
            }
          }
        }
      });
    },
    showVaccineForm() {
      this.vaccineForm = {
        name: '',
        type: '',
        brand: '',
        product: '',
        vaccinatedAt: 0,
        nextReminder: 0,
        remindEnabled: false
      };
      uni.showModal({
        title: '添加疫苗记录',
        editable: true,
        placeholderText: '请输入疫苗名称（如：猫三联）',
        success: (res) => {
          if (res.confirm && res.content) {
            this.vaccineForm.name = res.content;
            this.showVaccineTypeSelect();
          }
        }
      });
    },
    showVaccineTypeSelect() {
      uni.showActionSheet({
        itemList: ['猫三联', '狗三联', '狂犬疫苗', '其他'],
        success: (res) => {
          this.vaccineForm.type = ['猫三联', '狗三联', '狂犬疫苗', '其他'][res.tapIndex];
          this.showVaccineBrand();
        }
      });
    },
    showVaccineBrand() {
      uni.showModal({
        title: '疫苗品牌',
        editable: true,
        placeholderText: '请输入品牌（如：硕腾）',
        success: (res) => {
          if (res.confirm && res.content) {
            this.vaccineForm.brand = res.content;
            this.showVaccineDate();
          }
        }
      });
    },
    showVaccineDate() {
      uni.showModal({
        title: '选择接种日期',
        editable: true,
        placeholderText: '请输入日期（YYYY-MM-DD）',
        success: (res) => {
          if (res.confirm && res.content) {
            this.vaccineForm.vaccinatedAt = new Date(res.content).getTime();
            this.showVaccineReminder();
          }
        }
      });
    },
    showVaccineReminder() {
      uni.showModal({
        title: '设置下次提醒',
        editable: true,
        placeholderText: '请输入下次接种日期（YYYY-MM-DD）',
        confirmText: '设置',
        cancelText: '跳过',
        success: (res) => {
          if (res.confirm && res.content) {
            this.vaccineForm.nextReminder = new Date(res.content).getTime();
            this.vaccineForm.remindEnabled = true;
          }
          this.saveVaccineRecord();
        }
      });
    },
    async saveVaccineRecord() {
      try {
        const res = await uniCloud.callFunction({
          name: 'vaccine-record',
          data: {
            action: 'create',
            petId: this.petId,
            ...this.vaccineForm
          }
        });
        
        if (res.result.code === 201) {
          uni.showToast({ title: '添加成功', icon: 'success' });
          this.loadVaccineRecords();
        } else {
          uni.showToast({ title: res.result.message, icon: 'none' });
        }
      } catch (e) {
        console.error('保存疫苗记录失败:', e);
        uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' });
      }
    },
    async deleteVaccineRecord(recordId) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条疫苗记录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const delRes = await uniCloud.callFunction({
                name: 'vaccine-record',
                data: { action: 'delete', recordId }
              });
              
              if (delRes.result.code === 200) {
                uni.showToast({ title: '删除成功', icon: 'success' });
                this.loadVaccineRecords();
              } else {
                uni.showToast({ title: delRes.result.message, icon: 'none' });
              }
            } catch (e) {
              console.error('删除疫苗记录失败:', e);
              uni.showToast({ title: '删除失败，请稍后重试', icon: 'none' });
            }
          }
        }
      });
    },
    showHealthForm() {
      uni.showActionSheet({
        itemList: ['呕吐/拉稀', '食欲不振', '精神不佳', '皮肤问题', '其他症状'],
        success: (res) => {
          const symptoms = ['呕吐/拉稀', '食欲不振', '精神不佳', '皮肤问题', '其他症状'];
          this.healthSymptom = symptoms[res.tapIndex];
          this.showHealthDetailForm();
        }
      });
    },
    showHealthDetailForm() {
      this.healthObservation = '';
      this.healthFiles = [];
      uni.showModal({
        title: '添加健康记录',
        editable: true,
        placeholderText: `请描述${this.healthSymptom}的情况`,
        success: (res) => {
          if (res.confirm && res.content) {
            this.healthObservation = res.content;
            this.showHealthUploadForm();
          }
        }
      });
    },
    showHealthUploadForm() {
      uni.showActionSheet({
        itemList: ['添加照片', '完成提交'],
        success: async (res) => {
          if (res.tapIndex === 0) {
            try {
              const chooseRes = await uni.chooseImage({
                count: 3,
                sourceType: ['album', 'camera']
              });
              
              this.healthFiles = chooseRes.tempFilePaths.map(path => ({
                type: 'image',
                path: path
              }));
              
              this.showHealthUploadForm();
            } catch (e) {
              console.error('选择照片失败:', e);
            }
          } else if (res.tapIndex === 1) {
            this.saveHealthRecord();
          }
        }
      });
    },
    async saveHealthRecord() {
      try {
        let attachmentUrls = [];
        if (this.healthFiles.length > 0) {
          const uploadPromises = this.healthFiles.map((file, index) => {
            const fileName = `health/${this.petId}/${Date.now()}_${index}.jpg`;
            return uniCloud.uploadFile({
              cloudPath: fileName,
              filePath: file.path
            }).then(res => res.fileID);
          });
          
          attachmentUrls = await Promise.all(uploadPromises);
        }
        
        const res = await uniCloud.callFunction({
          name: 'health-record',
          data: {
            action: 'create',
            petId: this.petId,
            symptom: this.healthSymptom,
            observation: this.healthObservation,
            status: 'observing',
            recordedAt: Date.now(),
            attachments: attachmentUrls
          }
        });
        
        if (res.result.code === 201) {
          uni.showToast({ title: '添加成功', icon: 'success' });
          this.loadHealthRecords();
        } else {
          uni.showToast({ title: res.result.message, icon: 'none' });
        }
      } catch (e) {
        console.error('保存健康记录失败:', e);
        uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' });
      }
    },
    async deleteHealthRecord(recordId) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条健康记录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const res = await uniCloud.callFunction({
                name: 'health-record',
                data: { action: 'delete', recordId }
              });
              
              if (res.result.code === 200) {
                uni.showToast({ title: '删除成功', icon: 'success' });
                this.loadHealthRecords();
              } else {
                uni.showToast({ title: res.result.message, icon: 'none' });
              }
            } catch (e) {
              console.error('删除健康记录失败:', e);
              uni.showToast({ title: '删除失败，请稍后重试', icon: 'none' });
            }
          }
        }
      });
    },
    showFoodForm() {
      this.foodForm = {
        brand: '',
        product: '',
        type: 'dry',
        startDate: Date.now(),
        endDate: 0
      };
      uni.showModal({
        title: '添加粮食记录',
        editable: true,
        placeholderText: '请输入品牌/型号（如：渴望 鸡肉味）',
        success: (res) => {
          if (res.confirm && res.content) {
            const parts = res.content.split(' ');
            this.foodForm.brand = parts[0] || '';
            this.foodForm.product = parts[1] || '';
            this.showFoodTypeSelect();
          }
        }
      });
    },
    showFoodTypeSelect() {
      uni.showActionSheet({
        itemList: ['干粮', '湿粮', '零食'],
        success: (res) => {
          this.foodForm.type = ['dry', 'wet', 'snack'][res.tapIndex];
          this.showFoodDate();
        }
      });
    },
    showFoodDate() {
      uni.showModal({
        title: '选择开始日期',
        editable: true,
        placeholderText: '请输入日期（YYYY-MM-DD）',
        success: (res) => {
          if (res.confirm && res.content) {
            this.foodForm.startDate = new Date(res.content).getTime();
            this.saveFoodRecord();
          }
        }
      });
    },
    async saveFoodRecord() {
      try {
        const res = await uniCloud.callFunction({
          name: 'food-record',
          data: {
            action: 'create',
            petId: this.petId,
            ...this.foodForm
          }
        });
        
        if (res.result.code === 201) {
          uni.showToast({ title: '添加成功', icon: 'success' });
          this.loadFoodRecords();
        } else {
          uni.showToast({ title: res.result.message, icon: 'none' });
        }
      } catch (e) {
        console.error('保存粮食记录失败:', e);
        uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' });
      }
    },
    async deleteFoodRecord(recordId) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条粮食记录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const delRes = await uniCloud.callFunction({
                name: 'food-record',
                data: { action: 'delete', recordId }
              });
              
              if (delRes.result.code === 200) {
                uni.showToast({ title: '删除成功', icon: 'success' });
                this.loadFoodRecords();
              } else {
                uni.showToast({ title: delRes.result.message, icon: 'none' });
              }
            } catch (e) {
              console.error('删除粮食记录失败:', e);
              uni.showToast({ title: '删除失败，请稍后重试', icon: 'none' });
            }
          }
        }
      });
    },
    getTabName(tab) {
      const names = {
        health: '健康状况',
        food: '粮食记录',
        vaccine: '疫苗记录',
        deworming: '驱虫记录'
      };
      return names[tab] || '';
    }
  }
}
</script>

<style>
.container {
  padding: 16px;
  min-height: 100vh;
  background: #f8fafc;
}

/* 宠物头部卡片 */
.pet-header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 15px rgba(102, 126, 234, 0.3);
  position: relative;
}

.pet-header-card .avatar-wrapper {
  flex-shrink: 0;
}

.pet-header-card .avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.pet-header-card .pet-info {
  flex: 1;
  margin-left: 16px;
  color: #ffffff;
}

.pet-header-card .pet-info .pet-name {
  display: block;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.pet-header-card .pet-info .pet-breed {
  display: block;
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.pet-header-card .pet-info .pet-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  opacity: 0.8;
}

.pet-header-card .pet-info .pet-meta .dot {
  opacity: 0.6;
}

.pet-header-card .edit-btn {
  font-size: 24px;
  color: #ffffff;
  padding: 8px;
  opacity: 0.8;
}

.pet-header-card .edit-btn:active {
  opacity: 1;
}

/* 可滚动 Tab 栏 */
.tab-scroll {
  white-space: nowrap;
  margin-bottom: 16px;
}

.tabs {
  display: flex;
  gap: 8px;
  padding: 4px;
}

.tab {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  background: #ffffff;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab:active {
  transform: scale(0.95);
}

.tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

/* 内容区域 */
.content {
  padding-bottom: 80px;
}

/* 卡片标题 */
.card-title {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 16px;
}

/* 信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-label {
  color: #64748b;
  font-size: 14px;
  min-width: 80px;
}

.info-value {
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
}

/* 记录列表 */
.record-list {
  margin-top: 16px;
}

.record-item {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.record-item:active {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.record-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.record-type {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.record-brand,
.record-note {
  font-size: 14px;
  color: #64748b;
}

.record-value {
  font-size: 20px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.record-date {
  font-size: 12px;
  color: #94a3b8;
}

.record-next {
  font-size: 12px;
  color: #fa709a;
  font-weight: 500;
}

.record-status {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 9999px;
  display: inline-block;
  width: fit-content;
}

.record-attachments {
  font-size: 12px;
  color: #64748b;
}

.record-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.record-actions .record-date {
  font-size: 12px;
  color: #94a3b8;
}

.record-actions .delete-btn {
  font-size: 18px;
  padding: 8px;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.record-actions .delete-btn:active {
  opacity: 1;
}

/* 提醒卡片 */
.reminder-card,
.current-food-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  color: #ffffff;
  box-shadow: 0 4px 8px rgba(240, 147, 251, 0.3);
}

.reminder-card .reminder-title,
.current-food-card .current-food-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  opacity: 0.9;
}

.reminder-card .reminder-date,
.current-food-card .current-food-brand {
  display: block;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.current-food-card .current-food-date {
  display: block;
  font-size: 12px;
  opacity: 0.8;
}

/* 图表卡片 */
.chart-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state .empty-emoji {
  font-size: 60px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state .empty-text {
  font-size: 16px;
  color: #94a3b8;
}

/* 占位 */
.placeholder {
  text-align: center;
  padding: 80px 20px;
}

.placeholder-emoji {
  font-size: 60px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
}

/* 全宽按钮 */
.btn-block {
  width: 100%;
  margin-bottom: 16px;
}

/* 卡片 */
.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
