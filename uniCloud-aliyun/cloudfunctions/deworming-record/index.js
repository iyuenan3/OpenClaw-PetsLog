/**
 * 驱虫记录云函数
 * @param {string} params.action - 操作类型：list/create/update/delete
 * @param {string} params.petId - 宠物 ID
 * @param {string} params.type - 类型：internal/external
 * @param {string} params.brand - 品牌
 * @param {string} params.product - 产品型号
 * @param {number} params.usedAt - 使用日期
 * @param {number} params.nextReminder - 下次提醒日期
 * @param {boolean} params.remindEnabled - 是否启用提醒
 * @param {string} params.recordId - 记录 ID
 */
exports.main = async (event, context) => {
  const { action, petId, type, brand, product, usedAt, nextReminder, remindEnabled, recordId } = event;
  
  const db = uniCloud.database();
  const collection = db.collection('deworming_records');
  
  switch (action) {
    case 'list': {
      if (!petId) return { code: 400, message: 'petId 为必填项' };
      const result = await collection.where({ petId }).orderBy('usedAt', 'desc').get();
      return { code: 200, message: '获取成功', data: { records: result.data } };
    }
    
    case 'create': {
      if (!petId || !type || !usedAt) {
        return { code: 400, message: 'petId、type、usedAt 为必填项' };
      }
      const result = await collection.add({
        petId, type, brand: brand || '', product: product || '',
        usedAt, nextReminder: nextReminder || 0,
        remindEnabled: remindEnabled || false
      });
      return { code: 201, message: '创建成功', data: { recordId: result.id } };
    }
    
    case 'update': {
      if (!recordId) return { code: 400, message: 'recordId 为必填项' };
      const updateData = {};
      ['type', 'brand', 'product', 'usedAt', 'nextReminder', 'remindEnabled'].forEach(key => {
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
