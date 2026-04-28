#!/usr/bin/env node

/**
 * API Key 系统测试脚本
 * 
 * 使用方法:
 * 1. 首先在浏览器中登录并获取Clerk Token
 * 2. 将Token复制到这里
 * 3. 运行: node test.js
 */

const API_BASE = 'http://127.0.0.1:8788';

async function test() {
  console.log('🧪 开始测试 API Key 系统\n');
  console.log('='.repeat(50));

  // 获取Clerk Token（需要手动输入）
  const token = await prompt('请输入 Clerk Session Token: ');
  
  if (!token) {
    console.error('❌ Token不能为空');
    process.exit(1);
  }

  console.log('\n📡 正在测试...\n');

  try {
    // 测试1: 创建API Key
    console.log('1️⃣ 测试创建API Key...');
    const createRes = await fetch(`${API_BASE}/api/api-keys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: '自动化测试Key',
        read: true,
        write: false
      })
    });

    const createData = await createRes.json();
    
    if (!createData.success) {
      console.error('❌ 创建Key失败:', createData.error);
      return;
    }

    const apiKey = createData.data.key;
    console.log('✅ Key创建成功!');
    console.log('   完整Key:', apiKey);
    console.log('   前缀:', createData.data.prefix);
    console.log('   ID:', createData.data.id);
    console.log('   ⚠️  请立即保存此Key!\n');

    // 测试2: 获取Keys列表
    console.log('2️⃣ 测试获取Keys列表...');
    const listRes = await fetch(`${API_BASE}/api/api-keys`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const listData = await listRes.json();
    
    if (!listData.success) {
      console.error('❌ 获取列表失败:', listData.error);
      return;
    }

    console.log('✅ 获取列表成功!');
    console.log(`   共 ${listData.data.keys.length} 个Key\n`);

    // 测试3: 使用API Key
    console.log('3️⃣ 测试使用API Key...');
    const useRes = await fetch(`${API_BASE}/api/example`, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    const useData = await useRes.json();
    
    if (useData.success) {
      console.log('✅ API Key使用成功!');
      console.log('   用户ID:', useData.data.userId);
      console.log('   认证类型:', useData.data.authType);
      console.log('   Key ID:', useData.data.keyId);
    } else {
      console.error('❌ 使用Key失败:', useData.error);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ 所有测试通过!\n');
    console.log('📋 接下来你可以:');
    console.log('   1. 在浏览器中测试前端界面');
    console.log('   2. 使用此Key在第三方应用中');
    console.log('   3. 查看使用统计');
    console.log('   4. 测试撤销功能\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.log('\n请确保:');
    console.log('   1. 开发服务器正在运行 (npm run dev)');
    console.log('   2. 数据库迁移已完成');
    console.log('   3. Clerk Token有效\n');
  }
}

function prompt(question) {
  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question(question, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}

// 运行测试
test().catch(console.error);
