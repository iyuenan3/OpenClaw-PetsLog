/**
 * 获取宠物列表云函数
 * @param {Object} params
 * @param {string} params.familyId - 家庭 ID
 */
exports.main = async (event, context) => {
  const { familyId } = event;
  
  if (!familyId) {
    return {
      code: 400,
      message: 'familyId 不能为空'
    };
  }
  
  const db = uniCloud.database();
  const petsCollection = db.collection('pets');
  
  // 查询该家庭的所有宠物
  const petsResult = await petsCollection.where({
    familyId: familyId
  }).orderBy('createdAt', 'desc').get();
  
  // 计算年龄
  const pets = petsResult.data.map(pet => {
    const age = calculateAge(pet.birthday);
    return {
      ...pet,
      age: age
    };
  });
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      pets: pets
    }
  };
};

/**
 * 计算年龄
 * @param {number} birthday - 出生日期时间戳
 */
function calculateAge(birthday) {
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
}
