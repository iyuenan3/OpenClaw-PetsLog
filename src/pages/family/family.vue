<template>
  <view class="container">
    <view class="header">
      <text class="title">👨‍👩‍👧‍👦 家庭管理</text>
      <text class="subtitle">共享宠物数据，共同照顾</text>
    </view>

    <!-- 家庭信息卡片 -->
    <view class="family-card">
      <view class="family-info">
        <text class="family-name">{{ familyInfo.name || '我的家庭' }}</text>
        <text class="family-members">{{ familyInfo.memberCount }} 位成员 · {{ familyInfo.petCount }} 只宠物</text>
      </view>
      <view class="family-actions">
        <text class="action-btn" @click="editFamily">✏️</text>
      </view>
    </view>

    <!-- 成员列表 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">家庭成员</text>
        <text class="add-btn" @click="inviteMember">+ 邀请成员</text>
      </view>

      <view class="member-list">
        <view class="member-item" v-for="(member, index) in members" :key="index">
          <view class="member-avatar">{{ member.avatar || '👤' }}</view>
          <view class="member-info">
            <text class="member-name">{{ member.name }}</text>
            <text class="member-role">{{ member.role === 'admin' ? '👑 管理员' : '👤 成员' }}</text>
            <text class="member-join">加入时间：{{ member.joinDate }}</text>
          </view>
          <view class="member-actions" v-if="currentUser.role === 'admin' && member.id !== currentUser.id">
            <text class="remove-btn" @click="removeMember(member)">移除</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 邀请链接 -->
    <view class="section" v-if="showInviteLink">
      <view class="section-header">
        <text class="section-title">邀请链接</text>
        <text class="copy-btn" @click="copyInviteLink">复制</text>
      </view>

      <view class="invite-box">
        <text class="invite-link">{{ inviteLink }}</text>
        <text class="invite-desc">复制链接发送给家庭成员，加入后可共享宠物数据</text>
        <text class="invite-expire">有效期：7 天</text>
      </view>
    </view>

    <!-- 权限说明 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">权限说明</text>
      </view>

      <view class="permission-list">
        <view class="permission-item">
          <text class="permission-icon">👑</text>
          <view class="permission-info">
            <text class="permission-title">管理员</text>
            <text class="permission-desc">可以添加/删除成员、修改家庭信息、管理所有宠物</text>
          </view>
        </view>
        <view class="permission-item">
          <text class="permission-icon">👤</text>
          <view class="permission-info">
            <text class="permission-title">普通成员</text>
            <text class="permission-desc">可以查看和添加宠物记录、修改自己添加的数据</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      familyInfo: {
        name: '',
        memberCount: 0,
        petCount: 0
      },
      members: [],
      currentUser: {
        id: '',
        name: '',
        role: 'member'
      },
      showInviteLink: false,
      inviteLink: ''
    }
  },
  onLoad() {
    this.loadFamilyData()
  },
  methods: {
    async loadFamilyData() {
      try {
        const userStr = uni.getStorageSync('user')
        const user = JSON.parse(userStr)
        this.currentUser = {
          id: user._id,
          name: user.username,
          role: user.familyRole || 'member'
        }

        // 加载家庭信息
        const familyRes = await uniCloud.callFunction({
          name: 'family-info',
          data: { familyId: user.familyId }
        })

        if (familyRes.result.code === 200) {
          this.familyInfo = {
            name: familyRes.result.data.name || '我的家庭',
            memberCount: familyRes.result.data.memberCount || 1,
            petCount: familyRes.result.data.petCount || 0
          }

          this.members = familyRes.result.data.members || [{
            id: user._id,
            name: user.username,
            role: this.currentUser.role,
            avatar: '',
            joinDate: '创建者'
          }]
        }
      } catch (e) {
        console.error('加载家庭数据失败:', e)
      }
    },

    editFamily() {
      if (this.currentUser.role !== 'admin') {
        uni.showToast({ title: '只有管理员可以修改', icon: 'none' })
        return
      }

      uni.showModal({
        title: '修改家庭信息',
        editable: true,
        placeholderText: '请输入家庭名称',
        success: (res) => {
          if (res.confirm && res.content) {
            this.updateFamilyName(res.content)
          }
        }
      })
    },

    async updateFamilyName(name) {
      try {
        const userStr = uni.getStorageSync('user')
        const user = JSON.parse(userStr)

        const res = await uniCloud.callFunction({
          name: 'family-update',
          data: {
            familyId: user.familyId,
            name: name
          }
        })

        if (res.result.code === 200) {
          uni.showToast({ title: '修改成功', icon: 'success' })
          this.familyInfo.name = name
        }
      } catch (e) {
        console.error('修改家庭名称失败:', e)
        uni.showToast({ title: '修改失败', icon: 'none' })
      }
    },

    inviteMember() {
      if (this.currentUser.role !== 'admin') {
        uni.showToast({ title: '只有管理员可以邀请成员', icon: 'none' })
        return
      }

      this.showInviteLink = true
      this.inviteLink = `petslog://join?family=${this.generateInviteCode()}`
      
      uni.showToast({ 
        title: '链接已生成', 
        icon: 'success',
        duration: 2000
      })
    },

    generateInviteCode() {
      return Math.random().toString(36).substring(2, 10).toUpperCase()
    },

    copyInviteLink() {
      uni.setClipboardData({
        data: this.inviteLink,
        success: () => {
          uni.showToast({ title: '已复制', icon: 'success' })
        }
      })
    },

    removeMember(member) {
      uni.showModal({
        title: '确认移除',
        content: `确定要移除成员 ${member.name} 吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const userStr = uni.getStorageSync('user')
              const user = JSON.parse(userStr)

              const res = await uniCloud.callFunction({
                name: 'family-remove-member',
                data: {
                  familyId: user.familyId,
                  memberId: member.id
                }
              })

              if (res.result.code === 200) {
                uni.showToast({ title: '已移除', icon: 'success' })
                this.loadFamilyData()
              }
            } catch (e) {
              console.error('移除成员失败:', e)
              uni.showToast({ title: '移除失败', icon: 'none' })
            }
          }
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
  padding-bottom: 20px;
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

.family-card {
  background: #ffffff;
  margin: 16px;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.family-info .family-name {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 4px;
}

.family-info .family-members {
  display: block;
  font-size: 13px;
  color: #64748b;
}

.family-actions .action-btn {
  font-size: 20px;
  padding: 8px;
}

.section {
  background: #ffffff;
  margin: 16px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #1e293b;
}

.add-btn {
  font-size: 14px;
  color: #667eea;
  font-weight: 500;
}

.copy-btn {
  font-size: 14px;
  color: #667eea;
  font-weight: 500;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.member-role {
  font-size: 12px;
  color: #64748b;
}

.member-join {
  font-size: 11px;
  color: #94a3b8;
}

.member-actions .remove-btn {
  font-size: 13px;
  color: #ff0844;
  padding: 6px 12px;
  background: rgba(255, 8, 68, 0.1);
  border-radius: 6px;
}

.invite-box {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.invite-link {
  display: block;
  font-size: 14px;
  color: #667eea;
  font-family: monospace;
  margin-bottom: 8px;
  word-break: break-all;
}

.invite-desc {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  line-height: 1.5;
}

.invite-expire {
  display: block;
  font-size: 11px;
  color: #94a3b8;
}

.permission-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.permission-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.permission-icon {
  font-size: 24px;
}

.permission-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.permission-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.permission-desc {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
}
</style>
