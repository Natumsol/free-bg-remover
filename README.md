# Free BG Remover

<div align="center">
  <img src="resources/images/icon.png" alt="Logo" width="128" height="128">
  
  <h3 align="center">Free BG Remover</h3>

  <p align="center">
    A free, private, and offline AI tool to remove image backgrounds instantly.
    <br />
    <a href="./README_zh-CN.md">简体中文</a> · <a href="#download">Download</a> · <a href="#development">Development</a>
  </p>
</div>

---

**Free BG Remover** is a cross-platform desktop application powered by the state-of-the-art **RMBG-1.4** AI model. It allows you to remove backgrounds from images directly on your computer without uploading any data to the cloud.

## ✨ Key Features

*   **🔒 Privacy First**: All processing happens locally on your device. Your photos are never uploaded to any server.
*   **⚡️ Lightning Fast**: Optimized with ONNX Runtime for efficient local inference (CPU-based, no heavy GPU required).
*   **🧠 Advanced AI**: Powered by the [RMBG-1.4](https://huggingface.co/briaai/RMBG-1.4) model for high-quality foreground separation.
*   **📂 Batch Processing**: Drag and drop multiple images to process them all at once.
*   **📜 History Management**: Automatically saves your processing history locally (SQLite) for easy access.
*   **🎨 Modern UI**: Clean, responsive interface built with React and Tailwind CSS.
*   **🌙 Dark Mode**: Support for Light, Dark, and System Auto themes.
*   **🌐 Multi-language**: Available in English and Simplified Chinese.

## 📥 Download

Go to the [Releases](https://github.com/natumsol/free-bg-remover/releases) page to download the installer for your platform:

*   **macOS**: `.dmg` (Apple Silicon & Intel)
*   **Windows**: `.exe` (x64)

## 🛠 Tech Stack

*   **Core**: [Electron](https://www.electronjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **AI Inference**: [Transformers.js](https://huggingface.co/docs/transformers.js), [ONNX Runtime](https://onnxruntime.ai/)
*   **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/)
*   **Database**: [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **State Management**: [MobX](https://mobx.js.org/)

## 💻 Development

### Prerequisites

*   Node.js 20+
*   npm

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/natumsol/free-bg-remover.git
    cd free-bg-remover
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```
    *Note: This will automatically compile native modules (`sharp`, `better-sqlite3`) for your system.*

3.  **Start the app in development mode**
    ```bash
    npm start
    ```

### Packaging

To create a distributable installer:

```bash
# Build for your current platform
npm run make

# Build for macOS (Universal/ARM64)
npm run make -- --arch=arm64 --platform=darwin

# Build for Windows
npm run make -- --arch=x64 --platform=win32
```

## 📄 License

This project is licensed under the [MIT License](LICENSE).

The AI model **RMBG-1.4** used in this application is released by [BRIA AI](https://bria.ai/) and is available for **non-commercial use** under CC BY-NC 4.0. For commercial use of the model, please refer to their licensing agreement.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/natumsol">Natumsol</a>
</p>