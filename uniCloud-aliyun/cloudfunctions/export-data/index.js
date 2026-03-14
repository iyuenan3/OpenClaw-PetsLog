/**
 * 导出数据云函数
 * 支持导出 Excel/PDF 格式
 * @param {Object} event
 * @param {string} event.data_type - 数据类型：all, food, health, weight, vaccine, deworming, medication
 * @param {number} event.start_date - 开始日期时间戳
 * @param {number} event.end_date - 结束日期时间戳
 * @param {string} event.format - 导出格式：excel, pdf
 * @param {Array} event.pet_ids - 宠物 ID 列表（可选）
 */
exports.main = async (event, context) => {
  const { data_type, start_date, end_date, format, pet_ids } = event;
  
  // 获取当前登录用户信息
  const uid = context.auth?.uid;
  
  if (!uid) {
    return {
      code: 401,
      message: '未登录'
    };
  }
  
  if (!data_type || !format) {
    return {
      code: 400,
      message: '参数错误：需要 data_type 和 format'
    };
  }
  
  const db = uniCloud.database();
  
  try {
    // 1. 获取用户信息
    const userResult = await db.collection('users').doc(uid).get();
    
    if (!userResult.data || userResult.data.length === 0) {
      return {
        code: 404,
        message: '用户不存在'
      };
    }
    
    const user = userResult.data[0];
    const userPetIds = user.pet_ids || [];
    
    // 2. 确定要导出的宠物
    const exportPetIds = pet_ids && pet_ids.length > 0 ? pet_ids : userPetIds;
    
    if (exportPetIds.length === 0) {
      return {
        code: 400,
        message: '没有可导出的宠物数据'
      };
    }
    
    // 3. 收集数据
    const exportData = {};
    
    // 数据获取函数
    async function fetchCollection(collectionName, petIdField) {
      const query = db.collection(collectionName).where({
        [petIdField]: { $in: exportPetIds }
      });
      
      if (start_date) {
        // 根据不同集合的日期字段查询
        const dateField = collectionName === 'medication_records' ? 'startDate' : 
                         collectionName === 'food_records' ? 'startDate' : 'recordedAt';
        query.gte(dateField, start_date);
      }
      
      if (end_date) {
        const dateField = collectionName === 'medication_records' ? 'startDate' : 
                         collectionName === 'food_records' ? 'startDate' : 'recordedAt';
        query.lte(dateField, end_date);
      }
      
      const result = await query.get();
      return result.data || [];
    }
    
    // 根据类型获取数据
    if (data_type === 'all' || data_type === 'food') {
      exportData.food = await fetchCollection('food_records', 'petId');
    }
    
    if (data_type === 'all' || data_type === 'health') {
      exportData.health = await fetchCollection('health_records', 'petId');
    }
    
    if (data_type === 'all' || data_type === 'weight') {
      exportData.weight = await fetchCollection('weight_records', 'petId');
    }
    
    if (data_type === 'all' || data_type === 'vaccine') {
      exportData.vaccine = await fetchCollection('vaccine_records', 'petId');
    }
    
    if (data_type === 'all' || data_type === 'deworming') {
      exportData.deworming = await fetchCollection('deworming_records', 'petId');
    }
    
    if (data_type === 'all' || data_type === 'medication') {
      exportData.medication = await fetchCollection('medication_records', 'petId');
    }
    
    // 4. 获取宠物信息用于显示
    const petsResult = await db.collection('pets')
      .where({ _id: { $in: exportPetIds } })
      .get();
    exportData.pets = petsResult.data || [];
    
    // 5. 生成文件（这里返回数据，实际文件生成在前端或使用云存储）
    // 由于 uniCloud 限制，这里返回数据让前端处理或使用 OSS
    
    const fileName = `petslog_export_${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    
    // 创建备份记录
    const backupRecord = {
      user_id: uid,
      file_name: fileName,
      file_url: '', // 待上传后填充
      file_size: 0,
      type: 'export',
      data_type: data_type,
      format: format,
      start_date: start_date || null,
      end_date: end_date || null,
      status: 'completed',
      created_at: Date.now(),
      expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 天后过期
    };
    
    const insertResult = await db.collection('backups').add(backupRecord);
    
    return {
      code: 200,
      message: '导出成功',
      data: {
        export_data: exportData,
        file_name: fileName,
        format: format,
        backup_id: insertResult.id,
        record_count: {
          food: exportData.food?.length || 0,
          health: exportData.health?.length || 0,
          weight: exportData.weight?.length || 0,
          vaccine: exportData.vaccine?.length || 0,
          deworming: exportData.deworming?.length || 0,
          medication: exportData.medication?.length || 0
        }
      }
    };
    
  } catch (error) {
    console.error('export-data error:', error);
    return {
      code: 500,
      message: '服务器错误：' + error.message
    };
  }
};
