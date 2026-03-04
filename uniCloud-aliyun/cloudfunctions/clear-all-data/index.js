/**
 * 清空所有测试数据云函数
 * 使用前请确认！会删除所有集合的数据
 */
exports.main = async (event, context) => {
  const db = uniCloud.database();
  
  try {
    // 删除所有集合的数据
    const collections = [
      'users',
      'families', 
      'pets',
      'weight_records',
      'deworming_records',
      'vaccine_records',
      'health_records',
      'food_records'
    ];
    
    const results = {};
    
    for (const collection of collections) {
      try {
        const res = await db.collection(collection).where({}).remove();
        results[collection] = {
          success: true,
          deleted: res.affectedDocs || 0
        };
        console.log(`✅ 清空 ${collection}: ${res.affectedDocs} 条记录`);
      } catch (e) {
        results[collection] = {
          success: false,
          error: e.message
        };
        console.error(`❌ 清空 ${collection} 失败:`, e.message);
      }
    }
    
    return {
      code: 200,
      message: '清空完成',
      data: results
    };
  } catch (e) {
    console.error('清空数据失败:', e);
    return {
      code: 500,
      message: '清空失败：' + e.message
    };
  }
};
