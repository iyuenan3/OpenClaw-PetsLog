<template>
  <view class="uploader">
    <view class="file-list" v-if="files.length > 0">
      <view class="file-item" v-for="(file, index) in files" :key="index">
        <image class="file-preview" v-if="file.type === 'image'" :src="file.url" mode="aspectFill" />
        <view class="file-preview file-other" v-else>
          <text class="file-icon">{{ getFileIcon(file.type) }}</text>
          <text class="file-name">{{ file.name }}</text>
        </view>
        <view class="file-delete" @click="removeFile(index)">✕</view>
      </view>
    </view>

    <view class="upload-btn" @click="chooseFile">
      <text class="upload-icon">📷</text>
      <text class="upload-text">{{ files.length > 0 ? '继续添加' : '上传图片/文件' }}</text>
      <text class="upload-hint">支持图片、PDF、视频</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    maxCount: {
      type: Number,
      default: 9
    },
    fileType: {
      type: String,
      default: 'all' // image, video, file, all
    }
  },
  data() {
    return {
      files: []
    }
  },
  methods: {
    async chooseFile() {
      try {
        let res;
        
        if (this.fileType === 'image' || this.fileType === 'all') {
          res = await uni.chooseImage({
            count: this.maxCount - this.files.length,
            sourceType: ['album', 'camera']
          });
          
          const newFiles = res.tempFilePaths.map(path => ({
            type: 'image',
            url: path,
            path: path
          }));
          
          this.files = [...this.files, ...newFiles];
          this.$emit('change', this.files);
        } else if (this.fileType === 'file') {
          // H5 端使用文件选择
          // #ifdef H5
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.pdf,.doc,.docx,.xls,.xlsx';
          input.multiple = true;
          input.onchange = (e) => {
            const newFiles = Array.from(e.target.files).map(file => ({
              type: 'file',
              name: file.name,
              file: file
            }));
            this.files = [...this.files, ...newFiles];
            this.$emit('change', this.files);
          };
          input.click();
          // #endif
          
          // #ifdef MP-WEIXIN
          uni.showToast({ title: '小程序端暂不支持文件选择', icon: 'none' });
          // #endif
        }
      } catch (e) {
        console.error('选择文件失败:', e);
        uni.showToast({ title: '选择失败，请重试', icon: 'none' });
      }
    },
    removeFile(index) {
      this.files.splice(index, 1);
      this.$emit('change', this.files);
    },
    getFileIcon(type) {
      const icons = {
        'pdf': '📄',
        'doc': '📝',
        'docx': '📝',
        'xls': '📊',
        'xlsx': '📊',
        'video': '🎥'
      };
      return icons[type] || '📁';
    },
    async uploadFiles(cloudPath) {
      const uploadedFiles = [];
      
      for (let i = 0; i < this.files.length; i++) {
        const file = this.files[i];
        
        if (file.type === 'image') {
          // 上传图片
          const fileName = `${cloudPath}/${Date.now()}_${i}.jpg`;
          const res = await uniCloud.uploadFile({
            cloudPath: fileName,
            filePath: file.path
          });
          
          uploadedFiles.push({
            type: 'image',
            url: res.fileID,
            name: fileName
          });
        } else if (file.type === 'file' && file.file) {
          // 上传文件（H5）
          const fileName = `${cloudPath}/${Date.now()}_${file.name}`;
          const res = await uniCloud.uploadFile({
            cloudPath: fileName,
            filePath: file.file
          });
          
          uploadedFiles.push({
            type: 'file',
            url: res.fileID,
            name: fileName
          });
        }
      }
      
      return uploadedFiles;
    },
    clearFiles() {
      this.files = [];
      this.$emit('change', this.files);
    }
  }
}
</script>

<style lang="scss" scoped>
.uploader {
  .file-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 15px;
    
    .file-item {
      position: relative;
      width: 100px;
      height: 100px;
      border-radius: 8px;
      overflow: hidden;
      background: #f5f5f5;
      
      .file-preview {
        width: 100%;
        height: 100%;
        
        &.file-other {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #e3f2fd;
          
          .file-icon {
            font-size: 30px;
            margin-bottom: 5px;
          }
          
          .file-name {
            font-size: 10px;
            color: #666;
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 80%;
          }
        }
      }
      
      .file-delete {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 20px;
        height: 20px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      }
    }
  }
  
  .upload-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px 20px;
    background: #fff;
    border: 2px dashed #ddd;
    border-radius: 12px;
    
    .upload-icon {
      font-size: 40px;
      margin-bottom: 10px;
    }
    
    .upload-text {
      font-size: 16px;
      color: #666;
      margin-bottom: 5px;
    }
    
    .upload-hint {
      font-size: 12px;
      color: #999;
    }
    
    &:active {
      background: #f5f5f5;
    }
  }
}
</style>
