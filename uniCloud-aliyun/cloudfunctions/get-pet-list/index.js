/**
 * 获取用户所有宠物列表云函数
 * 支持多宠物家庭管理
 * @param {Object} event
 * @param {string} event.user_id - 用户 ID（可选，默认使用当前登录用户）
 */
exports.main = async (event, context) => {
  const { user_id } = event;
  
  // 获取当前登录用户信息
  const uid = user_id || context.auth?.uid;
  
  if (!uid) {
    return {
      code: 401,
      message: '未登录或用户 ID 不能为空'
    };
  }
  
  const db = uniCloud.database();
  
  try {
    // 1. 获取用户信息（包含 pet_ids）
    const userResult = await db.collection('users').doc(uid).get();
    
    if (!userResult.data || userResult.data.length === 0) {
      return {
        code: 404,
        message: '用户不存在'
      };
    }
    
    const user = userResult.data[0];
    const petIds = user.pet_ids || [];
    const currentPetId = user.current_pet_id || null;
    
    // 2. 如果没有绑定宠物，返回空列表
    if (petIds.length === 0) {
      return {
        code: 200,
        message: '获取成功',
        data: {
          pets: [],
          current_pet_id: null,
          total: 0
        }
      };
    }
    
    // 3. 查询所有绑定的宠物
    const petsResult = await db.collection('pets')
      .where({
        _id: {
          $in: petIds
        }
      })
      .orderBy('createdAt', 'desc')
      .get();
    
    // 4. 计算年龄并标记当前宠物
    const pets = petsResult.data.map(pet => {
      const age = calculateAge(pet.birthday);
      const isCurrent = pet._id === currentPetId;
      return {
        ...pet,
        age: age,
        is_current: isCurrent
      };
    });
    
    return {
      code: 200,
      message: '获取成功',
      data: {
        pets: pets,
        current_pet_id: currentPetId,
        total: pets.length
      }
    };
    
  } catch (error) {
    console.error('get-pet-list error:', error);
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
