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
  const petsCollection = db.collection('pets');
  
  // 删除宠物
  await petsCollection.doc(petId).remove();
  
  return {
    code: 200,
    message: '删除成功'
  };
};
