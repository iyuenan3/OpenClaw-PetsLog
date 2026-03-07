/**
 * 提醒管理云函数
 * 支持：获取提醒列表、标记完成、启用/禁用提醒
 * 
 * @param {Object} event
 * @param {string} event.action - 操作类型：list/done/toggle/delete
 * @param {string} event.familyId - 家庭 ID
 * @param {string} event.reminderId - 提醒 ID（可选）
 * @param {object} event.data - 提醒数据（可选）
 */
exports.main = async (event, context) => {
  const { action, familyId, reminderId, data } = event;
  
  if (!familyId) {
    return {
      code: 400,
      message: 'familyId 为必填项'
    };
  }
  
  const db = uniCloud.database();
  const now = Date.now();
  
  try {
    switch (action) {
      case 'list':
        return await listReminders(db, familyId, now);
      case 'done':
        return await markAsDone(db, reminderId, data);
      case 'toggle':
        return await toggleReminder(db, reminderId, data);
      case 'delete':
        return await deleteReminder(db, reminderId);
      case 'settings':
        return await updateSettings(db, familyId, data);
      default:
        return {
          code: 400,
          message: '不支持的操作类型'
        };
    }
  } catch (e) {
    console.error('提醒管理失败:', e);
    return {
      code: 500,
      message: '操作失败，请稍后重试'
    };
  }
};

/**
 * 获取提醒列表
 */
async function listReminders(db, familyId, now) {
  const daysAhead = 30; // 未来 30 天内的提醒
  const daysMs = daysAhead * 24 * 60 * 60 * 1000;
  
  const reminders = [];
  
  // 1. 驱虫提醒
  const dewormingRes = await db.collection('deworming_records')
    .where({
      familyId,
      remindEnabled: true,
      nextReminder: db.command.gt(now),
      nextReminder: db.command.lte(now + daysMs)
    })
    .orderBy('nextReminder', 'asc')
    .get();
  
  dewormingRes.data.forEach(record => {
    const daysLeft = Math.ceil((record.nextReminder - now) / (24 * 60 * 60 * 1000));
    reminders.push({
      _id: record._id,
      type: 'deworming',
      icon: record.type === 'internal' ? '💊' : '🧴',
      title: `${record.petName} - ${record.type === 'internal' ? '体内驱虫' : '体外驱虫'}`,
      desc: `${record.brand} ${record.product || ''}`,
      petId: record.petId,
      petName: record.petName,
      time: formatDate(record.nextReminder),
      daysLeft,
      urgency: getUrgency(daysLeft),
      timestamp: record.nextReminder
    });
  });
  
  // 2. 疫苗提醒
  const vaccineRes = await db.collection('vaccine_records')
    .where({
      familyId,
      remindEnabled: true,
      nextReminder: db.command.gt(now),
      nextReminder: db.command.lte(now + daysMs)
    })
    .orderBy('nextReminder', 'asc')
    .get();
  
  vaccineRes.data.forEach(record => {
    const daysLeft = Math.ceil((record.nextReminder - now) / (24 * 60 * 60 * 1000));
    reminders.push({
      _id: record._id,
      type: 'vaccine',
      icon: '💉',
      title: `${record.petName} - ${record.name}`,
      desc: `${record.type} - ${record.brand}`,
      petId: record.petId,
      petName: record.petName,
      time: formatDate(record.nextReminder),
      daysLeft,
      urgency: getUrgency(daysLeft),
      timestamp: record.nextReminder
    });
  });
  
  // 3. 生日提醒
  const petsRes = await db.collection('pets')
    .where({ familyId })
    .get();
  
  const currentYear = new Date(now).getFullYear();
  petsRes.data.forEach(pet => {
    if (pet.birthday) {
      const birthDate = new Date(pet.birthday);
      const birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate()).getTime();
      const daysUntilBirthday = Math.ceil((birthdayThisYear - now) / (24 * 60 * 60 * 1000));
      
      if (daysUntilBirthday >= 0 && daysUntilBirthday <= daysAhead) {
        reminders.push({
          _id: `birthday_${pet._id}`,
          type: 'birthday',
          icon: '🎂',
          title: `${petName} 生日`,
          desc: `${pet.name} 即将 ${currentYear - birthDate.getFullYear()} 岁`,
          petId: pet._id,
          petName: pet.name,
          time: formatDate(birthdayThisYear),
          daysLeft: daysUntilBirthday,
          urgency: getUrgency(daysUntilBirthday),
          timestamp: birthdayThisYear
        });
      }
    }
  });
  
  // 4. 称重提醒（每月 1 号）
  const today = new Date(now);
  if (today.getDate() <= 3) {
    petsRes.data.forEach(pet => {
      reminders.push({
        _id: `weight_${pet._id}`,
        type: 'weight',
        icon: '⚖️',
        title: `${pet.name} - 每月称重`,
        desc: '记录体重变化，关注健康成长',
        petId: pet._id,
        petName: pet.name,
        time: `${currentYear}-${String(today.getMonth() + 1).padStart(2, '0')}-01`,
        daysLeft: 0,
        urgency: 'normal',
        timestamp: now
      });
    });
  }
  
  // 按时间排序
  reminders.sort((a, b) => a.timestamp - b.timestamp);
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      reminders,
      total: reminders.length,
      byType: {
        deworming: reminders.filter(r => r.type === 'deworming').length,
        vaccine: reminders.filter(r => r.type === 'vaccine').length,
        birthday: reminders.filter(r => r.type === 'birthday').length,
        weight: reminders.filter(r => r.type === 'weight').length
      }
    }
  };
}

/**
 * 标记提醒为已完成
 */
async function markAsDone(db, reminderId, data) {
  if (!reminderId) {
    return {
      code: 400,
      message: '提醒 ID 为必填项'
    };
  }
  
  // 如果是生日或体重提醒，不需要更新数据库
  if (reminderId.startsWith('birthday_') || reminderId.startsWith('weight_')) {
    return {
      code: 200,
      message: '已标记完成'
    };
  }
  
  // 更新记录的下一次提醒时间
  const { nextReminder, remindInterval } = data;
  
  if (nextReminder) {
    // 判断是驱虫还是疫苗记录
    const dewormingRes = await db.collection('deworming_records')
      .where({ _id: reminderId })
      .get();
    
    if (dewormingRes.data.length > 0) {
      await db.collection('deworming_records').doc(reminderId).update({
        nextReminder,
        remindEnabled: remindInterval ? true : false
      });
    } else {
      await db.collection('vaccine_records').doc(reminderId).update({
        nextReminder,
        remindEnabled: remindInterval ? true : false
      });
    }
  }
  
  return {
    code: 200,
    message: '已标记完成'
  };
}

/**
 * 启用/禁用提醒
 */
async function toggleReminder(db, reminderId, data) {
  if (!reminderId) {
    return {
      code: 400,
      message: '提醒 ID 为必填项'
    };
  }
  
  const { enabled } = data;
  
  // 判断是驱虫还是疫苗记录
  const dewormingRes = await db.collection('deworming_records')
    .where({ _id: reminderId })
    .get();
  
  if (dewormingRes.data.length > 0) {
    await db.collection('deworming_records').doc(reminderId).update({
      remindEnabled: enabled
    });
  } else {
    await db.collection('vaccine_records').doc(reminderId).update({
      remindEnabled: enabled
    });
  }
  
  return {
    code: 200,
    message: enabled ? '已启用提醒' : '已禁用提醒'
  };
}

/**
 * 删除提醒
 */
async function deleteReminder(db, reminderId) {
  if (!reminderId) {
    return {
      code: 400,
      message: '提醒 ID 为必填项'
    };
  }
  
  // 虚拟提醒（生日、体重）不需要删除
  if (reminderId.startsWith('birthday_') || reminderId.startsWith('weight_')) {
    return {
      code: 200,
      message: '已删除'
    };
  }
  
  // 尝试从驱虫记录中删除
  const dewormingRes = await db.collection('deworming_records')
    .where({ _id: reminderId })
    .get();
  
  if (dewormingRes.data.length > 0) {
    await db.collection('deworming_records').doc(reminderId).update({
      remindEnabled: false
    });
  } else {
    await db.collection('vaccine_records').doc(reminderId).update({
      remindEnabled: false
    });
  }
  
  return {
    code: 200,
    message: '已删除'
  };
}

/**
 * 更新提醒设置
 */
async function updateSettings(db, familyId, data) {
  const { settings } = data;
  
  // 更新家庭设置
  await db.collection('families').doc(familyId).update({
    reminderSettings: settings,
    updatedAt: Date.now()
  });
  
  return {
    code: 200,
    message: '设置已保存'
  };
}

/**
 * 格式化日期
 */
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
  
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  
  if (isToday) {
    return `今天 ${hour}:${minute}`;
  } else if (isTomorrow) {
    return `明天 ${hour}:${minute}`;
  } else {
    return `${month}-${day} ${hour}:${minute}`;
  }
}

/**
 * 获取紧急程度
 */
function getUrgency(daysLeft) {
  if (daysLeft <= 1) return 'urgent';
  if (daysLeft <= 3) return 'soon';
  return 'normal';
}
