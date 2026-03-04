<template>
  <view class="container">
    <view class="pet-header">
      <image class="avatar" :src="petInfo.avatar || '/static/logo.png'" mode="aspectFill" />
      <view class="info">
        <text class="name">{{ petInfo.name }}</text>
        <text class="breed">{{ petInfo.breed || '未知品种' }}</text>
        <text class="age">{{ petInfo.age || '' }}</text>
      </view>
      <view class="edit-btn" @click="editPet">✏️</view>
    </view>

    <scroll-view scroll-x class="tab-scroll">
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

    <view class="content">
      <!-- 概览 -->
      <view v-if="currentTab === 'overview'" class="overview">
        <text class="section-title">基本信息</text>
        <view class="info-item"><text>品种：</text><text>{{ petInfo.breed || '-' }}</text></view>
        <view class="info-item"><text>性别：</text><text>{{ petInfo.gender === 'male' ? '公' : petInfo.gender === 'female' ? '母' : '-' }}</text></view>
        <view class="info-item"><text>年龄：</text><text>{{ petInfo.age || '-' }}</text></view>
        <view class="info-item"><text>毛色：</text><text>{{ petInfo.color || '-' }}</text></view>
        <view class="info-item"><text>绝育：</text><text>{{ petInfo.neutered ? '已绝育' : '未绝育' }}</text></view>
        <view class="info-item" v-if="petInfo.neutered"><text>绝育日期：</text><text>{{ formatDate(petInfo.neuterDate) }}</text></view>
        <view class="info-item" v-if="petInfo.notes"><text>备注：</text><text>{{ petInfo.notes }}</text></view>
      </view>
      
      <!-- 体重 -->
      <view v-else-if="currentTab === 'weight'" class="tab-content">
        <text class="section-title">体重记录</text>
        
        <!-- 体重曲线图 -->
        <weight-chart :records="weightRecords" :height="280" v-if="weightRecords.length > 0" />
        
        <button class="btn-add" @click="addRecord('weight')">+ 添加体重记录</button>
        
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
          <text class="empty-text" v-if="weightRecords.length === 0">暂无记录</text>
        </view>
      </view>

      <!-- 驱虫 -->
      <view v-else-if="currentTab === 'deworming'" class="tab-content">
        <text class="section-title">驱虫记录</text>
        <button class="btn-add" @click="showDewormingForm">+ 添加驱虫记录</button>
        
        <view class="reminder-box" v-if="nextDewormingDate">
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
          <text class="empty-text" v-if="dewormingRecords.length === 0">暂无记录</text>
        </view>
      </view>

      <!-- 疫苗 -->
      <view v-else-if="currentTab === 'vaccine'" class="tab-content">
        <text class="section-title">疫苗记录</text>
        <button class="btn-add" @click="showVaccineForm">+ 添加疫苗记录</button>
        
        <view class="reminder-box" v-if="nextVaccineDate">
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
          <text class="empty-text" v-if="vaccineRecords.length === 0">暂无记录</text>
        </view>
      </view>

      <!-- 健康 -->
      <view v-else-if="currentTab === 'health'" class="tab-content">
        <text class="section-title">健康状况</text>
        <button class="btn-add" @click="showHealthForm">+ 添加健康记录</button>
        
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
          <text class="empty-text" v-if="healthRecords.length === 0">暂无记录</text>
        </view>
      </view>

      <!-- 粮食 -->
      <view v-else-if="currentTab === 'food'" class="tab-content">
        <text class="section-title">粮食记录</text>
        <button class="btn-add" @click="showFoodForm">+ 添加粮食记录</button>
        
        <view class="current-food" v-if="currentFood">
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
          <text class="empty-text" v-if="foodRecords.length === 0">暂无记录</text>
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
      <button class="btn-delete" @click="deletePet">删除宠物</button>
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
          data: {
            familyId: user.familyId
          }
        });
        
        if (res.result.code === 200) {
          const pets = res.result.data.pets || [];
          const pet = pets.find(p => p._id === this.petId);
          
          if (pet) {
            this.petInfo = {
              ...pet,
              age: this.calculateAge(pet.birthday)
            };
          }
        }
      } catch (e) {
        console.error('加载宠物详情失败:', e);
      }
    },
    calculateAge(birthday) {
      if (!birthday) return '';
      const birthDate = new Date(birthday);
      const now = new Date();
      const years = now.getFullYear() - birthDate.getFullYear();
      const months = now.getMonth() - birthDate.getMonth();
      let ageText = '';
      if (years > 0) {
        ageText += years + '岁';
      }
      if (months > 0 || years === 0) {
        ageText += months + '个月';
      }
      return ageText;
    },
    async loadWeightRecords() {
      if (!this.petId) return;
      
      try {
        const res = await uniCloud.callFunction({
          name: 'weight-record',
          data: {
            action: 'list',
            petId: this.petId
          }
        });
        if (res.result.code === 200) {
          this.weightRecords = res.result.data.records || [];
        }
      } catch (e) {
        console.error('加载体重记录失败:', e);
      }
    },
    async addRecord(type) {
      if (type === 'weight') {
        const weightValue = await this.showWeightInput();
        if (weightValue) {
          await this.saveWeightRecord(weightValue);
        }
      } else if (type === 'deworming') {
        this.showDewormingForm();
      } else if (type === 'vaccine') {
        this.showVaccineForm();
      } else if (type === 'health') {
        this.showHealthForm();
      } else if (type === 'food') {
        this.showFoodForm();
      }
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
          this.showDewormingDateSelect();
        }
      });
    },
    showDewormingDateSelect() {
      uni.showModal({
        title: '选择使用日期',
        editable: true,
        placeholderText: '请输入日期（YYYY-MM-DD）或留空使用今天',
        success: (res) => {
          if (res.confirm) {
            if (res.content) {
              this.dewormingForm.usedAt = new Date(res.content).getTime();
            }
            this.showDewormingReminder();
          }
        }
      });
    },
    showDewormingReminder() {
      uni.showModal({
        title: '设置下次提醒',
        content: '是否需要设置下次驱虫提醒？',
        success: (res) => {
          if (res.confirm) {
            this.dewormingForm.remindEnabled = true;
            // 默认 3 个月后
            this.dewormingForm.nextReminder = Date.now() + 90 * 24 * 60 * 60 * 1000;
            this.saveDewormingRecord();
          } else {
            this.dewormingForm.remindEnabled = false;
            this.saveDewormingRecord();
          }
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
            type: this.dewormingForm.type,
            brand: this.dewormingForm.brand,
            product: this.dewormingForm.product,
            usedAt: this.dewormingForm.usedAt,
            nextReminder: this.dewormingForm.nextReminder,
            remindEnabled: this.dewormingForm.remindEnabled
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
    async loadDewormingRecords() {
      if (!this.petId) return;
      try {
        const res = await uniCloud.callFunction({
          name: 'deworming-record',
          data: {
            action: 'list',
            petId: this.petId
          }
        });
        if (res.result.code === 200) {
          this.dewormingRecords = res.result.data.records || [];
          // 计算下次驱虫日期
          const upcoming = this.dewormingRecords
            .filter(r => r.remindEnabled && r.nextReminder)
            .sort((a, b) => a.nextReminder - b.nextReminder)[0];
          if (upcoming) {
            this.nextDewormingDate = this.formatDate(upcoming.nextReminder);
          }
        }
      } catch (e) {
        console.error('加载驱虫记录失败:', e);
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
                data: {
                  action: 'delete',
                  recordId: recordId
                }
              });
              
              if (delRes.result.code === 200) {
                uni.showToast({ title: '删除成功', icon: 'success' });
                this.loadDewormingRecords();
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
    showVaccineForm() {
      this.vaccineForm = {
        name: '',
        type: '',
        brand: '',
        product: '',
        vaccinatedAt: Date.now(),
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
          const types = ['猫三联', '狗三联', '狂犬疫苗', '其他'];
          this.vaccineForm.type = types[res.tapIndex];
          uni.showModal({
            title: '输入品牌/型号',
            editable: true,
            placeholderText: '请输入品牌或型号',
            success: (res) => {
              if (res.confirm && res.content) {
                const parts = res.content.split(' ');
                this.vaccineForm.brand = parts[0] || '';
                this.vaccineForm.product = parts[1] || '';
                this.showVaccineDateSelect();
              }
            }
          });
        }
      });
    },
    showVaccineDateSelect() {
      uni.showModal({
        title: '选择接种日期',
        editable: true,
        placeholderText: '请输入日期（YYYY-MM-DD）或留空使用今天',
        success: (res) => {
          if (res.confirm) {
            if (res.content) {
              this.vaccineForm.vaccinatedAt = new Date(res.content).getTime();
            }
            this.showVaccineReminder();
          }
        }
      });
    },
    showVaccineReminder() {
      uni.showModal({
        title: '设置下次提醒',
        content: '是否需要设置下次疫苗接种提醒？',
        success: (res) => {
          if (res.confirm) {
            this.vaccineForm.remindEnabled = true;
            // 默认 1 年后
            this.vaccineForm.nextReminder = Date.now() + 365 * 24 * 60 * 60 * 1000;
            this.saveVaccineRecord();
          } else {
            this.vaccineForm.remindEnabled = false;
            this.saveVaccineRecord();
          }
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
            name: this.vaccineForm.name,
            type: this.vaccineForm.type,
            brand: this.vaccineForm.brand,
            product: this.vaccineForm.product,
            vaccinatedAt: this.vaccineForm.vaccinatedAt,
            nextReminder: this.vaccineForm.nextReminder,
            remindEnabled: this.vaccineForm.remindEnabled
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
                data: {
                  action: 'delete',
                  recordId: recordId
                }
              });
              
              if (delRes.result.code === 200) {
                uni.showToast({ title: '删除成功', icon: 'success' });
                this.loadVaccineRecords();
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
    showHealthForm() {
      // 使用 actionSheet 选择记录类型
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
      // 显示媒体上传组件（简化版，实际应该用弹窗或新页面）
      uni.showActionSheet({
        itemList: ['添加照片', '完成提交'],
        success: async (res) => {
          if (res.tapIndex === 0) {
            // 选择照片
            try {
              const chooseRes = await uni.chooseImage({
                count: 3,
                sourceType: ['album', 'camera']
              });
              
              this.healthFiles = chooseRes.tempFilePaths.map(path => ({
                type: 'image',
                path: path
              }));
              
              // 再次显示选项
              this.showHealthUploadForm();
            } catch (e) {
              console.error('选择照片失败:', e);
            }
          } else if (res.tapIndex === 1) {
            // 提交记录
            await this.saveHealthRecord();
          }
        }
      });
    },
    async saveHealthRecord() {
      try {
        // 上传文件
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
        
        // 调用云函数
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
          // TODO: 刷新健康记录列表
        } else {
          uni.showToast({ title: res.result.message, icon: 'none' });
        }
      } catch (e) {
        console.error('保存健康记录失败:', e);
        uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' });
      }
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
          const types = ['dry', 'wet', 'snack'];
          this.foodForm.type = types[res.tapIndex];
          this.showFoodDateSelect();
        }
      });
    },
    showFoodDateSelect() {
      uni.showModal({
        title: '选择开始日期',
        editable: true,
        placeholderText: '请输入日期（YYYY-MM-DD）或留空使用今天',
        success: (res) => {
          if (res.confirm) {
            if (res.content) {
              this.foodForm.startDate = new Date(res.content).getTime();
            }
            uni.showModal({
              title: '是否正在吃？',
              content: '当前是否还在吃这个粮食？',
              success: (res) => {
                if (res.confirm) {
                  this.foodForm.endDate = 0; // 正在吃
                } else {
                  this.foodForm.endDate = Date.now(); // 已吃完
                }
                this.saveFoodRecord();
              }
            });
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
            brand: this.foodForm.brand,
            product: this.foodForm.product,
            type: this.foodForm.type,
            startDate: this.foodForm.startDate,
            endDate: this.foodForm.endDate
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
                data: {
                  action: 'delete',
                  recordId: recordId
                }
              });
              
              if (delRes.result.code === 200) {
                uni.showToast({ title: '删除成功', icon: 'success' });
                this.loadFoodRecords();
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
    showWeightInput() {
      return new Promise((resolve) => {
        uni.showModal({
          title: '添加体重记录',
          editable: true,
          placeholderText: '请输入体重 (kg)',
          success: (res) => {
            if (res.confirm && res.content) {
              const weight = parseFloat(res.content);
              if (isNaN(weight) || weight <= 0) {
                uni.showToast({ title: '请输入有效的体重', icon: 'none' });
                resolve(null);
              } else {
                resolve(weight);
              }
            } else {
              resolve(null);
            }
          }
        });
      });
    },
    async saveWeightRecord(weight) {
      try {
        const res = await uniCloud.callFunction({
          name: 'weight-record',
          data: {
            action: 'create',
            petId: this.petId,
            weight: weight,
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
    deletePet() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这只宠物吗？相关记录也会被删除。',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({ title: '删除功能开发中', icon: 'none' });
          }
        }
      });
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
                data: {
                  action: 'delete',
                  recordId: recordId
                }
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
    formatDate(timestamp) {
      if (!timestamp) return '-';
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
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
          // 显示当前粮食
          const current = this.foodRecords.filter(r => !r.endDate || r.endDate === 0)[0];
          if (current) {
            this.currentFood = current;
          }
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
    getTabName(tab) {
      const names = {
        health: '健康状况',
        food: '粮食记录',
        vaccine: '疫苗记录',
        deworming: '驱虫记录'
      };
      return names[tab] || '';
    },
    editPet() {
      uni.navigateTo({
        url: `/pages/edit-pet/edit-pet?petId=${this.petId}`
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 70px;
}

.pet-header {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 20px;
  
  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 40px;
    background: #fff;
    margin-right: 20px;
  }
  
  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .name {
      font-size: 24px;
      font-weight: bold;
      color: #fff;
    }
    
    .breed, .age {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 5px;
    }
  }
  
  .edit-btn {
    font-size: 24px;
    padding: 10px;
    opacity: 0.8;
  }
}

.tab-scroll {
  background: #fff;
  border-bottom: 1px solid #eee;
}

.tabs {
  display: flex;
  white-space: nowrap;
  padding: 0 10px;
  
  .tab {
    display: inline-block;
    padding: 15px 20px;
    font-size: 14px;
    color: #666;
    
    &.active {
      color: #667eea;
      border-bottom: 2px solid #667eea;
    }
  }
}

.content {
  padding: 20px;
  
  .overview {
    .section-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
      display: block;
      color: #333;
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 15px;
      background: #fff;
      border-radius: 8px;
      margin-bottom: 10px;
      color: #666;
    }
  }
  
  .tab-content {
    .section-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
      display: block;
      color: #333;
    }
    
    .btn-add {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 15px;
      font-size: 16px;
    }
    
    .reminder-box {
      background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 15px;
      border-left: 4px solid #ffc107;
      
      .reminder-title {
        display: block;
        font-size: 14px;
        color: #856404;
        margin-bottom: 5px;
      }
      
      .reminder-date {
        display: block;
        font-size: 16px;
        font-weight: bold;
        color: #856404;
      }
    }
    
    .current-food {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 15px;
      border-left: 4px solid #28a745;
      
      .current-food-title {
        display: block;
        font-size: 14px;
        color: #155724;
        margin-bottom: 5px;
      }
      
      .current-food-brand {
        display: block;
        font-size: 16px;
        font-weight: bold;
        color: #155724;
      }
    }
    
    .record-list {
      .record-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: #fff;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        
        .record-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          
          .record-value {
            font-size: 18px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
          }
          
          .record-note {
            font-size: 12px;
            color: #666;
          }
        }
        
        .record-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          
          .record-date {
            font-size: 12px;
            color: #999;
            margin-bottom: 5px;
          }
          
          .delete-btn {
            font-size: 16px;
            padding: 5px;
            opacity: 0.6;
          }
        }
      }
      
      .empty-text {
        text-align: center;
        color: #999;
        padding: 30px;
      }
    }
  }
  
  .placeholder {
    text-align: center;
    padding: 80px 20px;
    color: #999;
    
    .placeholder-emoji {
      font-size: 60px;
      display: block;
      margin-bottom: 15px;
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 20px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  
  .btn-delete {
    width: 100%;
    background: #fff;
    color: #ff4444;
    border: 2px solid #ff4444;
    border-radius: 10px;
    padding: 12px;
    font-size: 16px;
  }
}
</style>
