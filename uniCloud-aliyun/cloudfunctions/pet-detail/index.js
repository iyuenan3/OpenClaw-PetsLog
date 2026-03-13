/**
 * 宠物详情云函数
 * 根据 petId 直接查询单个宠物详情，避免获取全部宠物再过滤
 * 
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
  
  const db = uniCloud.database();
  
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
  
  // 查询宠物详情
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
      message: '无权访问该宠物数据'
    };
  }
  
  // 并行查询相关记录（性能优化）
  const [weightRecords, vaccineRecords, dewormingRecords, healthRecords, foodRecords, medicationRecords] = await Promise.all([
    db.collection('weight_records').where({ petId }).orderBy('recordedAt', 'desc').limit(10).get(),
    db.collection('vaccine_records').where({ petId }).orderBy('vaccinatedAt', 'desc').limit(5).get(),
    db.collection('deworming_records').where({ petId }).orderBy('usedAt', 'desc').limit(5).get(),
    db.collection('health_records').where({ petId }).orderBy('recordedAt', 'desc').limit(5).get(),
    db.collection('food_records').where({ petId }).orderBy('startDate', 'desc').limit(5).get(),
    db.collection('medication_records').where({ petId }).orderBy('createdAt', 'desc').limit(5).get()
  ]);
  
  // 计算统计数据
  const stats = {
    weightCount: weightRecords.data.length,
    vaccineCount: vaccineRecords.data.length,
    dewormingCount: dewormingRecords.data.length,
    healthCount: healthRecords.data.length,
    foodCount: foodRecords.data.length,
    medicationCount: medicationRecords.data.length,
    lastWeight: weightRecords.data.length > 0 ? weightRecords.data[0].weight : null,
    lastWeightDate: weightRecords.data.length > 0 ? weightRecords.data[0].recordedAt : null
  };
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      pet,
      records: {
        weights: weightRecords.data,
        vaccines: vaccineRecords.data,
        dewormings: dewormingRecords.data,
        health: healthRecords.data,
        food: foodRecords.data,
        medications: medicationRecords.data
      },
      stats
    }
  };
};
