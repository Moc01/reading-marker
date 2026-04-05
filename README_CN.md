<div align="center">

<img src="icon128.png" alt="Reading Marker" width="96" />

# Reading Marker

**在任意网页上标记阅读位置，按一下标记，再按一下跳回。**

专为长文阅读、技术文档和 AI 对话界面（Claude、ChatGPT 等）设计。

[![Chrome 扩展](https://img.shields.io/badge/Chrome-扩展程序-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](#安装)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-34A853?style=flat-square&logo=googlechrome&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**[English](README.md)** | **简体中文**

</div>

---

## 解决什么问题

你在读一篇长文，或者在翻阅与 AI 的对话。想回去看看前面的内容——一滚动，**就找不到刚才读到哪了**。

Reading Marker 用一个快捷键解决这个问题。

## 使用方式

| 操作 | 快捷键 | 效果 |
|------|--------|------|
| **设置书签** | `Alt+B` | 在当前阅读位置放置一条橙色标记线 |
| **跳回书签** | `Alt+B` | 滚动到远处后再按，自动跳回标记位置 |
| **更新书签** | `Alt+B` | 在标记附近按，更新标记到新位置 |
| **清除书签** | `Esc` | 移除标记线 |

> **macOS 用户**：请使用 `Ctrl+Shift+B` 代替 `Alt+B`（Option+B 在 Mac 上会输入特殊字符）。

<!-- 有 demo GIF 后取消注释：
<div align="center">
  <img src="assets/demo.gif" alt="Reading Marker 演示" width="720" />
</div>
-->

## 功能特点

- **一键三用** — `Alt+B` 根据上下文自动判断：设置、跳回、还是更新
- **兼容 SPA 页面** — 已在 Claude、ChatGPT 等 AI 对话界面上测试通过
- **智能滚动容器检测** — 自动找到正确的可滚动区域，不会误选侧边栏
- **非侵入式设计** — 低调的橙色标记线 + 小标签，清除后完全消失
- **最小权限** — 仅请求 `activeTab` 和 `scripting`，不收集数据、不访问网络
- **无障碍友好** — 尊重系统的 `prefers-reduced-motion` 设置

## 安装

### 从源码安装（开发者模式）

1. 下载或克隆本仓库：
   ```bash
   git clone https://github.com/Moc01/reading-marker.git
   ```
2. 打开 Chrome，地址栏输入 `chrome://extensions/`
3. 右上角打开 **开发者模式**
4. 点击 **加载已解压的扩展程序**，选择克隆下来的文件夹
5. 完成！在任意页面按 `Alt+B` 试试

> **提示**：如果 `Alt+B` 与其他扩展冲突，可以在 `chrome://extensions/shortcuts` 中自定义快捷键。

<!-- Chrome Web Store 上架后取消注释：
### 从 Chrome 应用商店安装
[**安装 Reading Marker →**](https://chrome.google.com/webstore/detail/YOUR_ID)
-->

## 工作原理

```
用户按下 Alt+B
       │
       ▼
Chrome Commands API ──→ background.js（Service Worker）
       │                      │
       │              chrome.tabs.sendMessage()
       │                      │
       ▼                      ▼
content.js 收到消息 ──→ toggleMarker()
       │
       ├─ 没有标记？ → 在视窗 35% 高度处放置标记线
       ├─ 在标记附近？ → 更新标记位置
       └─ 离标记很远？ → 平滑滚动回标记处
```

扩展使用 Chrome 的 [Commands API](https://developer.chrome.com/docs/extensions/reference/api/commands) 在**浏览器层面**捕获快捷键，完全绕过页面 JavaScript 的拦截。这对于 Claude、ChatGPT 等会在捕获阶段拦截键盘事件的 SPA 页面至关重要。

## 项目结构

```
reading-marker/
├── manifest.json     ← 扩展配置、权限声明、快捷键定义
├── background.js     ← Service Worker：接收快捷键 → 转发给 content script
├── content.js        ← 核心逻辑：标记放置、滚动检测、跳回
├── style.css         ← 标记线 + Toast 通知的样式
├── icon48.png        ← 工具栏图标
└── icon128.png       ← 商店图标
```

## 解决的技术难题

<details>
<summary><strong>SPA 页面的键盘事件拦截</strong></summary>

Claude、ChatGPT 等应用在捕获阶段使用 `stopImmediatePropagation()` 拦截键盘事件，导致 content script 的 `keydown` 监听器无法收到事件。我们通过 Chrome Commands API 在浏览器层面捕获快捷键，在任何页面 JavaScript 执行之前就完成拦截。

</details>

<details>
<summary><strong>复杂布局中的滚动容器检测</strong></summary>

现代 Web 应用使用嵌套的 `div` 容器（`overflow-y: auto`）代替窗口级滚动。简单的检测算法可能会错误地选择侧边栏而非主内容区域。我们通过**最小宽度过滤**（至少为视窗的 40% 或 480px）筛选候选元素，并选择滚动溢出分数最高的容器。

</details>

<details>
<summary><strong>受限页面的错误处理</strong></summary>

Chrome 扩展无法在 `chrome://`、`edge://` 或应用商店页面注入脚本。所有 `chrome.*` API 调用均用 `try/catch` 包裹，防止错误堆积在扩展管理器中。

</details>

## 自定义

### 修改快捷键

1. 打开 `chrome://extensions/shortcuts`
2. 找到 **Reading Marker** → **Toggle reading marker**
3. 点击输入框，按下你想要的组合键

### 修改标记颜色

编辑 `style.css`，把 `#ff6b35` 替换成你喜欢的颜色：

```css
.rm-marker-line {
  background: linear-gradient(90deg, transparent 0%, #ff6b35 8%, #ff6b35 92%, transparent 100%);
  box-shadow: 0 0 8px rgba(255, 107, 53, 0.4);
}
```

## 参与贡献

欢迎贡献代码！

1. Fork 本仓库
2. 创建特性分支（`git checkout -b feat/my-feature`）
3. 提交更改（`git commit -m 'feat: add my feature'`）
4. 推送分支（`git push origin feat/my-feature`）
5. 发起 Pull Request

## 许可证

[MIT](LICENSE) — 随意使用。
