-- ========================================================
-- API Key 功能数据库设计
-- Cloudflare D1 Database Schema
-- ========================================================

-- ========================================================
-- 1. 用户档案表（已有，保持不变）
-- ========================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clerk_user_id TEXT UNIQUE NOT NULL,
    nickname TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clerk_user_id ON user_profiles(clerk_user_id);

-- ========================================================
-- 2. API Keys 表（核心新增）
-- ========================================================
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- 关联到用户
    user_id TEXT NOT NULL,
    
    -- API Key的标识名称（用户自定义，如"我的APP"、"测试环境"）
    name TEXT NOT NULL,
    
    -- 存储API Key的哈希值（SHA-256，数据库中不存储明文Key）
    key_hash TEXT UNIQUE NOT NULL,
    
    -- API Key前缀（用于显示给用户，完整Key只在创建时显示一次）
    key_prefix TEXT NOT NULL,
    
    -- 使用限制
    rate_limit INTEGER DEFAULT 100,  -- 每分钟请求数限制
    daily_limit INTEGER DEFAULT 1000, -- 每日请求数限制
    
    -- 使用统计
    use_count INTEGER DEFAULT 0,     -- 累计使用次数
    last_used_at DATETIME,           -- 最后使用时间
    last_used_ip TEXT,               -- 最后使用的IP
    
    -- 状态
    is_active BOOLEAN DEFAULT 1,     -- 是否启用
    is_revoked BOOLEAN DEFAULT 0,    -- 是否已撤销
    
    -- 过期时间（可选，NULL表示永不过期）
    expires_at DATETIME,
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- ========================================================
-- 3. API 使用日志表（用于统计和监控）
-- ========================================================
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- 使用的API Key ID
    key_id INTEGER NOT NULL,
    
    -- 用户ID
    user_id TEXT NOT NULL,
    
    -- 请求信息
    method TEXT NOT NULL,            -- GET, POST, PUT, DELETE
    path TEXT NOT NULL,               -- 请求路径
    query_params TEXT,                -- 查询参数（可选，JSON）
    
    -- 响应信息
    status_code INTEGER,              -- HTTP状态码
    response_time INTEGER,            -- 响应时间（毫秒）
    
    -- 客户端信息
    ip_address TEXT,                 -- 客户端IP
    user_agent TEXT,                  -- 客户端UA
    
    -- 错误信息
    error_message TEXT,
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引（按时间范围查询和用户查询）
CREATE INDEX IF NOT EXISTS idx_usage_logs_key_id ON api_usage_logs(key_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON api_usage_logs(created_at);

-- ========================================================
-- 4. API Key 每日使用统计表（用于统计和限流）
-- ========================================================
CREATE TABLE IF NOT EXISTS api_key_daily_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    key_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    
    -- 统计日期
    stat_date DATE NOT NULL,
    
    -- 使用统计
    request_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    
    -- 总流量（字节）
    total_bytes_in INTEGER DEFAULT 0,
    total_bytes_out INTEGER DEFAULT 0,
    
    -- 响应时间统计
    avg_response_time INTEGER DEFAULT 0,  -- 毫秒
    max_response_time INTEGER DEFAULT 0,
    
    -- 唯一IP数
    unique_ips INTEGER DEFAULT 0,
    
    -- 时间戳
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(key_id, stat_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_key_date ON api_key_daily_stats(key_id, stat_date);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON api_key_daily_stats(user_id, stat_date);

-- ========================================================
-- 5. 白名单/黑名单表（可选，增强安全性）
-- ========================================================
CREATE TABLE IF NOT EXISTS api_key_ip_whitelist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_id INTEGER NOT NULL,
    ip_address TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key_id, ip_address)
);

CREATE TABLE IF NOT EXISTS api_key_ip_blacklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_id INTEGER NOT NULL,
    ip_address TEXT NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key_id, ip_address)
);

-- ========================================================
-- 触发器：自动更新 updated_at
-- ========================================================
CREATE TRIGGER IF NOT EXISTS update_api_keys_timestamp 
AFTER UPDATE ON api_keys
BEGIN
    UPDATE api_keys SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_daily_stats_timestamp 
AFTER UPDATE ON api_key_daily_stats
BEGIN
    UPDATE api_key_daily_stats SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
