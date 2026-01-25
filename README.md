# AI Background Remover

一个基于 Electron 的跨平台抠图应用，使用 AI 模型（RMBG-1.4）在本地进行背景移除处理。所有处理都在您的设备上进行，100% 离线和隐私保护。

## 技术栈

- **Electron** - 跨平台桌面应用框架
- **React** - 用户界面库
- **Vite** - 快速的构建工具
- **TypeScript** - 类型安全的 JavaScript
- **MobX** - 状态管理
- **Tailwind CSS** - 实用优先的 CSS 框架
- **shadcn/ui** - 组件库设计系统
- **@huggingface/transformers** - AI 模型推理
- **briaai/RMBG-1.4** - 背景移除 AI 模型
- **Sharp** - 高性能图像处理

## 功能特性

✨ **AI 驱动** - 使用先进的 RMBG-1.4 模型进行精准抠图  
🔒 **100% 离线** - 所有处理在本地完成，保护您的隐私  
⚡ **快速处理** - 单张图片处理时间 < 1 秒  
🔄 **左右滑动对比** - 直观对比抠图前后效果  
🎨 **背景编辑** - 添加纯色或图片背景  
📦 **批量处理** - 支持一次处理多张图片  
💾 **实时预览** - 带进度显示的处理视图  
🌓 **现代化 UI** - 流畅动画和精美设计  
🖼️ **支持多种格式** - JPG、PNG、WEBP 等格式

## 开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

### 图标生成

更新应用图标后，运行以下命令重新生成所有尺寸：

```bash
npm run generate-icons
```

详细说明请查看 [scripts/README.md](./scripts/README.md)

### 构建应用

```bash
# 打包应用
npm run package

# 创建安装包
npm run make
```

### 发布

```bash
npm run publish
```

## 项目结构

```
free-bg-remover/
├── src/
│   ├── components/       # React 组件
│   │   ├── App.tsx       # 主应用组件
│   │   ├── Sidebar.tsx   # 侧边栏
│   │   ├── DropZone.tsx  # 拖放区域
│   │   └── ImagePreview.tsx # 图片预览
│   ├── stores/           # MobX 状态管理
│   │   └── AppStore.ts   # 应用状态
│   ├── types/            # TypeScript 类型定义
│   ├── lib/              # 工具函数
│   ├── main.ts           # Electron 主进程
│   ├── preload.ts        # 预加载脚本
│   ├── process.ts        # AI 模型处理逻辑
│   ├── renderer.tsx      # 渲染进程入口
│   └── index.css         # 全局样式
├── resources/
│   └── models/           # AI 模型文件
│       └── briaai/
│           └── RMBG-1.4/
├── design/               # 设计参考
├── forge.config.ts       # Electron Forge 配置
└── package.json          # 项目依赖

```

## 使用方法

### 基础流程

1. **启动应用** - 首次启动时，应用会自动加载 AI 模型（约需 5-10 秒）
2. **选择图片** - 点击"Select Image"按钮或直接拖放图片到应用窗口
3. **实时处理** - 看到图片预览和处理进度（带动画遮罩）
4. **滑动对比** - 处理完成后，拖动滑块左右对比原图和抠图结果
5. **编辑背景** - 点击"Edit Background"添加纯色或图片背景
6. **保存导出** - 点击"Save Image"导出 PNG 格式图片

### 高级功能

- **背景定制**
  - 选择 12 种预设颜色
  - 使用颜色选择器自定义颜色
  - 上传图片作为背景
  - 保持透明背景

- **批量处理** - 点击侧边栏的"Batch Process"一次处理多张图片
- **历史记录** - 点击"History"查看最近 50 张处理的图片

更多详细功能说明请查看 [FEATURES.md](./FEATURES.md)

## 系统要求

- **操作系统**: Windows 10+, macOS 10.13+, Linux
- **内存**: 至少 4GB RAM
- **磁盘空间**: 约 500MB（包含模型文件）

## 许可证

MIT License

Copyright (c) 2026 Natumsol

## 作者

Natumsol (natumsol@gmail.com)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 鸣谢

- [RMBG-1.4 模型](https://huggingface.co/briaai/RMBG-1.4) by Bria AI
- [Transformers.js](https://github.com/xenova/transformers.js) by Xenova
- 设计灵感来自现代化的桌面应用
