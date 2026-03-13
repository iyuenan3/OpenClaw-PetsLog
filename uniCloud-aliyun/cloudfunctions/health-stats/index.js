'use strict';

/**
 * 健康状况统计云函数
 * 返回各种健康状况的宠物数量分布
 */
exports.main = async (event, context) => {
  const { familyId } = event;
  
  // 参数验证
  if (!familyId) {
    return {
      code: 400,
      message: 'familyId is required',
      data: null
    };
  }
  
  try {
    const db = uniCloud.database();
    
    // 获取家庭下所有宠物
    const petsRes = await db.collection('pets')
      .where({
        familyId: familyId,
        deleted: false
      })
      .field({
        _id: true,
        healthStatus: true
      })
      .get();
    
    // 统计健康状况分布
    const healthStats = {};
    const totalPets = petsRes.data.length;
    
    petsRes.data.forEach(pet => {
      const status = pet.healthStatus || 'healthy';
      healthStats[status] = (healthStats[status] || 0) + 1;
    });
    
    // 转换为数组格式，方便前端使用
    const distribution = Object.entries(healthStats).map(([status, count]) => ({
      status,
      count,
      percentage: totalPets > 0 ? Math.round((count / totalPets) * 100) : 0
    }));
    
    // 添加疫苗和驱虫到期统计
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    // 疫苗到期统计
    const vaccineDueRes = await db.collection('vaccine_records')
      .where({
        familyId: familyId,
        dueDate: db.command.lt(thirtyDaysLater.getTime()),
        completed: false,
        deleted: false
      })
      .count();
    
    // 驱虫到期统计
    const dewormingDueRes = await db.collection('deworming_records')
      .where({
        familyId: familyId,
        dueDate: db.command.lt(thirtyDaysLater.getTime()),
        completed: false,
        deleted: false
      })
      .count();
    
    return {
      code: 200,
      message: 'success',
      data: {
        totalPets,
        healthDistribution: distribution,
        vaccineDueCount: vaccineDueRes.total,
        dewormingDueCount: dewormingDueRes.total,
        updatedAt: Date.now()
      }
    };
    
  } catch (error) {
    console.error('Health stats error:', error);
    return {
      code: 500,
      message: 'Failed to get health statistics',
      data: null,
      error: error.message
    };
  }
};
