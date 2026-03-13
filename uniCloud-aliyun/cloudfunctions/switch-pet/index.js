/**
 * 切换当前宠物上下文云函数
 * @param {Object} event
 * @param {string} event.pet_id - 要切换到的宠物 ID
 */
exports.main = async (event, context) => {
  const { pet_id } = event;
  
  // 获取当前登录用户信息
  const uid = context.auth?.uid;
  
  if (!uid) {
    return {
      code: 401,
      message: '未登录'
    };
  }
  
  if (!pet_id) {
    return {
      code: 400,
      message: 'pet_id 不能为空'
    };
  }
  
  const db = uniCloud.database();
  
  try {
    // 1. 验证宠物是否存在且属于该用户
    const userResult = await db.collection('users').doc(uid).get();
    
    if (!userResult.data || userResult.data.length === 0) {
      return {
        code: 404,
        message: '用户不存在'
      };
    }
    
    const user = userResult.data[0];
    const petIds = user.pet_ids || [];
    
    // 验证宠物是否在用户的宠物列表中
    if (!petIds.includes(pet_id)) {
      return {
        code: 403,
        message: '该宠物不属于您的账户'
      };
    }
    
    // 2. 更新用户的 current_pet_id
    await db.collection('users').doc(uid).update({
      current_pet_id: pet_id
    });
    
    // 3. 获取宠物详细信息返回
    const petResult = await db.collection('pets').doc(pet_id).get();
    
    if (!petResult.data || petResult.data.length === 0) {
      return {
        code: 404,
        message: '宠物不存在'
      };
    }
    
    const pet = petResult.data[0];
    const age = calculateAge(pet.birthday);
    
    return {
      code: 200,
      message: '切换成功',
      data: {
        pet: {
          ...pet,
          age: age
        },
        pet_id: pet_id
      }
    };
    
  } catch (error) {
    console.error('switch-pet error:', error);
    return {
      code: 500,
      message: '服务器错误：' + error.message
    };
  }
};

/**
 * 计算年龄
 * @param {number} birthday - 出生日期时间戳
 */
function calculateAge(birthday) {
  if (!birthday) return '';
  
  const birthDate = new Date(birthday);
  const now = new Date();
  
  const years = now.getFullYear() - birthDate.getFullYear();
  const months = now.getMonth() - birthDate.getMonth();
  
  let ageText = '';
  if (years > 0) {
    ageText += years + '岁';
  }
  if (months > 0 || years === 0) {
    ageText += months + '个月';
  }
  
  return ageText;
}
