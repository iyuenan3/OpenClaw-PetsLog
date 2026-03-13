/**
 * 删除宠物云函数
 * @param {Object} params
 * @param {string} params.petId - 宠物 ID
 * @param {string} params.token - 用户 token
 */
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'petslog-secret-key-change-in-production';

exports.main = async (event, context) => {
  const { petId, token } = event;
  
  if (!petId) {
    return {
      code: 400,
      message: 'petId 为必填项'
    };
  }
  
  // 验证用户身份
  if (!token) {
    return {
      code: 401,
      message: 'Token 不存在'
    };
  }
  
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return {
      code: 401,
      message: 'Token 无效或已过期'
    };
  }
  
  const db = uniCloud.database();
  
  // 验证宠物所有权
  const petResult = await db.collection('pets').doc(petId).get();
  if (petResult.data.length === 0) {
    return {
      code: 404,
      message: '宠物不存在'
    };
  }
  
  const pet = petResult.data[0];
  
  // 验证用户是否属于该家庭
  const userResult = await db.collection('users').doc(decoded.userId).get();
  if (userResult.data.length === 0 || userResult.data[0].familyId !== pet.familyId) {
    return {
      code: 403,
      message: '无权删除该宠物'
    };
  }
  
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
