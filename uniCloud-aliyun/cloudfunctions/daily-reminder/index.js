/**
 * 定时任务：每日提醒检查
 * 每天上午 9 点执行，检查当天到期的提醒并推送通知
 * 
 * 触发器配置：
 * 0 0 9 * * *  (每天 9:00 AM)
 */

const db = uniCloud.database();

exports.main = async (event, context) => {
  console.log('[定时任务] 开始执行每日提醒检查');
  
  const now = Date.now();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayEnd = today.getTime() + 24 * 60 * 60 * 1000;
  
  const notifications = [];
  
  try {
    // 1. 检查所有家庭
    const familiesRes = await db.collection('families').get();
    
    for (const family of familiesRes.data) {
      const familyId = family._id;
      const familyName = family.name || '家庭';
      
      // 获取该家庭的提醒设置
      const settings = family.reminderSettings || {
        dewormingEnabled: true,
        vaccineEnabled: true,
        birthdayEnabled: true,
        weightEnabled: true,
        notifyTime: '09:00'
      };
      
      // 2. 检查驱虫提醒
      if (settings.dewormingEnabled) {
        const dewormingNotifications = await checkDewormingReminders(db, familyId, now, todayEnd);
        notifications.push(...dewormingNotifications);
      }
      
      // 3. 检查疫苗提醒
      if (settings.vaccineEnabled) {
        const vaccineNotifications = await checkVaccineReminders(db, familyId, now, todayEnd);
        notifications.push(...vaccineNotifications);
      }
      
      // 4. 检查生日提醒
      if (settings.birthdayEnabled) {
        const birthdayNotifications = await checkBirthdayReminders(db, familyId, now);
        notifications.push(...birthdayNotifications);
      }
      
      // 5. 检查称重提醒（每月 1 号）
      if (settings.weightEnabled && today.getDate() === 1) {
        const weightNotifications = await checkWeightReminders(db, familyId);
        notifications.push(...weightNotifications);
      }
    }
    
    // 6. 发送通知
    // 注意：实际部署时需要配置消息推送
    // 可以使用 uniPush、微信小程序订阅消息等
    console.log('[定时任务] 待发送通知:', notifications.length);
    
    // 这里只是记录日志，实际发送需要配置推送服务
    for (const notification of notifications) {
      console.log('[提醒推送]', JSON.stringify(notification));
      
      // 示例：保存到通知记录表
      try {
        await db.collection('notifications').add({
          ...notification,
          createdAt: now,
          status: 'pending'
        });
      } catch (e) {
        console.error('保存通知记录失败:', e);
      }
    }
    
    return {
      code: 200,
      message: '提醒检查完成',
      data: {
        total: notifications.length,
        notifications
      }
    };
  } catch (e) {
    console.error('[定时任务] 执行失败:', e);
    return {
      code: 500,
      message: '提醒检查失败'
    };
  }
};

/**
 * 检查驱虫提醒
 */
async function checkDewormingReminders(db, familyId, now, todayEnd) {
  const notifications = [];
  
  const res = await db.collection('deworming_records')
    .where({
      familyId,
      remindEnabled: true,
      nextReminder: db.command.gte(now),
      nextReminder: db.command.lt(todayEnd)
    })
    .get();
  
  res.data.forEach(record => {
    const daysLeft = Math.ceil((record.nextReminder - now) / (24 * 60 * 60 * 1000));
    let message = '';
    
    if (daysLeft === 0) {
      message = `🔔 今天该给${record.petName}进行${record.type === 'internal' ? '体内' : '体外'}驱虫啦！`;
    } else if (daysLeft === 1) {
      message = `⏰ 明天该给${record.petName}进行${record.type === 'internal' ? '体内' : '体外'}驱虫了，请提前准备！`;
    } else {
      message = `📅 ${daysLeft}天后需要给${record.petName}进行${record.type === 'internal' ? '体内' : '体外'}驱虫`;
    }
    
    notifications.push({
      familyId,
      petId: record.petId,
      petName: record.petName,
      type: 'deworming',
      title: '驱虫提醒',
      message,
      data: {
        recordId: record._id,
        reminderType: record.type
      }
    });
  });
  
  return notifications;
}

/**
 * 检查疫苗提醒
 */
async function checkVaccineReminders(db, familyId, now, todayEnd) {
  const notifications = [];
  
  const res = await db.collection('vaccine_records')
    .where({
      familyId,
      remindEnabled: true,
      nextReminder: db.command.gte(now),
      nextReminder: db.command.lt(todayEnd)
    })
    .get();
  
  res.data.forEach(record => {
    const daysLeft = Math.ceil((record.nextReminder - now) / (24 * 60 * 60 * 1000));
    let message = '';
    
    if (daysLeft === 0) {
      message = `💉 今天该给${record.petName}接种${record.name}了！`;
    } else if (daysLeft === 1) {
      message = `⏰ 明天该给${record.petName}接种${record.name}了，请提前安排时间！`;
    } else {
      message = `📅 ${daysLeft}天后需要给${record.petName}接种${record.name}`;
    }
    
    notifications.push({
      familyId,
      petId: record.petId,
      petName: record.petName,
      type: 'vaccine',
      title: '疫苗提醒',
      message,
      data: {
        recordId: record._id,
        vaccineName: record.name
      }
    });
  });
  
  return notifications;
}

/**
 * 检查生日提醒
 */
async function checkBirthdayReminders(db, familyId, now) {
  const notifications = [];
  const today = new Date(now);
  
  const res = await db.collection('pets')
    .where({ familyId })
    .get();
  
  res.data.forEach(pet => {
    if (pet.birthday) {
      const birthDate = new Date(pet.birthday);
      const isBirthdayToday = 
        birthDate.getMonth() === today.getMonth() && 
        birthDate.getDate() === today.getDate();
      
      if (isBirthdayToday) {
        const age = today.getFullYear() - birthDate.getFullYear();
        notifications.push({
          familyId,
          petId: pet._id,
          petName: pet.name,
          type: 'birthday',
          title: '🎂 生日快乐',
          message: `今天是${pet.name}的${age}岁生日！祝小家伙生日快乐，健康成长！🎉`,
          data: {
            age
          }
        });
      }
    }
  });
  
  return notifications;
}

/**
 * 检查称重提醒
 */
async function checkWeightReminders(db, familyId) {
  const notifications = [];
  
  const res = await db.collection('pets')
    .where({ familyId })
    .get();
  
  res.data.forEach(pet => {
    notifications.push({
      familyId,
      petId: pet._id,
      petName: pet.name,
      type: 'weight',
      title: '⚖️ 每月称重',
      message: `新的一个月开始啦，记得给${pet.name}称体重并记录下来哦！`,
      data: {}
    });
  });
  
  return notifications;
}
