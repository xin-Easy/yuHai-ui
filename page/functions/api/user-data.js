// 处理 GET 请求：获取用户在 D1 中的资料
export const onRequestGet = async (context) => {
  const { env, data } = context;

  // 这个 userId 是上层 _middleware.js 鉴权成功后注入的
  const userId = data.userId;
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized', message: 'No valid user ID found in context' }, { status: 401 });
  }

  try {
    // env.DB 是部署环境/wrangler 里绑定的 D1 数据库变量
    // 执行查询语句并绑定 userId 去除 SQL 注入风险
    const { results } = await env.DB.prepare(
      `SELECT * FROM user_profiles WHERE clerk_user_id = ?`
    ).bind(userId).all();

    if (results.length === 0) {
      return Response.json({ message: 'User profile not found', data: Object.create(null) });
    }

    // 成功获取数据并返回
    return Response.json({ 
      message: 'Success', 
      data: results[0] 
    });

  } catch (error) {
    // 捕获 D1 数据库异常或系统异常
    return Response.json({ error: 'Database Error', details: error.message }, { status: 500 });
  }
};

// 处理 POST 请求：更新或创建用户的资料
export const onRequestPost = async (context) => {
  const { request, env, data } = context;
  const userId = data.userId;

  try {
    // 读取请求体（从前端传回的 JSON）
    const requestBody = await request.json();
    const { nickname, avatar_url } = requestBody;

    // UPSERT 操作（如果有存在则更新，不存在则插入）
    const info = await env.DB.prepare(
      `INSERT INTO user_profiles (clerk_user_id, nickname, avatar_url) 
       VALUES (?, ?, ?) 
       ON CONFLICT(clerk_user_id) 
       DO UPDATE SET nickname=excluded.nickname, avatar_url=excluded.avatar_url`
    ).bind(userId, nickname, avatar_url).run();

    return Response.json({ 
      message: 'Profile saved successfully', 
      success: info.success 
    });

  } catch (error) {
    return Response.json({ error: 'Failed to update user profile', details: error.message }, { status: 500 });
  }
};
