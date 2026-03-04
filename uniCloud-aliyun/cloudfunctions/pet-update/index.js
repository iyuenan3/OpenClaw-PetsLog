/**
 * 更新宠物云函数
 * @param {Object} params
 * @param {string} params.petId - 宠物 ID
 * @param {Object} params.data - 要更新的数据
 */
exports.main = async (event, context) => {
  const { petId, data } = event;
  
  if (!petId || !data) {
    return {
      code: 400,
      message: 'petId 和 data 为必填项'
    };
  }
  
  const db = uniCloud.database();
  const petsCollection = db.collection('pets');
  
  // 更新数据（添加更新时间）
  const updateData = {
    ...data,
    updatedAt: Date.now()
  };
  
  // 执行更新
  await petsCollection.doc(petId).update(updateData);
  
  // 获取更新后的数据
  const result = await petsCollection.doc(petId).get();
  
  if (result.data.length === 0) {
    return {
      code: 404,
      message: '宠物不存在'
    };
  }
  
  return {
    code: 200,
    message: '更新成功',
    data: result.data[0]
  };
};
