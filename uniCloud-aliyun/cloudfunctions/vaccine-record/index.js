/**
 * 疫苗记录云函数
 * @param {string} params.action - 操作类型：list/create/update/delete
 * @param {string} params.petId - 宠物 ID
 * @param {string} params.name - 疫苗名称
 * @param {string} params.type - 疫苗类型
 * @param {string} params.brand - 品牌
 * @param {string} params.product - 产品型号
 * @param {number} params.vaccinatedAt - 接种日期
 * @param {number} params.nextReminder - 下次提醒日期
 * @param {boolean} params.remindEnabled - 是否启用提醒
 * @param {string} params.recordId - 记录 ID
 */
exports.main = async (event, context) => {
  const { action, petId, name, type, brand, product, vaccinatedAt, nextReminder, remindEnabled, recordId } = event;
  
  const db = uniCloud.database();
  const collection = db.collection('vaccine_records');
  
  switch (action) {
    case 'list': {
      if (!petId) return { code: 400, message: 'petId 为必填项' };
      const result = await collection.where({ petId }).orderBy('vaccinatedAt', 'desc').get();
      return { code: 200, message: '获取成功', data: { records: result.data } };
    }
    
    case 'create': {
      if (!petId || !name || !vaccinatedAt) {
        return { code: 400, message: 'petId、name、vaccinatedAt 为必填项' };
      }
      const result = await collection.add({
        petId, name, type: type || '', brand: brand || '', product: product || '',
        vaccinatedAt, nextReminder: nextReminder || 0,
        remindEnabled: remindEnabled || false
      });
      return { code: 201, message: '创建成功', data: { recordId: result.id } };
    }
    
    case 'update': {
      if (!recordId) return { code: 400, message: 'recordId 为必填项' };
      const updateData = {};
      ['name', 'type', 'brand', 'product', 'vaccinatedAt', 'nextReminder', 'remindEnabled'].forEach(key => {
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
