/**
 * 创建宠物云函数
 * @param {Object} params
 * @param {string} params.familyId - 家庭 ID
 * @param {string} params.name - 宠物名字
 * @param {string} params.species - 物种（cat/dog）
 * @param {string} params.breed - 品种
 * @param {string} params.gender - 性别（male/female）
 * @param {number} params.birthday - 出生日期（时间戳）
 * @param {string} params.color - 毛色
 * @param {string} params.avatar - 头像 URL
 * @param {string} params.notes - 备注
 */
exports.main = async (event, context) => {
  const { 
    familyId, name, species, breed, gender, 
    birthday, color, avatar, notes 
  } = event;
  
  // 必填字段校验
  if (!familyId || !name || !species) {
    return {
      code: 400,
      message: 'familyId、名字和物种为必填项'
    };
  }
  
  const db = uniCloud.database();
  const petsCollection = db.collection('pets');
  
  // 创建宠物记录
  const petData = {
    familyId,
    name,
    species,
    breed: breed || '',
    gender: gender || '',
    birthday: birthday || 0,
    neutered: false,
    neuterDate: 0,
    neuterHospital: '',
    color: color || '',
    avatar: avatar || '',
    notes: notes || '',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  const result = await petsCollection.add(petData);
  
  return {
    code: 201,
    message: '创建成功',
    data: {
      petId: result.id,
      ...petData
    }
  };
};
