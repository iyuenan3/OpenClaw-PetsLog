/**
 * 体重记录云函数
 * @param {string} params.action - 操作类型：list/create/update/delete
 * @param {string} params.petId - 宠物 ID
 * @param {number} params.weight - 体重 (kg)
 * @param {number} params.recordedAt - 记录时间
 * @param {string} params.note - 备注
 * @param {string} params.recordId - 记录 ID（update/delete 时需要）
 */
exports.main = async (event, context) => {
  const { action, petId, weight, recordedAt, note, recordId } = event;
  
  const db = uniCloud.database();
  const collection = db.collection('weight_records');
  
  switch (action) {
    case 'list': {
      if (!petId) {
        return { code: 400, message: 'petId 为必填项' };
      }
      const result = await collection.where({ petId })
        .orderBy('recordedAt', 'desc').get();
      return { code: 200, message: '获取成功', data: { records: result.data } };
    }
    
    case 'create': {
      if (!petId || !weight) {
        return { code: 400, message: 'petId 和 weight 为必填项' };
      }
      const result = await collection.add({
        petId,
        weight,
        recordedAt: recordedAt || Date.now(),
        note: note || ''
      });
      return { code: 201, message: '创建成功', data: { recordId: result.id } };
    }
    
    case 'update': {
      if (!recordId) {
        return { code: 400, message: 'recordId 为必填项' };
      }
      const updateData = {};
      if (weight !== undefined) updateData.weight = weight;
      if (note !== undefined) updateData.note = note;
      await collection.doc(recordId).update(updateData);
      return { code: 200, message: '更新成功' };
    }
    
    case 'delete': {
      if (!recordId) {
        return { code: 400, message: 'recordId 为必填项' };
      }
      await collection.doc(recordId).remove();
      return { code: 200, message: '删除成功' };
    }
    
    default:
      return { code: 400, message: '无效的 action' };
  }
};
