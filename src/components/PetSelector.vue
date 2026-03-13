<template>
  <view class="pet-selector">
    <picker :range="pets" range-key="name" @change="onSelect">
      <view class="selector-trigger">
        <text class="selected-text">{{ selectedPet ? selectedPet.name : '全部宠物' }}</text>
        <text class="arrow">▼</text>
      </view>
    </picker>
  </view>
</template>

<script>
export default {
  name: 'PetSelector',
  props: {
    familyId: String,
    value: String
  },
  data() {
    return {
      pets: [],
      selectedPet: null
    };
  },
  created() {
    this.loadPets();
  },
  methods: {
    async loadPets() {
      try {
        const res = await uniCloud.callFunction({
          name: 'advanced-stats',
          data: { familyId: this.familyId }
        });
        
        if (res.result.code === 200) {
          this.pets = [{ _id: '', name: '全部宠物' }, ...res.result.data.pets];
          
          if (this.value) {
            this.selectedPet = this.pets.find(p => p._id === this.value);
          }
        }
      } catch (error) {
        console.error('Load pets error:', error);
      }
    },
    
    onSelect(e) {
      const index = e.detail.value;
      this.selectedPet = this.pets[index];
      this.$emit('input', this.selectedPet._id);
      this.$emit('change', this.selectedPet);
    }
  }
};
</script>

<style lang="scss" scoped>
.pet-selector {
  padding: 20rpx;
  
  .selector-trigger {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 30rpx;
    background: white;
    border-radius: 12rpx;
    border: 2rpx solid #e8e8e8;
    
    .selected-text {
      font-size: 28rpx;
      color: #333;
    }
    
    .arrow {
      font-size: 24rpx;
      color: #999;
    }
  }
}
</style>
