/**
 * 粮食记录云函数
 * @param {string} params.action - 操作类型：list/create/update/delete
 * @param {string} params.petId - 宠物 ID
 * @param {string} params.brand - 品牌
 * @param {string} params.product - 产品型号
 * @param {string} params.type - 粮食类型
 * @param {number} params.startDate - 开始日期
 * @param {number} params.endDate - 结束日期
 * @param {string} params.note - 备注
 * @param {string} params.recordId - 记录 ID
 */
exports.main = async (event, context) => {
  const { action, petId, brand, product, type, startDate, endDate, note, recordId } = event;
  
  const db = uniCloud.database();
  const collection = db.collection('food_records');
  
  switch (action) {
    case 'list': {
      if (!petId) return { code: 400, message: 'petId 为必填项' };
      const result = await collection.where({ petId }).orderBy('startDate', 'desc').get();
      return { code: 200, message: '获取成功', data: { records: result.data } };
    }
    
    case 'create': {
      if (!petId || !brand) {
        return { code: 400, message: 'petId、brand 为必填项' };
      }
      const result = await collection.add({
        petId, brand, product: product || '', type: type || '',
        startDate: startDate || Date.now(),
        endDate: endDate || 0,
        note: note || ''
      });
      return { code: 201, message: '创建成功', data: { recordId: result.id } };
    }
    
    case 'update': {
      if (!recordId) return { code: 400, message: 'recordId 为必填项' };
      const updateData = {};
      ['brand', 'product', 'type', 'startDate', 'endDate', 'note'].forEach(key => {
        if (event[key] !== undefined) updateData[key] = event[key];
      });
      await collection.doc(recordId).update(updateData);
      return { code: 200, message: '更新成功' };
    }
    
    case 'delete': {
      if (!recordId) return { code: 400, message: 'recordId 为必填项' };
      await collection.doc(recordId).remove();
      return { code: 200, message: '删除成功' };
    }
    
    default:
      return { code: 400, message: '无效的 action' };
  }
};
