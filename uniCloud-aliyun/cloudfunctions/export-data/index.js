/**
 * 导出数据云函数
 * @param {Object} event
 * @param {string} event.familyId - 家庭 ID
 * @param {string} event.petId - 宠物 ID（可选）
 * @param {string} event.format - 导出格式：pdf/excel
 * @param {Object} event.content - 导出内容配置
 */
exports.main = async (event, context) => {
  const { familyId, petId, format = 'pdf', content = {} } = event;
  
  if (!familyId) {
    return {
      code: 400,
      message: 'familyId 为必填项'
    };
  }
  
  const db = uniCloud.database();
  
  try {
    const exportData = {
      exportAt: new Date().toISOString(),
      format: format,
      familyId: familyId,
      pets: [],
      records: {}
    };
    
    // 获取宠物列表
    const petQuery = petId ? { _id: petId, familyId } : { familyId };
    const petsRes = await db.collection('pets')
      .where(petQuery)
      .get();
    
    exportData.pets = petsRes.data;
    
    // 获取各类记录
    if (content.weight !== false) {
      const petIds = petsRes.data.map(p => p._id);
      const weightRes = await db.collection('weight_records')
        .where({ petId: db.command.in(petIds) })
        .orderBy('recordedAt', 'desc')
        .limit(100)
        .get();
      exportData.records.weight = weightRes.data;
    }
    
    if (content.health !== false) {
      const petIds = petsRes.data.map(p => p._id);
      const healthRes = await db.collection('health_records')
        .where({ petId: db.command.in(petIds) })
        .orderBy('recordedAt', 'desc')
        .limit(100)
        .get();
      exportData.records.health = healthRes.data;
    }
    
    if (content.vaccine !== false) {
      const petIds = petsRes.data.map(p => p._id);
      const vaccineRes = await db.collection('vaccine_records')
        .where({ petId: db.command.in(petIds) })
        .orderBy('vaccinatedAt', 'desc')
        .limit(100)
        .get();
      exportData.records.vaccine = vaccineRes.data;
    }
    
    if (content.deworming !== false) {
      const petIds = petsRes.data.map(p => p._id);
      const dewormingRes = await db.collection('deworming_records')
        .where({ petId: db.command.in(petIds) })
        .orderBy('usedAt', 'desc')
        .limit(100)
        .get();
      exportData.records.deworming = dewormingRes.data;
    }
    
    if (content.food !== false) {
      const petIds = petsRes.data.map(p => p._id);
      const foodRes = await db.collection('food_records')
        .where({ petId: db.command.in(petIds) })
        .orderBy('startDate', 'desc')
        .limit(100)
        .get();
      exportData.records.food = foodRes.data;
    }
    
    // 生成导出文件
    if (format === 'excel') {
      return {
        code: 200,
        message: '导出成功',
        data: {
          format: 'excel',
          content: generateExcel(exportData),
          filename: `petslog_export_${Date.now()}.csv`
        }
      };
    } else {
      return {
        code: 200,
        message: '导出成功',
        data: {
          format: 'pdf',
          content: exportData,
          filename: `petslog_report_${Date.now()}.json`
        }
      };
    }
  } catch (e) {
    console.error('导出数据失败:', e);
    return {
      code: 500,
      message: '导出数据失败'
    };
  }
};

/**
 * 生成 Excel CSV 格式
 */
function generateExcel(data) {
  let csv = '\uFEFF'; // BOM for UTF-8
  
  // 宠物基本信息
  csv += '=== 宠物信息 ===\n';
  csv += '姓名，品种，性别，年龄，毛色，绝育状态\n';
  data.pets.forEach(pet => {
    csv += `${pet.name},${pet.breed || ''},${pet.gender === 'male' ? '公' : pet.gender === 'female' ? '母' : ''},${pet.age || ''},${pet.color || ''},${pet.neutered ? '已绝育' : '未绝育'}\n`;
  });
  
  // 体重记录
  if (data.records.weight && data.records.weight.length > 0) {
    csv += '\n=== 体重记录 ===\n';
    csv += '宠物姓名，体重 (kg),记录日期，备注\n';
    data.records.weight.forEach(r => {
      const pet = data.pets.find(p => p._id === r.petId);
      csv += `${pet ? pet.name : ''},${r.weight || ''},${formatDate(r.recordedAt)},${r.note || ''}\n`;
    });
  }
  
  // 健康记录
  if (data.records.health && data.records.health.length > 0) {
    csv += '\n=== 健康记录 ===\n';
    csv += '宠物姓名，症状，观察记录，状态，记录日期\n';
    data.records.health.forEach(r => {
      const pet = data.pets.find(p => p._id === r.petId);
      csv += `${pet ? pet.name : ''},${r.symptom || ''},${r.observation || ''},${r.status || ''},${formatDate(r.recordedAt)}\n`;
    });
  }
  
  // 疫苗记录
  if (data.records.vaccine && data.records.vaccine.length > 0) {
    csv += '\n=== 疫苗记录 ===\n';
    csv += '宠物姓名，疫苗名称，类型，品牌，接种日期\n';
    data.records.vaccine.forEach(r => {
      const pet = data.pets.find(p => p._id === r.petId);
      csv += `${pet ? pet.name : ''},${r.name || ''},${r.type || ''},${r.brand || ''},${formatDate(r.vaccinatedAt)}\n`;
    });
  }
  
  // 驱虫记录
  if (data.records.deworming && data.records.deworming.length > 0) {
    csv += '\n=== 驱虫记录 ===\n';
    csv += '宠物姓名，类型，品牌，型号，使用日期\n';
    data.records.deworming.forEach(r => {
      const pet = data.pets.find(p => p._id === r.petId);
      csv += `${pet ? pet.name : ''},${r.type === 'internal' ? '体内驱虫' : '体外驱虫'},${r.brand || ''},${r.product || ''},${formatDate(r.usedAt)}\n`;
    });
  }
  
  // 粮食记录
  if (data.records.food && data.records.food.length > 0) {
    csv += '\n=== 粮食记录 ===\n';
    csv += '宠物姓名，品牌，型号，类型，开始日期，结束日期\n';
    data.records.food.forEach(r => {
      const pet = data.pets.find(p => p._id === r.petId);
      const type = r.type === 'dry' ? '干粮' : r.type === 'wet' ? '湿粮' : '零食';
      csv += `${pet ? pet.name : ''},${r.brand || ''},${r.product || ''},${type},${formatDate(r.startDate)},${r.endDate ? formatDate(r.endDate) : ''}\n`;
    });
  }
  
  return csv;
}

/**
 * 格式化日期
 */
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
