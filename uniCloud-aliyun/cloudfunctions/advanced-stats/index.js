'use strict';

exports.main = async (event, context) => {
  const { familyId, petId, startDate, endDate, category } = event;
  
  if (!familyId) {
    return { code: 400, message: 'familyId is required', data: null };
  }
  
  try {
    const db = uniCloud.database();
    const query = { familyId, deleted: false };
    
    if (petId) query.petId = petId;
    if (startDate) query.paidAt = db.command.gte(new Date(startDate).getTime());
    if (endDate) query.paidAt = db.command.lte(new Date(endDate).getTime());
    if (category) query.category = category;
    
    const expensesRes = await db.collection('food_records').where(query).field({ amount: true, category: true }).get();
    
    const categoryStats = {};
    expensesRes.data.forEach(record => {
      const cat = record.category || 'other';
      categoryStats[cat] = (categoryStats[cat] || 0) + (record.amount || 0);
    });
    
    const petsRes = await db.collection('pets').where({ familyId, deleted: false }).field({ _id: true, name: true }).get();
    
    return {
      code: 200,
      message: 'success',
      data: {
        categoryStats,
        totalExpenses: Object.values(categoryStats).reduce((a, b) => a + b, 0),
        pets: petsRes.data,
        filter: { petId, startDate, endDate, category }
      }
    };
  } catch (error) {
    console.error('Advanced stats error:', error);
    return { code: 500, message: 'Failed', data: null, error: error.message };
  }
};
