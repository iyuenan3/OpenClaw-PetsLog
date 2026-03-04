<template>
  <view class="container">
    <view class="header">
      <text class="title">✏️ 编辑宠物信息</text>
    </view>

    <view class="form">
      <view class="form-group">
        <text class="label">头像</text>
        <view class="avatar-uploader" @click="chooseAvatar">
          <image class="avatar-preview" v-if="form.avatar" :src="form.avatar" mode="aspectFill" />
          <text class="avatar-placeholder" v-else>📷</text>
          <text class="avatar-hint">{{ form.avatar ? '点击更换' : '点击上传' }}</text>
        </view>
      </view>

      <view class="form-group">
        <text class="label">名字 *</text>
        <input class="input" v-model="form.name" placeholder="请输入宠物名字" />
      </view>

      <view class="form-group">
        <text class="label">物种 *</text>
        <view class="radio-group">
          <view class="radio-item" :class="{ active: form.species === 'cat' }" @click="form.species = 'cat'">
            <text>🐱 猫咪</text>
          </view>
          <view class="radio-item" :class="{ active: form.species === 'dog' }" @click="form.species = 'dog'">
            <text>🐶 狗狗</text>
          </view>
        </view>
      </view>

      <view class="form-group">
        <text class="label">品种</text>
        <input class="input" v-model="form.breed" placeholder="例如：英短、美短、金毛" />
      </view>

      <view class="form-group">
        <text class="label">性别</text>
        <view class="radio-group">
          <view class="radio-item" :class="{ active: form.gender === 'male' }" @click="form.gender = 'male'">
            <text>♂ 公</text>
          </view>
          <view class="radio-item" :class="{ active: form.gender === 'female' }" @click="form.gender = 'female'">
            <text>♀ 母</text>
          </view>
        </view>
      </view>

      <view class="form-group">
        <text class="label">出生日期</text>
        <picker mode="date" :value="form.birthdayStr" @change="onBirthdayChange">
          <view class="picker">
            <text>{{ form.birthdayStr || '请选择日期' }}</text>
          </view>
        </picker>
      </view>

      <view class="form-group">
        <text class="label">毛色</text>
        <input class="input" v-model="form.color" placeholder="例如：金色、黑色、白色" />
      </view>

      <view class="form-group">
        <view class="checkbox-group" @click="form.neutered = !form.neutered">
          <text class="checkbox" :class="{ checked: form.neutered }">{{ form.neutered ? '☑️' : '☐' }}</text>
          <text class="checkbox-label">已绝育</text>
        </view>
      </view>

      <view class="form-group" v-if="form.neutered">
        <text class="label">绝育日期</text>
        <picker mode="date" :value="form.neuterDateStr" @change="onNeuterDateChange">
          <view class="picker">
            <text>{{ form.neuterDateStr || '请选择日期' }}</text>
          </view>
        </picker>
      </view>

      <view class="form-group" v-if="form.neutered">
        <text class="label">绝育医院</text>
        <input class="input" v-model="form.neuterHospital" placeholder="手术医院名称" />
      </view>

      <view class="form-group">
        <text class="label">备注</text>
        <textarea class="textarea" v-model="form.notes" placeholder="性格、习惯、疾病史等" />
      </view>
    </view>

    <view class="buttons">
      <button class="btn-submit" @click="handleSubmit" :disabled="submitting">
        {{ submitting ? '保存中...' : '保存修改' }}
      </button>
      <button class="btn-cancel" @click="handleCancel">取消</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      petId: '',
      form: {
        name: '',
        species: 'cat',
        breed: '',
        gender: 'unknown',
        birthday: 0,
        birthdayStr: '',
        color: '',
        neutered: false,
        neuterDate: 0,
        neuterDateStr: '',
        neuterHospital: '',
        notes: '',
        avatar: ''
      },
      submitting: false
    }
  },
  onLoad(options) {
    if (options.petId) {
      this.petId = options.petId;
      this.loadPetData();
    }
  },
  methods: {
    async loadPetData() {
      // TODO: 调用云函数获取宠物详情
      // 暂时使用测试数据
      this.form = {
        name: '小葵',
        species: 'cat',
        breed: '西伯利亚猫',
        gender: 'female',
        birthday: Date.now() - 6 * 365 * 24 * 60 * 60 * 1000,
        birthdayStr: '2019-04-21',
        color: '金色',
        neutered: true,
        neuterDate: Date.now() - 365 * 24 * 60 * 60 * 1000,
        neuterDateStr: '2025-01-01',
        neuterHospital: '某某宠物医院',
        notes: '焦虑性舔毛',
        avatar: ''
      };
    },
    async chooseAvatar() {
      try {
        const res = await uni.chooseImage({
          count: 1,
          sourceType: ['album', 'camera']
        });
        
        this.form.avatar = res.tempFilePaths[0];
      } catch (e) {
        console.error('选择头像失败:', e);
        uni.showToast({ title: '选择失败，请重试', icon: 'none' });
      }
    },
    onBirthdayChange(e) {
      this.form.birthdayStr = e.detail.value;
      this.form.birthday = new Date(e.detail.value).getTime();
    },
    onNeuterDateChange(e) {
      this.form.neuterDateStr = e.detail.value;
      this.form.neuterDate = new Date(e.detail.value).getTime();
    },
    async handleSubmit() {
      if (!this.form.name) {
        uni.showToast({ title: '请输入宠物名字', icon: 'none' });
        return;
      }

      this.submitting = true;
      try {
        // 上传头像
        let avatarUrl = this.form.avatar;
        if (this.form.avatar && this.form.avatar.includes('temp')) {
          const uploadRes = await uniCloud.uploadFile({
            cloudPath: `avatars/${this.petId}_${Date.now()}.jpg`,
            filePath: this.form.avatar
          });
          avatarUrl = uploadRes.fileID;
        }

        // 调用云函数更新
        const res = await uniCloud.callFunction({
          name: 'pet-update',
          data: {
            petId: this.petId,
            data: {
              name: this.form.name,
              species: this.form.species,
              breed: this.form.breed,
              gender: this.form.gender,
              birthday: this.form.birthday,
              color: this.form.color,
              neutered: this.form.neutered,
              neuterDate: this.form.neuterDate,
              neuterHospital: this.form.neuterHospital,
              notes: this.form.notes,
              avatar: avatarUrl
            }
          }
        });
        
        this.submitting = false;
        
        if (res.result.code === 200) {
          uni.showToast({ title: '保存成功', icon: 'success' });
          setTimeout(() => {
            uni.navigateBack();
          }, 1000);
        } else {
          uni.showToast({ title: res.result.message, icon: 'none' });
        }
      } catch (e) {
        this.submitting = false;
        console.error('保存失败:', e);
        uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' });
      }
    },
    handleCancel() {
      uni.navigateBack();
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

.form {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
  
  .label {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;
    font-weight: bold;
  }
  
  .input, .textarea, .picker {
    width: 100%;
    padding: 12px 15px;
    background: #f5f5f5;
    border-radius: 8px;
    font-size: 16px;
    box-sizing: border-box;
  }
  
  .textarea {
    height: 100px;
    resize: none;
  }
  
  .avatar-uploader {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px;
    background: #f5f5f5;
    border-radius: 8px;
    
    .avatar-preview {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin-bottom: 10px;
    }
    
    .avatar-placeholder {
      font-size: 50px;
      margin-bottom: 10px;
    }
    
    .avatar-hint {
      font-size: 14px;
      color: #999;
    }
  }
  
  .radio-group {
    display: flex;
    gap: 10px;
    
    .radio-item {
      flex: 1;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
      text-align: center;
      border: 2px solid transparent;
      
      &.active {
        background: rgba(102, 126, 234, 0.1);
        border-color: #667eea;
        color: #667eea;
      }
    }
  }
  
  .checkbox-group {
    display: flex;
    align-items: center;
    padding: 10px 0;
    
    .checkbox {
      font-size: 24px;
      margin-right: 10px;
      color: #ddd;
      
      &.checked {
        color: #667eea;
      }
    }
    
    .checkbox-label {
      font-size: 16px;
      color: #333;
    }
  }
}

.buttons {
  .btn-submit {
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 14px;
    font-size: 16px;
    margin-bottom: 15px;
    
    &:disabled {
      opacity: 0.6;
    }
  }
  
  .btn-cancel {
    width: 100%;
    background: #fff;
    color: #666;
    border: 2px solid #ddd;
    border-radius: 10px;
    padding: 14px;
    font-size: 16px;
  }
}
</style>
