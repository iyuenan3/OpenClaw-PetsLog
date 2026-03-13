/**
 * 体重记录云函数
 * @param {string} params.action - 操作类型：list/create/update/delete
 * @param {string} params.petId - 宠物 ID
 * @param {number} params.weight - 体重 (kg)
 * @param {number} params.recordedAt - 记录时间
 * @param {string} params.note - 备注
 * @param {string} params.recordId - 记录 ID（update/delete 时需要）
 * @param {string} params.token - 用户 token
 */
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'petslog-secret-key-change-in-production';

/**
 * 验证 token 并返回用户信息
 */
async function verifyUser(token, db) {
  if (!token) {
    return { valid: false, message: 'Token 不存在' };
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userResult = await db.collection('users').doc(decoded.userId).get();
    
    if (userResult.data.length === 0) {
      return { valid: false, message: '用户不存在' };
    }
    
    return { valid: true, user: userResult.data[0], decoded };
  } catch (error) {
    return { valid: false, message: 'Token 无效或已过期' };
  }
}

exports.main = async (event, context) => {
  const { action, petId, weight, recordedAt, note, recordId, token } = event;
  
  const db = uniCloud.database();
  
  // 验证用户身份
  const authResult = await verifyUser(token, db);
  if (!authResult.valid) {
    return { code: 401, message: authResult.message };
  }
  
  const { user } = authResult;
  const collection = db.collection('weight_records');
  
  switch (action) {
    case 'list': {
      if (!petId) {
        return { code: 400, message: 'petId 为必填项' };
      }
      // 验证宠物所有权
      const petResult = await db.collection('pets').doc(petId).get();
      if (petResult.data.length === 0 || petResult.data[0].familyId !== user.familyId) {
        return { code: 403, message: '无权访问该宠物数据' };
      }
      
      const result = await collection.where({ petId })
        .orderBy('recordedAt', 'desc').get();
      return { code: 200, message: '获取成功', data: { records: result.data } };
    }
    
    case 'create': {
      if (!petId || !weight) {
        return { code: 400, message: 'petId 和 weight 为必填项' };
      }
      // 验证宠物所有权
      const petResult = await db.collection('pets').doc(petId).get();
      if (petResult.data.length === 0 || petResult.data[0].familyId !== user.familyId) {
        return { code: 403, message: '无权添加该宠物记录' };
      }
      
      const newRecord = {
        petId,
        weight,
        recordedAt: recordedAt || Date.now(),
        note: note || ''
      };
      const result = await collection.add(newRecord);
      
      // 返回完整记录
      return { 
        code: 201, 
        message: '创建成功', 
        data: { 
          recordId: result.id,
          record: { _id: result.id, ...newRecord }
        } 
      };
    }
    
    case 'update': {
      if (!recordId) {
        return { code: 400, message: 'recordId 为必填项' };
      }
      // 验证记录所有权
      const recordResult = await collection.doc(recordId).get();
      if (recordResult.data.length === 0) {
        return { code: 404, message: '记录不存在' };
      }
      const petResult = await db.collection('pets').doc(recordResult.data[0].petId).get();
      if (petResult.data.length === 0 || petResult.data[0].familyId !== user.familyId) {
        return { code: 403, message: '无权更新该记录' };
      }
      
      const updateData = {};
      if (weight !== undefined) updateData.weight = weight;
      if (note !== undefined) updateData.note = note;
      await collection.doc(recordId).update(updateData);
      
      // 返回完整记录
      const updatedRecord = await collection.doc(recordId).get();
      return { code: 200, message: '更新成功', data: { record: updatedRecord.data[0] } };
    }
    
    case 'delete': {
      if (!recordId) {
        return { code: 400, message: 'recordId 为必填项' };
      }
      // 验证记录所有权
      const recordResult = await collection.doc(recordId).get();
      if (recordResult.data.length === 0) {
        return { code: 404, message: '记录不存在' };
      }
      const petResult = await db.collection('pets').doc(recordResult.data[0].petId).get();
      if (petResult.data.length === 0 || petResult.data[0].familyId !== user.familyId) {
        return { code: 403, message: '无权删除该记录' };
      }
      
      await collection.doc(recordId).remove();
      return { code: 200, message: '删除成功' };
    }
    
    default:
      return { code: 400, message: '无效的 action' };
  }
};
