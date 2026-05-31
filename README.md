# 多平台内容发布工具

面向创作者的多平台内容发布工作台。用户输入一份原文后，系统会自动适配微信公众号、知乎、B站、小红书以及用户自定义平台的内容格式，并支持一键模拟发布、发布历史记录和平台账号状态管理。

## 题目要求对照

题目要求：

> 很多创作者需要在公众号、知乎、B站、小红书等平台同步发布内容，但格式适配很麻烦。请设计并实现一个工具，帮助创作者提升发布效率和便捷性。用户在工具中输入内容，可自动适配各平台格式与风格，并支持一键发布（可选模拟发布）。需给出扩展更多平台的架构设计。

当前实现：

| 要求 | 实现情况 |
| --- | --- |
| 用户输入内容 | 首页工作台支持标题和 Markdown 正文输入 |
| 自动适配平台格式与风格 | 内置微信公众号、知乎、B站、小红书专属适配规则 |
| 一键发布 | 支持选择多个平台后一键模拟发布 |
| 发布结果记录 | 发布任务和发布结果写入数据库 |
| 可扩展更多平台 | 支持用户在前端新增自定义平台并配置适配规则 |
| 提升效率 | 一份原文生成多平台版本，支持逐平台微调 |

当前版本是一个可演示的全栈 MVP。真实平台发布 API 尚未接入，发布流程使用模拟发布，符合题目中“可选模拟发布”的要求。

## 功能概览

- 原文编辑：输入标题和 Markdown 正文。
- 平台适配：自动生成各平台标题、正文、标签和字数提醒。
- 手动微调：每个平台的适配内容可以单独编辑保存。
- 模拟发布：选择多个平台后一键发布，结果写入后端数据库。
- 发布历史：查看、清空每次模拟发布结果。
- 平台管理：启用/禁用内置平台，新增、编辑、删除自定义平台。
- 账号管理：统一展示平台账号状态；B站预留真实 OAuth 授权入口，其他平台使用模拟账号。
- 数据重置：首页“格式化数据”会把数据库恢复为默认演示数据。

## 技术栈

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma 7
- SQLite / libSQL

## 项目结构

```text
src/
  app/                  # Next.js 页面路由和 API 路由
    api/                # 后端 HTTP 接口入口
    accounts/           # 账号管理页
    platforms/          # 平台管理页
    page.tsx            # 工作台首页

  modules/              # 前端页面模块
    workspace/          # 内容编辑、平台选择、适配预览、发布历史
    platform-rules/     # 平台管理、平台表单、规则展示
    accounts/           # 账号状态、授权入口

  domain/               # 业务领域模型和规则
    publisher/          # 内容、适配结果、发布记录类型与适配器
    platforms/          # 内置平台定义、平台能力模型
    accounts/           # 账号状态模型

  server/               # 后端业务服务层
    workspace/          # 工作台聚合数据、数据重置
    platforms/          # 平台查询、创建、编辑、删除
    adaptation/         # 原文到平台适配内容的生成
    accounts/           # 账号 Provider Registry
    publishing/         # 模拟发布

  lib/
    db.ts               # Prisma 数据库客户端

prisma/
  schema.prisma         # 数据库模型
  migrations/           # 数据库迁移
```

## 架构说明

项目采用 Next.js 全栈单体架构：

```text
页面组件
  -> modules/*/api.ts
  -> app/api/*
  -> server/*
  -> Prisma
  -> SQLite / libSQL
```

平台扩展采用数据库驱动：

- 内置平台使用专属适配器，保证微信公众号、知乎、B站、小红书有不同风格。
- 自定义平台由用户在前端表单配置规则，后端使用配置化适配器生成内容。
- 页面层不写平台专属判断，只消费后端返回的平台列表、适配内容和账号状态。

## 核心数据模型

- `Content`：原文内容。
- `Platform`：平台定义、启用状态、UI 信息、适配配置。
- `PlatformAccount`：平台账号授权或模拟账号状态。
- `AdaptedContent`：各平台适配后的内容。
- `PublishTask`：发布任务。
- `PublishRecord`：发布结果记录。

## API 概览

```text
GET    /api/workspace
POST   /api/workspace/reset

GET    /api/platforms
POST   /api/platforms
PATCH  /api/platforms/[id]
DELETE /api/platforms/[id]

GET    /api/accounts
POST   /api/accounts/[platform]/auth-url
GET    /api/accounts/[platform]/status
POST   /api/accounts/[platform]/disconnect
GET    /api/auth/[platform]/callback

PATCH  /api/content/[id]
PATCH  /api/adapted-content/[id]

POST   /api/publish
GET    /api/publish/records
DELETE /api/publish/records
```

## 本地运行

安装依赖：

```bash
npm install
```

准备数据库：

```bash
npx prisma migrate dev
npx prisma generate
```

启动开发服务：

```bash
npm run dev
```

打开：

```text
http://localhost:3000
```

## 环境变量

基础配置：

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

B站 OAuth 授权需要额外配置：

```env
BILIBILI_CLIENT_ID="你的 B站 Client ID"
BILIBILI_CLIENT_SECRET="你的 B站 Client Secret"
```

未配置 B站 OAuth 时，账号页会提示缺少配置，但模拟发布和自定义平台功能不受影响。

## 自定义平台

进入 `/platforms`，点击“新增平台”，可以配置：

- 平台标识
- 平台名称和短名称
- 描述和颜色
- 标题 / 正文长度限制
- 必填字段
- 风格说明
- 标题后缀
- 正文前缀 / 后缀
- 固定标签
- 是否清理 Markdown
- 是否压缩空行

创建后：

- 工作台会自动出现该平台。
- 修改原文会生成该平台适配内容。
- 可以手动微调适配正文。
- 可以参与一键模拟发布。
- 账号页会显示模拟账号状态。

## 常用命令

```bash
npm run dev      # 启动开发服务
npm run lint     # ESLint 检查
npm run build    # 生产构建
```

## 当前边界

当前版本是可演示 MVP，不是生产级发布系统：

- 真实发布 API 尚未接入。
- 自定义平台只支持适配和模拟发布。
- B站只预留 OAuth 授权入口，不执行真实文章发布。
- 暂未实现多用户、多草稿、任务队列、失败重试和生产级密钥管理。
