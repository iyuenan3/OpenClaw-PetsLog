/**
 * 检查提醒云函数
 * 用于检查到期的驱虫、疫苗、称重、生日提醒
 * 
 * @param {Object} params
 * @param {string} params.familyId - 家庭 ID
 * @param {number} params.daysAhead - 提前多少天提醒（默认 7 天）
 */
exports.main = async (event, context) => {
  const { familyId, daysAhead = 7 } = event;
  
  if (!familyId) {
    return {
      code: 400,
      message: 'familyId 为必填项'
    };
  }
  
  const db = uniCloud.database();
  const now = Date.now();
  const daysMs = daysAhead * 24 * 60 * 60 * 1000;
  
  const reminders = {
    deworming: [],
    vaccine: [],
    weight: [],
    birthday: []
  };
  
  try {
    // 1. 检查驱虫提醒
    const dewormingRes = await db.collection('deworming_records')
      .where({
        familyId,
        nextReminder: db.command.gt(now - daysMs),
        nextReminder: db.command.lte(now + daysMs)
      })
      .get();
    
    dewormingRes.data.forEach(record => {
      reminders.deworming.push({
        petId: record.petId,
        petName: record.petName,
        type: record.type === 'internal' ? '体内驱虫' : '体外驱虫',
        nextReminder: record.nextReminder,
        daysLeft: Math.ceil((record.nextReminder - now) / (24 * 60 * 60 * 1000))
      });
    });
    
    // 2. 检查疫苗提醒
    const vaccineRes = await db.collection('vaccine_records')
      .where({
        familyId,
        nextReminder: db.command.gt(now - daysMs),
        nextReminder: db.command.lte(now + daysMs)
      })
      .get();
    
    vaccineRes.data.forEach(record => {
      reminders.vaccine.push({
        petId: record.petId,
        petName: record.petName,
        vaccineName: record.name,
        nextReminder: record.nextReminder,
        daysLeft: Math.ceil((record.nextReminder - now) / (24 * 60 * 60 * 1000))
      });
    });
    
    // 3. 检查生日提醒（未来 7 天内）
    const petsRes = await db.collection('pets')
      .where({ familyId })
      .get();
    
    const currentYear = new Date(now).getFullYear();
    petsRes.data.forEach(pet => {
      if (pet.birthday) {
        const birthdayThisYear = new Date(currentYear, new Date(pet.birthday).getMonth(), new Date(pet.birthday).getDate()).getTime();
        const daysUntilBirthday = Math.ceil((birthdayThisYear - now) / (24 * 60 * 60 * 1000));
        
        if (daysUntilBirthday >= 0 && daysUntilBirthday <= daysAhead) {
          reminders.birthday.push({
            petId: pet._id,
            petName: pet.name,
            birthday: birthdayThisYear,
            daysUntil: daysUntilBirthday,
            age: currentYear - new Date(pet.birthday).getFullYear()
          });
        }
      }
    });
    
    // 4. 称重提醒（每月 1 号）
    const today = new Date(now);
    if (today.getDate() <= 3) { // 每月前 3 天提醒
      const petNames = petsRes.data.map(pet => pet.name);
      reminders.weight = petNames.map(name => ({
        petName: name,
        message: '该给称重啦！'
      }));
    }
    
    return {
      code: 200,
      message: '获取成功',
      data: {
        reminders,
        total: reminders.deworming.length + reminders.vaccine.length + reminders.weight.length + reminders.birthday.length
      }
    };
  } catch (e) {
    console.error('检查提醒失败:', e);
    return {
      code: 500,
      message: '检查提醒失败，请稍后重试'
    };
  }
};
