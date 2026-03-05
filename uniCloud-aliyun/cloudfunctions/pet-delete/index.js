/**
 * 删除宠物云函数
 * @param {Object} params
 * @param {string} params.petId - 宠物 ID
 */
exports.main = async (event, context) => {
  const { petId } = event;
  
  if (!petId) {
    return {
      code: 400,
      message: 'petId 为必填项'
    };
  }
  
  const db = uniCloud.database();
  
  // 删除宠物
  await db.collection('pets').doc(petId).remove();
  
  // 删除相关记录
  await db.collection('weight_records').where({ petId }).remove();
  await db.collection('deworming_records').where({ petId }).remove();
  await db.collection('vaccine_records').where({ petId }).remove();
  await db.collection('health_records').where({ petId }).remove();
  await db.collection('food_records').where({ petId }).remove();
  
  return {
    code: 200,
    message: '删除成功'
  };
};
