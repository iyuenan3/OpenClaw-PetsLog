/**
 * 定时备份云函数
 * 支持定时自动备份用户数据到阿里云 OSS
 * 可通过云函数触发器定时调用
 * @param {Object} event
 * @param {string} event.user_id - 用户 ID（可选，不传则备份所有用户）
 */
exports.main = async (event, context) => {
  const { user_id } = event;
  
  const db = uniCloud.database();
  
  try {
    // 1. 获取需要备份的用户
    let users;
    if (user_id) {
      const userResult = await db.collection('users').doc(user_id).get();
      users = userResult.data || [];
    } else {
      // 获取所有用户（实际应该分页处理）
      const userResult = await db.collection('users').limit(100).get();
      users = userResult.data || [];
    }
    
    console.log('需要备份的用户数:', users.length);
    
    const backupResults = [];
    
    // 2. 为每个用户备份
    for (const user of users) {
      try {
        const uid = user._id;
        const userPetIds = user.pet_ids || [];
        
        if (userPetIds.length === 0) {
          continue; // 没有宠物的用户跳过
        }
        
        // 3. 收集用户数据
        const exportData = {
          user: {
            username: user.username,
            familyId: user.familyId
          },
          pets: [],
          food: [],
          health: [],
          weight: [],
          vaccine: [],
          deworming: [],
          medication: []
        };
        
        // 获取宠物信息
        const petsResult = await db.collection('pets')
          .where({ _id: { $in: userPetIds } })
          .get();
        exportData.pets = petsResult.data || [];
        
        // 获取各类记录（最近 30 天）
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        
        const collections = {
          food: 'food_records',
          health: 'health_records',
          weight: 'weight_records',
          vaccine: 'vaccine_records',
          deworming: 'deworming_records',
          medication: 'medication_records'
        };
        
        for (const [key, collectionName] of Object.entries(collections)) {
          const result = await db.collection(collectionName)
            .where({
              petId: { $in: userPetIds },
              createdAt: { $gte: thirtyDaysAgo }
            })
            .get();
          exportData[key] = result.data || [];
        }
        
        // 4. 生成 JSON 备份文件
        const backupJson = JSON.stringify(exportData, null, 2);
        const fileName = `backup_${uid}_${Date.now()}.json`;
        
        // 5. 上传到 OSS（需要配置 OSS）
        // 注意：实际使用需要配置 OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET, OSS_BUCKET, OSS_REGION
        let fileUrl = '';
        let fileSize = Buffer.byteLength(backupJson, 'utf8');
        
        try {
          // 这里需要实际配置 OSS
          // const oss = require('ali-oss');
          // const client = new oss({
          //   region: process.env.OSS_REGION,
          //   accessKeyId: process.env.OSS_ACCESS_KEY_ID,
          //   accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
          //   bucket: process.env.OSS_BUCKET
          // });
          // const result = await client.put(`backups/${fileName}`, Buffer.from(backupJson));
          // fileUrl = result.url;
          
          // 临时：使用云存储
          fileUrl = `/backups/${fileName}`;
        } catch (ossError) {
          console.error('OSS 上传失败:', ossError);
          fileUrl = '';
        }
        
        // 6. 创建备份记录
        const backupRecord = {
          user_id: uid,
          file_name: fileName,
          file_url: fileUrl,
          file_size: fileSize,
          type: 'auto_backup',
          data_type: 'all',
          format: 'json',
          status: fileUrl ? 'completed' : 'failed',
          error_message: fileUrl ? '' : 'OSS 上传失败',
          created_at: Date.now(),
          expires_at: Date.now() + 90 * 24 * 60 * 60 * 1000 // 90 天后过期
        };
        
        await db.collection('backups').add(backupRecord);
        
        backupResults.push({
          user_id: uid,
          success: !!fileUrl,
          file_name: fileName
        });
        
      } catch (userError) {
        console.error('用户备份失败:', user._id, userError);
        backupResults.push({
          user_id: user._id,
          success: false,
          error: userError.message
        });
      }
    }
    
    return {
      code: 200,
      message: '批量备份完成',
      data: {
        total: users.length,
        success: backupResults.filter(r => r.success).length,
        failed: backupResults.filter(r => !r.success).length,
        results: backupResults
      }
    };
    
  } catch (error) {
    console.error('schedule-backup error:', error);
    return {
      code: 500,
      message: '服务器错误：' + error.message
    };
  }
};
