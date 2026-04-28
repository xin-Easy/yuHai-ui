/**
 * API Key 管理工具库
 * 用于生成、验证和管理API Keys
 */

export class ApiKeyManager {
  constructor(env) {
    this.env = env;
    this.prefix = 'yh';  // yuhai的缩写
    this.keyLength = 32;  // 完整Key长度
  }

  /**
   * 生成一个新的API Key
   * @returns {Object} { fullKey, hash, prefix }
   */
  async generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomValues = crypto.getRandomValues(new Uint8Array(this.keyLength));
    const randomPart = Array.from(randomValues)
      .map(b => chars[b % chars.length])
      .join('');
    
    const fullKey = `${this.prefix}_${randomPart}`;
    const hash = await this.hashKey(fullKey);
    const prefix = fullKey.substring(0, 12);
    
    return { fullKey, hash, prefix };
  }

  /**
   * SHA-256哈希（模拟，实际使用Web Crypto API）
   * @param {string} key - 明文Key
   * @returns {string} - 哈希值
   */
  async hashKey(key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  async verifyKey(providedKey, clientIP = 'unknown') {
    if (!providedKey || !providedKey.startsWith(`${this.prefix}_`)) {
      return { valid: false, error: 'Invalid key format' };
    }

    const hash = await this.hashKey(providedKey);
    
    try {
      const { results } = await this.env.DB.prepare(
        `SELECT * FROM api_keys 
         WHERE key_hash = ? 
         AND is_active = 1 
         AND is_revoked = 0
         AND (expires_at IS NULL OR expires_at > datetime('now'))`
      ).bind(hash).all();

      if (results.length === 0) {
        return { valid: false, error: 'Key not found or inactive' };
      }

      const keyData = results[0];
      
      await this.updateUsageStats(keyData, clientIP);
      
      return { valid: true, keyData };

    } catch (error) {
      console.error('Key verification error:', error);
      return { valid: false, error: 'Verification failed' };
    }
  }

  async updateUsageStats(keyData, clientIP = 'unknown') {
    try {
      await this.env.DB.prepare(
        `UPDATE api_keys 
         SET use_count = use_count + 1, 
             last_used_at = datetime('now'),
             last_used_ip = ?
         WHERE id = ?`
      ).bind(clientIP, keyData.id).run();

      const today = new Date().toISOString().split('T')[0];
      await this.env.DB.prepare(
        `INSERT INTO api_key_daily_stats (key_id, user_id, stat_date, request_count)
         VALUES (?, ?, ?, 1)
         ON CONFLICT(key_id, stat_date) 
         DO UPDATE SET request_count = request_count + 1`
      ).bind(keyData.id, keyData.user_id, today).run();

    } catch (error) {
      console.error('Update usage stats error:', error);
    }
  }

  async checkRateLimit(keyData, clientIP = 'unknown') {
    const now = Date.now();
    const windowMs = 60000;
    const today = new Date().toISOString().split('T')[0];

    try {
      if (keyData.rate_limit) {
        const minuteStats = await this.env.DB.prepare(
          `SELECT COUNT(*) as count FROM api_usage_logs 
           WHERE key_id = ? 
           AND created_at > datetime('now', '-1 minute')`
        ).bind(keyData.id).first();

        if (minuteStats.count >= keyData.rate_limit) {
          return { 
            allowed: false, 
            error: 'Rate limit exceeded',
            limit: keyData.rate_limit,
            resetTime: new Date(now + windowMs).toISOString()
          };
        }
      }

      // 检查每日限制
      if (keyData.daily_limit) {
        const { results } = await this.env.DB.prepare(
          `SELECT request_count FROM api_key_daily_stats 
           WHERE key_id = ? AND stat_date = ?`
        ).bind(keyData.id, today).all();

        if (results.length > 0 && results[0].request_count >= keyData.daily_limit) {
          return { 
            allowed: false, 
            error: 'Daily limit exceeded',
            limit: keyData.daily_limit,
            resetTime: new Date(now + 86400000).toISOString()
          };
        }
      }

      return { allowed: true };

    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true };  // 出错时允许请求
    }
  }

  /**
   * 创建API Key
   * @param {string} userId - 用户ID
   * @param {string} name - Key名称
   * @param {Object} options - 配置选项（rateLimit, dailyLimit, expiresAt）
   */
  async createKey(userId, name, options = {}) {
    const { fullKey, hash, prefix } = await this.generateKey();

    try {
      const result = await this.env.DB.prepare(
        `INSERT INTO api_keys 
         (user_id, name, key_hash, key_prefix, rate_limit, daily_limit, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        userId,
        name,
        hash,
        prefix,
        options.rateLimit || 100,
        options.dailyLimit || 1000,
        options.expiresAt || null
      ).run();

      return {
        success: true,
        keyId: result.meta?.last_row_id,
        key: fullKey,  // 只在创建时返回一次完整Key
        prefix,
        message: '请妥善保存此Key，它将不会再显示'
      };

    } catch (error) {
      console.error('Create key error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 撤销API Key
   */
  async revokeKey(userId, keyId) {
    try {
      await this.env.DB.prepare(
        `UPDATE api_keys 
         SET is_revoked = 1, is_active = 0 
         WHERE id = ? AND user_id = ?`
      ).bind(keyId, userId).run();

      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取用户的所有Key（仅返回未撤销的活跃Key）
   */
  async getUserKeys(userId) {
    try {
      const { results } = await this.env.DB.prepare(
        `SELECT 
           id, name, key_prefix, 
           use_count, last_used_at, created_at,
           is_active, is_revoked, expires_at,
           rate_limit, daily_limit
         FROM api_keys 
         WHERE user_id = ? 
         AND is_revoked = 0
         ORDER BY created_at DESC`
      ).bind(userId).all();

      return { success: true, keys: results };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 硬删除API Key（从数据库彻底删除）
   */
  async deleteKey(userId, keyId) {
    try {
      await this.env.DB.prepare(
        `DELETE FROM api_keys 
         WHERE id = ? AND user_id = ?`
      ).bind(keyId, userId).run();

      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取Key使用统计
   */
  async getKeyStats(userId, keyId, days = 7) {
    try {
      const { results } = await this.env.DB.prepare(
        `SELECT 
           stat_date, request_count, success_count, error_count,
           avg_response_time, total_bytes_in, total_bytes_out
         FROM api_key_daily_stats 
         WHERE key_id = ? AND user_id = ?
         AND stat_date >= date('now', '-${days} days')
         ORDER BY stat_date DESC`
      ).bind(keyId, userId).all();

      return { success: true, stats: results };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default ApiKeyManager;
