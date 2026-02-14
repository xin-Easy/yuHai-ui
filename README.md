<div style="text-align: center;">
  <img alt="Logo" src="./src/assets/images/common/logo.png" />
  <h1>蒲公英引擎 (Dandelion Engine)</h1>
  <p><strong>🚀 重新定义小红书自动化 | 现代化、跨平台、智能化的数据采集控制台</strong></p>

  <p>
    <a href="https://github.com/xin-Easy/yuhai-ui/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/xin-Easy/yuhai-ui/build.yml?style=flat-square&logo=github" alt="Build Status" />
    </a>
    <a href="https://github.com/xin-Easy/yuhai-ui/releases">
      <img src="https://img.shields.io/github/v/release/xin-Easy/yuhai-ui?style=flat-square&color=blue" alt="Release" />
    </a>
    <a href="https://github.com/xin-Easy/yuhai">
      <img src="https://img.shields.io/badge/Core-yuHai%20(Python)-blue?style=flat-square&logo=python" alt="Core Engine" />
    </a>
    <a href="./LICENSE">
      <img src="https://img.shields.io/badge/License-Non--Commercial-red.svg?style=flat-square" alt="License" />
    </a>
  </p>

  <p>
    <a href="https://vuejs.org/">
      <img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js" alt="Vue 3" />
    </a>
    <a href="https://tauri.app/">
      <img src="https://img.shields.io/badge/Tauri-2.x-FFC131?style=flat-square&logo=tauri" alt="Tauri 2" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    </a>
    <a href="https://element-plus.org/">
      <img src="https://img.shields.io/badge/Element_Plus-2.x-409EFF?style=flat-square&logo=element-plus" alt="Element Plus" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
    </a>
  </p>

  <p>
    <strong>蒲公英引擎 (Dandelion Engine)</strong> 是专为 <a href="https://www.xiaohongshu.com">小红书 (Xiaohongshu)</a> 定制的下一代自动化工作台。
    它完美融合了 <strong>yuHai Core</strong> 的强大采集能力与 <strong>Tauri v2</strong> 的极致原生体验。
    <br/>
    无需复杂的命令行，只需优雅的点选，即可实现<strong>全量数据抓取</strong>、<strong>无水印资源下载</strong>、<strong>智能 AI 养号</strong>及<strong>自动化内容发布</strong>。
  </p>

  <p style="text-align: center;">
    <a href="#quick-start">快速开始</a> •
    <a href="#core-features">核心特性</a> •
    <a href="#why-dandelion">为什么选择蒲公英</a>
  </p>
</div>

---

> 📢 **核心引擎说明**：本项目 (`蒲公英引擎`) 是 **yuHai** 的可视化操作界面。
>
> 核心采集与自动化能力由 **[yuHai Core (Python)](https://github.com/xin-Easy/yuHai)** 强力驱动。
>
> 👉 **[点击前往 yuHai Core 核心仓库](https://github.com/xin-Easy/yuHai)** 了解底层实现与 API 文档。

---

## 📖 项目简介

在流量为王的时代，如何高效获取数据、智能管理账号成为核心痛点。**蒲公英引擎** 应运而生。它不仅是一个数据采集工具，更是一个集 **"采集-分析-管理-发布"** 于一体的闭环系统。

通过深度集成 `yuHai-core`，我们实现了对浏览器指纹的完美模拟，确保操作的安全与稳定；通过 `Tauri` (Rust)，我们将应用体积压缩到极致，并提供丝滑的桌面级响应速度。

<a id="why-dandelion"></a>
## 💡 为什么选择蒲公英？

| 特性 | 蒲公英引擎 (Dandelion) | 传统 Python 脚本 / 浏览器插件 |
| :--- | :--- | :--- |
| **交互体验** | 🖥️ **现代化 GUI**，数据看板一目了然 | ❌ 仅黑底白字命令行，操作门槛高 |
| **系统资源** | ⚡ **Rust 驱动**，超低内存占用 | 🐢 Electron/Python 进程资源消耗大 |
| **数据管理** | 📊 **内置 ECharts 可视化**，支持 Excel 导出 | ❌ 仅存 CSV/JSON，需手动处理分析 |
| **安全性** | 🔐 **本地加密存储**，指纹深度伪装 | ⚠️ 易被平台检测，账号风险高 |
| **功能覆盖** | ✅ **采集 + 养号 + 发布** 全流程覆盖 | ❌ 通常仅支持单一采集功能 |

<a id="core-features"></a>
## ✨ 核心特性

### 🎨 卓越的 UI/UX 体验
- **🖥️ 现代化桌面体验**: 基于 Tauri 构建，拥有原生应用的性能与体验，支持 Windows、macOS 和 Linux。
- **📊 沉浸式数据看板**: 集成 ECharts，提供实时数据大屏，包括采集趋势、地域分布、词云分析等。
- **🎨 精美 UI 设计**: 采用 Element Plus 结合 Tailwind CSS，提供深色模式、主题切换及流畅的交互动画。
- **📝 任务全流程控制**: 支持创建、暂停、通过 GUI 监控笔记与评论采集任务进度。
- **🔐 安全与隐私**: 数据本地存储，支持多账号隔离管理，保障用户隐私安全。

### 🔥 强大的业务能力 (Powered by [yuHai Core](https://github.com/xin-Easy/yuhai))
- **🕷️ 小红书全方位采集**:
    - **笔记采集**：支持关键词搜索、个人主页笔记批量采集。
    - **评论采集**：高效获取笔记下的用户评论数据，支持千条评论秒级入库。
    - **详情解析**：自动解析笔记的图文、视频资源及元数据，支持 **无水印原图/4K视频下载**。
- **🤖 智能自动化 Agent**:
    - **智能养号 Agent**: 模拟真实用户浏览习惯（停留、滑动、随机点赞），有效提升账号权重 (Cookie Score)。
    - **深度浏览 Agent**: 基于兴趣关键词自动翻页与探索，发现更多长尾流量内容。
- **✍️ 创作者服务**:
    - **自动化发布**: 支持定时、批量自动发布图文、视频笔记。
    - **智能去重**: 对图片/视频进行像素级去重处理 (MD5/Hash 扰动)，防止平台查重。

## 🛠️ 技术栈

本项目采用了业界领先的前端与桌面开发技术栈，适合作为 **Vue 3 + Tauri** 的学习范例：

### 核心框架
- **Frontend**: [Vue 3](https://vuejs.org/) (Composition API + Script Setup)
- **Desktop**: [Tauri v2](https://tauri.app/) (Rust) - *更小、更快、更安全*
- **Build Tool**: [Vite](https://vitejs.dev/)

### UI & 样式
- **Component Library**: [Element Plus](https://element-plus.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + SCSS
- **Iconography**: [Iconify](https://iconify.design/)

### 状态与路由
- **State Management**: [Pinia](https://pinia.vuejs.org/) (with persistence)
- **Routing**: [Vue Router](https://router.vuejs.org/)

### 工具与库
- **Visualization**: [ECharts](https://echarts.apache.org/) - *专业级数据可视化*
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Utilities**: [VueUse](https://vueuse.org/), [Lodash](https://lodash.com/)

## 📂 项目结构

```text
f:\data\Daymychen\art-design-pro
├── src/
│   ├── api/             # API 接口定义
│   ├── assets/          # 静态资源 (图片, 样式, SVG)
│   ├── components/      # Vue 组件 (Core & Business)
│   ├── composables/     # 组合式函数 (Hooks)
│   ├── config/          # 全局配置
│   ├── router/          # 路由配置
│   ├── store/           # Pinia 状态管理
│   ├── utils/           # 工具函数
│   └── views/           # 页面视图
│       ├── dashboard/   # 数据看板
│       ├── agent-start/ # Agent 启动与管理
│       ├── crawler-task/# 采集任务管理
│       └── ...
├── src-tauri/           # Tauri 后端 (Rust)
│   ├── resources/       # 核心资源 (yuHai-core.zip)
│   ├── src/             # Rust 源码
│   └── tauri.conf.json  # Tauri 配置文件
└── scripts/             # 构建脚本
```

<a id="quick-start"></a>
## 🚀 快速开始

### 环境准备

确保您的开发环境已安装以下工具：

- **Node.js**: >= 20.0.0
- **pnpm**: >= 8.0.0
- **Rust**: 最新稳定版 (仅开发桌面端需要)

### 安装依赖

```bash
pnpm install
```

### 开发模式

> **⚠️ 核心资源说明**
>
> 启动桌面端前，请确保已下载核心引擎：
> 1. 前往 [yuHai Core Releases](https://github.com/xin-Easy/yuHai/releases) 下载最新版 `yuHai-core.zip`。
> 2. 将文件放置于 `src-tauri/resources/` 目录下。
> 3. 确保文件名为 `yuHai-core.zip` (请勿解压)。

**启动 Web 开发预览 (仅前端)**:
```bash
pnpm dev:web
```

**启动桌面端开发 (Tauri + 前端)**:
```bash
pnpm dev
```
*注意：首次启动会自动解压 `yuHai-core.zip` 资源到应用数据目录。*

### 构建生产包

```bash
pnpm build
```

## � Star History

[![Star History Chart](https://api.star-history.com/svg?repos=xin-Easy/yuhai-ui&type=Date)](https://star-history.com/#xin-Easy/yuhai-ui&Date)

## �📧 联系方式

- **Email**: yuhai2553@gmail.com
- **GitHub Issues**: [https://github.com/xin-Easy/yuHai-ui/issues](https://github.com/xin-Easy/yuHai-ui/issues)

## ⚠️ 免责声明

本项目 (`蒲公英引擎` / `yuHai`) 仅供 **个人学习、学术研究** 使用。
- **严禁用于任何商业用途**。
- **严禁用于非法抓取、大规模攻击目标网站**。
- 使用本工具产生的一切法律后果由使用者自行承担。

## 📄 License

[Non-Commercial License](LICENSE)

---

<p style="text-align: center;">
  <strong>Keywords</strong>: 小红书采集, Xiaohongshu Crawler, 小红书自动化, 养号工具, 笔记下载, 无水印, Tauri, Vue 3, Element Plus, Python Crawler, RPA, Marketing Automation
</p>
