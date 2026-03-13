/**
 * 批量创建记录云函数
 * 支持批量创建喂食、健康、体重等记录
 * @param {Object} event
 * @param {string} event.type - 记录类型：food, health, weight, vaccine, deworming, medication
 * @param {Array} event.records - 记录数组，每条记录包含具体字段
 * @param {string} event.pet_id - 宠物 ID（可选，如果记录中未指定）
 */
exports.main = async (event, context) => {
  const { type, records, pet_id } = event;
  
  // 获取当前登录用户信息
  const uid = context.auth?.uid;
  
  if (!uid) {
    return {
      code: 401,
      message: '未登录'
    };
  }
  
  if (!type || !records || !Array.isArray(records)) {
    return {
      code: 400,
      message: '参数错误：需要 type 和 records 数组'
    };
  }
  
  if (records.length === 0) {
    return {
      code: 400,
      message: '记录数组不能为空'
    };
  }
  
  if (records.length > 100) {
    return {
      code: 400,
      message: '单次最多创建 100 条记录'
    };
  }
  
  // 记录类型与集合名映射
  const collectionMap = {
    food: 'food_records',
    health: 'health_records',
    weight: 'weight_records',
    vaccine: 'vaccine_records',
    deworming: 'deworming_records',
    medication: 'medication_records'
  };
  
  const collectionName = collectionMap[type];
  
  if (!collectionName) {
    return {
      code: 400,
      message: '不支持的记录类型：' + type
    };
  }
  
  const db = uniCloud.database();
  const collection = db.collection(collectionName);
  
  try {
    // 验证用户权限（获取用户的家庭 ID）
    const userResult = await db.collection('users').doc(uid).get();
    if (!userResult.data || userResult.data.length === 0) {
      return {
        code: 404,
        message: '用户不存在'
      };
    }
    
    const user = userResult.data[0];
    const userPetIds = user.pet_ids || [];
    
    // 准备批量插入的数据
    const insertData = records.map(record => {
      const recordPetId = record.pet_id || pet_id;
      
      // 验证宠物是否属于该用户
      if (recordPetId && !userPetIds.includes(recordPetId)) {
        throw new Error('宠物 ID ' + recordPetId + ' 不属于您的账户');
      }
      
      return {
        ...record,
        pet_id: recordPetId,
        user_id: uid,
        familyId: user.familyId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    });
    
    // 批量插入
    const insertResult = await collection.insert(insertData);
    
    return {
      code: 200,
      message: '批量创建成功',
      data: {
        inserted_count: insertResult.ids.length,
        ids: insertResult.ids
      }
    };
    
  } catch (error) {
    console.error('batch-create-record error:', error);
    return {
      code: 500,
      message: '服务器错误：' + error.message
    };
  }
};
