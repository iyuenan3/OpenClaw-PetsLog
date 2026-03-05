/**
 * 数据导出云函数
 * 支持导出宠物数据和相关记录
 * 
 * @param {Object} params
 * @param {string} params.familyId - 家庭 ID
 * @param {string} params.petId - 宠物 ID（可选，不传则导出全部）
 * @param {string} params.format - 导出格式：json/csv
 * @param {array} params.fields - 导出的字段（可选，默认全部）
 */
exports.main = async (event, context) => {
  const { familyId, petId, format = 'json', fields = [] } = event;
  
  if (!familyId) {
    return {
      code: 400,
      message: 'familyId 为必填项'
    };
  }
  
  const db = uniCloud.database();
  const exportData = {
    exportAt: new Date().toISOString(),
    familyId,
    pets: []
  };
  
  try {
    // 查询宠物
    const petsQuery = { familyId };
    if (petId) {
      petsQuery._id = petId;
    }
    
    const petsRes = await db.collection('pets')
      .where(petsQuery)
      .get();
    
    // 对每只宠物，查询相关记录
    for (const pet of petsRes.data) {
      const petData = {
        pet: formatPetData(pet, fields),
        weightRecords: [],
        dewormingRecords: [],
        vaccineRecords: [],
        healthRecords: [],
        foodRecords: []
      };
      
      // 查询体重记录
      const weightRes = await db.collection('weight_records')
        .where({ petId: pet._id })
        .orderBy('recordedAt', 'desc')
        .get();
      petData.weightRecords = weightRes.data.map(r => formatRecordData(r, fields));
      
      // 查询驱虫记录
      const dewormingRes = await db.collection('deworming_records')
        .where({ petId: pet._id })
        .orderBy('usedAt', 'desc')
        .get();
      petData.dewormingRecords = dewormingRes.data.map(r => formatRecordData(r, fields));
      
      // 查询疫苗记录
      const vaccineRes = await db.collection('vaccine_records')
        .where({ petId: pet._id })
        .orderBy('vaccinatedAt', 'desc')
        .get();
      petData.vaccineRecords = vaccineRes.data.map(r => formatRecordData(r, fields));
      
      // 查询健康记录
      const healthRes = await db.collection('health_records')
        .where({ petId: pet._id })
        .orderBy('recordedAt', 'desc')
        .get();
      petData.healthRecords = healthRes.data.map(r => formatRecordData(r, fields));
      
      // 查询粮食记录
      const foodRes = await db.collection('food_records')
        .where({ petId: pet._id })
        .orderBy('startDate', 'desc')
        .get();
      petData.foodRecords = foodRes.data.map(r => formatRecordData(r, fields));
      
      exportData.pets.push(petData);
    }
    
    // 根据格式返回数据
    if (format === 'csv') {
      return {
        code: 200,
        message: '导出成功',
        data: {
          format: 'csv',
          content: convertToCSV(exportData)
        }
      };
    } else {
      return {
        code: 200,
        message: '导出成功',
        data: {
          format: 'json',
          content: exportData
        }
      };
    }
  } catch (e) {
    console.error('导出数据失败:', e);
    return {
      code: 500,
      message: '导出数据失败，请稍后重试'
    };
  }
};

/**
 * 格式化宠物数据
 */
function formatPetData(pet, fields) {
  const data = {
    _id: pet._id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    gender: pet.gender === 'male' ? '公' : pet.gender === 'female' ? '母' : '未知',
    birthday: pet.birthday ? new Date(pet.birthday).toLocaleDateString('zh-CN') : '',
    age: calculateAge(pet.birthday),
    color: pet.color,
    neutered: pet.neutered ? '已绝育' : '未绝育',
    neuterDate: pet.neuterDate ? new Date(pet.neuterDate).toLocaleDateString('zh-CN') : '',
    notes: pet.notes || '',
    avatar: pet.avatar || '',
    createdAt: pet.createdAt ? new Date(pet.createdAt).toLocaleString('zh-CN') : '',
    updatedAt: pet.updatedAt ? new Date(pet.updatedAt).toLocaleString('zh-CN') : ''
  };
  
  // 如果指定了字段，只返回指定字段
  if (fields.length > 0) {
    const filtered = {};
    fields.forEach(key => {
      if (data[key] !== undefined) filtered[key] = data[key];
    });
    return filtered;
  }
  
  return data;
}

/**
 * 格式化记录数据
 */
function formatRecordData(record, fields) {
  const data = { ...record };
  
  // 转换时间戳为日期
  ['recordedAt', 'usedAt', 'vaccinatedAt', 'startDate', 'endDate', 'nextReminder', 'createdAt', 'updatedAt'].forEach(key => {
    if (data[key] && typeof data[key] === 'number') {
      data[key + 'Str'] = new Date(data[key]).toLocaleString('zh-CN');
    }
  });
  
  // 转换枚举值
  if (data.type) {
    data.typeStr = {
      'internal': '体内驱虫',
      'external': '体外驱虫',
      'dry': '干粮',
      'wet': '湿粮',
      'snack': '零食'
    }[data.type] || data.type;
  }
  
  if (data.status) {
    data.statusStr = {
      'observing': '观察中',
      'treatment': '治疗中',
      'recovered': '已恢复'
    }[data.status] || data.status;
  }
  
  // 如果指定了字段，只返回指定字段
  if (fields.length > 0) {
    const filtered = {};
    fields.forEach(key => {
      if (data[key] !== undefined) filtered[key] = data[key];
    });
    return filtered;
  }
  
  return data;
}

/**
 * 计算年龄
 */
function calculateAge(birthday) {
  if (!birthday) return '';
  const birth = new Date(birthday);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const days = now.getDate() - birth.getDate();
  
  if (years > 0) {
    return `${years}岁${Math.max(0, months)}个月`;
  } else if (months > 0) {
    return `${months}个月${Math.max(0, days)}天`;
  } else {
    return `${days}天`;
  }
}

/**
 * 转换为 CSV 格式
 */
function convertToCSV(data) {
  let csv = '\uFEFF'; // BOM for UTF-8
  
  // 宠物基本信息
  csv += '=== 宠物信息 ===\n';
  csv += '名字，品种，性别，年龄，毛色，绝育状态，备注\n';
  data.pets.forEach(petData => {
    const pet = petData.pet;
    csv += `${pet.name},${pet.breed},${pet.gender},${pet.age},${pet.color},${pet.neutered},${pet.notes || ''}\n`;
  });
  
  // 体重记录
  csv += '\n=== 体重记录 ===\n';
  data.pets.forEach(petData => {
    if (petData.weightRecords.length > 0) {
      csv += `\n宠物：${petData.pet.name}\n`;
      csv += '日期，体重 (kg),备注\n';
      petData.weightRecords.forEach(r => {
        csv += `${r.recordedAtStr || ''},${r.weight || ''},${r.note || ''}\n`;
      });
    }
  });
  
  // 驱虫记录
  csv += '\n=== 驱虫记录 ===\n';
  data.pets.forEach(petData => {
    if (petData.dewormingRecords.length > 0) {
      csv += `\n宠物：${petData.pet.name}\n`;
      csv += '类型，品牌，型号，使用日期，下次提醒\n';
      petData.dewormingRecords.forEach(r => {
        csv += `${r.typeStr || ''},${r.brand || ''},${r.product || ''},${r.usedAtStr || ''},${r.nextReminder ? new Date(r.nextReminder).toLocaleDateString('zh-CN') : ''}\n`;
      });
    }
  });
  
  // 疫苗记录
  csv += '\n=== 疫苗记录 ===\n';
  data.pets.forEach(petData => {
    if (petData.vaccineRecords.length > 0) {
      csv += `\n宠物：${petData.pet.name}\n`;
      csv += '疫苗名称，类型，品牌，接种日期，下次提醒\n';
      petData.vaccineRecords.forEach(r => {
        csv += `${r.name || ''},${r.type || ''},${r.brand || ''},${r.vaccinatedAtStr || ''},${r.nextReminder ? new Date(r.nextReminder).toLocaleDateString('zh-CN') : ''}\n`;
      });
    }
  });
  
  // 健康记录
  csv += '\n=== 健康记录 ===\n';
  data.pets.forEach(petData => {
    if (petData.healthRecords.length > 0) {
      csv += `\n宠物：${petData.pet.name}\n`;
      csv += '症状，观察记录，状态，日期\n';
      petData.healthRecords.forEach(r => {
        csv += `${r.symptom || ''},${r.observation || ''},${r.statusStr || ''},${r.recordedAtStr || ''}\n`;
      });
    }
  });
  
  // 粮食记录
  csv += '\n=== 粮食记录 ===\n';
  data.pets.forEach(petData => {
    if (petData.foodRecords.length > 0) {
      csv += `\n宠物：${petData.pet.name}\n`;
      csv += '品牌，型号，类型，开始日期，结束日期\n';
      petData.foodRecords.forEach(r => {
        csv += `${r.brand || ''},${r.product || ''},${r.typeStr || ''},${r.startDateStr || ''},${r.endDateStr || ''}\n`;
      });
    }
  });
  
  return csv;
}
