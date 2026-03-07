/**
 * 用药记录云函数
 * @param {string} event.action - 操作类型：list/create/update/delete
 * @param {string} event.petId - 宠物 ID
 * @param {string} event.medicineName - 药品名称
 * @param {string} event.dosage - 剂量
 * @param {string} event.frequency - 频率
 * @param {string} event.recordId - 记录 ID
 */
exports.main = async (event, context) => {
  const { action, petId, medicineName, dosage, frequency, recordId } = event;
  
  const db = uniCloud.database();
  const collection = db.collection('medication_records');
  
  switch (action) {
    case 'list': {
      const query = event.petId ? { petId } : { familyId: event.familyId };
      const result = await collection.where(query).orderBy('createdAt', 'desc').get();
      return { 
        code: 200, 
        message: '获取成功', 
        data: { records: result.data } 
      };
    }
    
    case 'create': {
      if (!petId || !medicineName || !dosage || !frequency) {
        return { code: 400, message: '必填项不完整' };
      }
      
      // 计算下次用药时间
      const now = Date.now();
      const nextDoseTime = calculateNextDoseTime(frequency, now);
      
      const result = await collection.add({
        familyId: event.familyId,
        petId,
        petName: event.petName || '',
        medicineName,
        dosage,
        frequency,
        frequencyCustom: event.frequencyCustom || '',
        startDate: event.startDate || now,
        endDate: event.endDate || null,
        duration: event.duration || 0,
        purpose: event.purpose || '',
        instructions: event.instructions || '',
        prescriptionHospital: event.prescriptionHospital || '',
        prescriptionDoctor: event.prescriptionDoctor || '',
        status: 'ongoing',
        remindEnabled: event.remindEnabled || false,
        remindTimes: event.remindTimes || [],
        nextDoseTime,
        notes: event.notes || '',
        attachments: event.attachments || [],
        createdAt: now,
        updatedAt: now
      });
      
      return { code: 201, message: '创建成功', data: { recordId: result.id } };
    }
    
    case 'update': {
      if (!recordId) {
        return { code: 400, message: 'recordId 为必填项' };
      }
      
      const updateData = { updatedAt: Date.now() };
      const allowedFields = [
        'dosage', 'frequency', 'frequencyCustom', 'endDate', 'duration',
        'purpose', 'instructions', 'status', 'remindEnabled', 'remindTimes',
        'notes', 'attachments'
      ];
      
      allowedFields.forEach(key => {
        if (event[key] !== undefined) {
          updateData[key] = event[key];
        }
      });
      
      // 如果频率改变，重新计算下次用药时间
      if (event.frequency) {
        updateData.nextDoseTime = calculateNextDoseTime(event.frequency, Date.now());
      }
      
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
    
    case 'record_dose': {
      // 记录一次用药
      if (!recordId) {
        return { code: 400, message: 'recordId 为必填项' };
      }
      
      const now = Date.now();
      const record = await collection.doc(recordId).get();
      if (record.data.length === 0) {
        return { code: 404, message: '记录不存在' };
      }
      
      const freq = record.data[0].frequency;
      const nextDoseTime = calculateNextDoseTime(freq, now);
      
      await collection.doc(recordId).update({
        lastDoseTime: now,
        nextDoseTime,
        updatedAt: now
      });
      
      return { code: 200, message: '已记录' };
    }
    
    default:
      return { code: 400, message: '无效的 action' };
  }
};

/**
 * 计算下次用药时间
 */
function calculateNextDoseTime(frequency, fromTime) {
  const hour = 1000 * 60 * 60;
  const day = 24 * hour;
  
  switch (frequency) {
    case 'once_daily':
      return fromTime + day;
    case 'twice_daily':
      return fromTime + 12 * hour;
    case 'three_times_daily':
      return fromTime + 8 * hour;
    case 'as_needed':
      return 0; // 按需，不计算
    default:
      return fromTime + day;
  }
}
