/**
 * 健康记录云函数
 * @param {string} params.action - 操作类型：list/create/update/delete
 * @param {string} params.petId - 宠物 ID
 * @param {string} params.symptom - 症状
 * @param {string} params.observation - 观察记录
 * @param {string} params.status - 状态：improving/worsening/stable
 * @param {number} params.recordedAt - 记录时间
 * @param {array} params.attachments - 附件 URL 数组
 * @param {string} params.recordId - 记录 ID
 */
exports.main = async (event, context) => {
  const { action, petId, symptom, observation, status, recordedAt, attachments, recordId } = event;
  
  const db = uniCloud.database();
  const collection = db.collection('health_records');
  
  switch (action) {
    case 'list': {
      if (!petId) return { code: 400, message: 'petId 为必填项' };
      const result = await collection.where({ petId }).orderBy('recordedAt', 'desc').get();
      return { code: 200, message: '获取成功', data: { records: result.data } };
    }
    
    case 'create': {
      if (!petId || !symptom) {
        return { code: 400, message: 'petId、symptom 为必填项' };
      }
      const result = await collection.add({
        petId, symptom, observation: observation || '',
        status: status || 'stable',
        recordedAt: recordedAt || Date.now(),
        attachments: attachments || []
      });
      return { code: 201, message: '创建成功', data: { recordId: result.id } };
    }
    
    case 'update': {
      if (!recordId) return { code: 400, message: 'recordId 为必填项' };
      const updateData = {};
      ['symptom', 'observation', 'status', 'recordedAt', 'attachments'].forEach(key => {
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
