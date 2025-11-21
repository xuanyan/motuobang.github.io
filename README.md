# Supabase 管理后台（静态版）

## 概述
- 基于 Supabase 的轻量管理后台，前端使用 `Bootstrap + jQuery`，入口为 `public/admin.html`。
- 纯静态运行（适配 GitHub Pages），前端通过 `@supabase/supabase-js` 完成登录与会话管理，不依赖后端接口。
- 配置通过静态 `public/config.js` 注入（包含 `SUPABASE_URL` 与 `SUPABASE_ANON_KEY`）。

## 功能
- 登录与会话恢复（邮箱 + 密码）
- 头部显示欢迎语与右上角退出登录按钮
- 左侧菜单：
  - 欢迎：展示欢迎文案（优先显示“显示名称”，无则显示邮箱）
  - IOS提审：包含两个示例按钮（“准备审核”“审核完成”）
  - 设置：可以修改“显示名称”和“密码”（两次输入一致校验；当 Supabase 返回 `same_password` 视为成功）

## 目录结构
- `public/admin.html`：静态入口页面（布局、菜单、视图切换、登录与设置逻辑）
- `public/config.js`：静态配置注入（`window.__CONFIG__`）
- `server.js`：本地开发用的 Node/Express 服务（根路由返回 `admin.html`）
- `package.json`：依赖与启动脚本

## 关键实现位置
- 入口与头部布局：`public/admin.html:11-17`
- 左侧菜单与视图：
  - 菜单三项：`public/admin.html:41-45`
  - 欢迎视图：`public/admin.html:52-55`
  - IOS提审视图：`public/admin.html:77-81`
  - 设置视图（纵向输入+确认密码）：`public/admin.html:57-75`
- 登录态恢复与欢迎语：`public/admin.html:100-118`
- 登录提交与切换到后台：`public/admin.html:121-146`
- 退出登录：`public/admin.html:151-161`
- 菜单切换逻辑：`public/admin.html:163-176`
- 设置提交逻辑（含 `same_password` 处理）：`public/admin.html:180-231`
- 本地服务根路由返回入口：`server.js:21-23`

## 配置
- 纯静态运行（GitHub Pages）：
  - 编辑 `public/config.js` 中的值：
    ```js
    window.__CONFIG__ = {
      SUPABASE_URL: "https://<your-project-ref>.supabase.co",
      SUPABASE_ANON_KEY: "<your-anon-key>"
    };
    ```
  - 不要将 `SUPABASE_SERVICE_ROLE_KEY` 暴露到前端。
- 本地开发（可选）：
  - 使用 `.env`（非必须，仅供服务端动态注入与接口演示）：
    - `SUPABASE_URL=https://<your-project-ref>.supabase.co`
    - `SUPABASE_ANON_KEY=<your-anon-key>`

## 本地运行
- 安装依赖：`npm install`
- 启动服务：`npm start`
- 打开：`http://localhost:3000/`（根路径返回 `admin.html`）

## 部署到 GitHub Pages
- 将 `public` 目录的内容部署到 Pages（仓库根或 `docs/`）。
- 入口为 `admin.html`：
  - 用户页：`https://<username>.github.io/admin.html`
  - 项目页：`https://<username>.github.io/<repo>/admin.html`
- 如果希望根路径直接显示页面，可自行将 `admin.html` 重命名为 `index.html`（当前保持 `admin.html` 以符合需求）。

## 技术说明
- Supabase 浏览器 SDK 使用 ESM 导入：
  - `import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1"`
- 由于 `jsDelivr` 的 UMD 路径在 v2 不再提供（会 404），故使用 `esm.sh`。

## 安全与限制
- 前端仅使用 `ANON KEY`；请勿在任何静态文件中包含 `SERVICE ROLE KEY`。
- 当前“IOS提审”按钮为示例 UI；未连接后端或工作流。
- 静态部署场景下不提供服务端接口；若后续需要服务端能力（如审核状态持久化、角色控制），建议新增后端并使用 RLS/服务端逻辑。