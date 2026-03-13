'use strict';

/**
 * 综合统计云函数
 * 返回所有统计数据
 */
exports.main = async (event, context) => {
  const { familyId } = event;
  
  if (!familyId) {
    return {
      code: 400,
      message: 'familyId is required',
      data: null
    };
  }
  
  try {
    const db = uniCloud.database();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(now.getDate() + 30);
    
    // 1. 宠物总数
    const petsRes = await db.collection('pets')
      .where({ familyId, deleted: false })
      .field({ _id: true, healthStatus: true })
      .get();
    
    // 2. 今日提醒数
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));
    
    const remindersRes = await db.collection('reminders')
      .where({
        familyId,
        remindTime: db.command.gte(todayStart.getTime()),
        remindTime: db.command.lte(todayEnd.getTime()),
        completed: false,
        deleted: false
      })
      .count();
    
    // 3. 本月开销
    const expensesRes = await db.collection('food_records')
      .where({
        familyId,
        paidAt: db.command.gte(startOfMonth.getTime()),
        deleted: false
      })
      .field({ amount: true })
      .get();
    
    const monthExpenses = expensesRes.data.reduce((sum, record) => sum + (record.amount || 0), 0);
    
    // 4. 健康状况分布
    const healthStats = {};
    petsRes.data.forEach(pet => {
      const status = pet.healthStatus || 'healthy';
      healthStats[status] = (healthStats[status] || 0) + 1;
    });
    
    const healthDistribution = Object.entries(healthStats).map(([status, count]) => ({
      status,
      count,
      percentage: petsRes.data.length > 0 ? Math.round((count / petsRes.data.length) * 100) : 0
    }));
    
    // 5. 疫苗到期统计
    const vaccineDueRes = await db.collection('vaccine_records')
      .where({
        familyId,
        dueDate: db.command.lt(thirtyDaysLater.getTime()),
        completed: false,
        deleted: false
      })
      .count();
    
    // 6. 驱虫到期统计
    const dewormingDueRes = await db.collection('deworming_records')
      .where({
        familyId,
        dueDate: db.command.lt(thirtyDaysLater.getTime()),
        completed: false,
        deleted: false
      })
      .count();
    
    // 7. 体重记录（用于趋势图）
    const weightRecordsRes = await db.collection('weight_records')
      .where({ familyId, deleted: false })
      .orderBy('recordDate', 'asc')
      .limit(100)
      .field({ petId: true, weight: true, recordDate: true })
      .get();
    
    // 按宠物分组
    const weightRecords = {};
    weightRecordsRes.data.forEach(record => {
      if (!weightRecords[record.petId]) {
        weightRecords[record.petId] = [];
      }
      weightRecords[record.petId].push({
        petId: record.petId,
        weight: record.weight,
        date: record.recordDate
      });
    });
    
    return {
      code: 200,
      message: 'success',
      data: {
        petCount: petsRes.data.length,
        todayReminders: remindersRes.total,
        monthExpenses,
        healthDistribution,
        vaccineDueCount: vaccineDueRes.total,
        dewormingDueCount: dewormingDueRes.total,
        weightRecords: Object.values(weightRecords),
        updatedAt: Date.now()
      }
    };
    
  } catch (error) {
    console.error('Statistics error:', error);
    return {
      code: 500,
      message: 'Failed to get statistics',
      data: null,
      error: error.message
    };
  }
};
