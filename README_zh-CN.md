# Free BG Remover (免费背景移除工具)

<div align="center">
  <img src="./demo.png" alt="Logo" height="500">
  
  <h3 align="center">Free BG Remover</h3>

  <p align="center">
    一款免费、私密且离线的 AI 图形界面 (GUI) 程序，可瞬间移除图片背景。
    <br />
    <a href="./README.md">English</a> · <a href="#下载">下载</a> · <a href="#开发">开发</a>
  </p>
</div>

---

**Free BG Remover** 是一款基于顶尖 AI 模型 **RMBG-1.4** 的跨平台桌面 GUI 应用程序。它允许您直接在计算机上移除图片背景，无需将任何数据上传到云端。

## ✨ 主要功能

- **🔒 隐私优先**：所有处理均在本地设备上完成。您的照片永远不会上传到任何服务器。
- **⚡️ 极速体验**：使用 ONNX Runtime 优化，实现高效的本地推理（基于 CPU，无需高性能 GPU）。
- **🧠 先进 AI**：由 [RMBG-1.4](https://huggingface.co/briaai/RMBG-1.4) 模型驱动，提供高质量的前景分离效果。
- **📂 批量处理**：支持拖拽多张图片进行一次性批量处理。
- **📜 历史记录**：自动在本地（SQLite）保存处理历史，方便随时查看。
- **🎨 现代界面**：基于 React 和 Tailwind CSS 构建的简洁响应式界面。
- **🌙 深色模式**：支持浅色、深色及跟随系统自动切换的主题。
- **🌐 多语言支持**：提供简体中文和英文界面。

## 📥 下载

前往 [Releases](https://github.com/natumsol/free-bg-remover/releases) 页面下载适用于您平台的安装包：

- **macOS**: `.dmg` (Apple Silicon & Intel)
- **Windows**: `.exe` (x64)

## 🛠 技术栈

- **核心框架**: [Electron](https://www.electronjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **AI 推理**: [Transformers.js](https://huggingface.co/docs/transformers.js), [ONNX Runtime](https://onnxruntime.ai/)
- **图像处理**: [Sharp](https://sharp.pixelplumbing.com/)
- **数据库**: [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **状态管理**: [MobX](https://mobx.js.org/)

## 💻 开发

### 前置要求

- Node.js 20+
- npm

### 安装

1.  **克隆仓库**

    ```bash
    git clone https://github.com/natumsol/free-bg-remover.git
    cd free-bg-remover
    ```

2.  **安装依赖**

    ```bash
    npm install
    ```

    _注意：这将自动为您当前的系统编译原生模块（`sharp`, `better-sqlite3`）。_

3.  **启动开发模式**
    ```bash
    npm start
    ```

### 打包

创建可分发的安装包：

```bash
# 为当前平台构建
npm run make

# 构建 macOS 版本 (Universal/ARM64)
npm run make -- --arch=arm64 --platform=darwin

# 构建 Windows 版本
npm run make -- --arch=x64 --platform=win32
```

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

本应用中使用的 AI 模型 **RMBG-1.4** 由 [BRIA AI](https://bria.ai/) 发布，仅供**非商业用途**（遵循 CC BY-NC 4.0 协议）。如需将该模型用于商业用途，请参阅其许可协议。

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/natumsol">Natumsol</a>
</p>
