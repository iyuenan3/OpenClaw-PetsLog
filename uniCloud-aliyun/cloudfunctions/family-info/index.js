/**
 * 获取家庭信息云函数
 * @param {Object} event
 * @param {string} event.familyId - 家庭 ID
 */
exports.main = async (event, context) => {
  const { familyId } = event;
  
  if (!familyId) {
    return {
      code: 400,
      message: 'familyId 为必填项'
    };
  }
  
  const db = uniCloud.database();
  
  try {
    // 获取家庭信息
    const familyRes = await db.collection('families')
      .doc(familyId)
      .get();
    
    if (familyRes.data.length === 0) {
      return {
        code: 404,
        message: '家庭不存在'
      };
    }
    
    const family = familyRes.data[0];
    
    // 获取家庭成员
    const membersRes = await db.collection('users')
      .where({ familyId })
      .field({
        _id: true,
        username: true,
        familyRole: true,
        createdAt: true
      })
      .get();
    
    const members = membersRes.data.map(member => ({
      id: member._id,
      name: member.username,
      role: member.familyRole || 'member',
      avatar: '',
      joinDate: member.createdAt ? new Date(member.createdAt).toLocaleDateString('zh-CN') : '未知'
    }));
    
    // 获取宠物数量
    const petsRes = await db.collection('pets')
      .where({ familyId })
      .count();
    
    return {
      code: 200,
      message: '获取成功',
      data: {
        name: family.name,
        memberCount: members.length,
        petCount: petsRes.total,
        members: members
      }
    };
  } catch (e) {
    console.error('获取家庭信息失败:', e);
    return {
      code: 500,
      message: '获取家庭信息失败'
    };
  }
};
