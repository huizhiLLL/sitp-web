# ⚡ FC-Predictor-web: 基于 ML 的燃料电池性能预测平台

[![VitePress](https://img.shields.io/badge/VitePress-1.0-646CFF?logo=vite&logoColor=white)](https://vitepress.dev/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

> 集成 **React 交互组件** 与 **VitePress 静态生成** 技术的性能预测平台。

---

## 📖 项目简介

本项目采用 **Docs-as-Code**（文档即代码）理念。利用 VitePress 极速的 SSG 能力保证加载速度与 SEO，并通过 **Islands Architecture**（孤岛架构）嵌入 React 组件，在静态文档中实现复杂的模型推理与数据可视化，兼顾文档阅读与应用交互。

## ✨ 核心特性

- **⚡ 极速架构**：Vite 驱动，提供毫秒级冷启动与热更新 (HMR)，页面秒切。
- **🧩 React 集成**：Markdown 内无缝嵌入 React 组件，负责表单状态管理与逻辑处理。
- **📱 响应式 UI**：基于 Tailwind CSS，完美适配桌面与移动端设备。
- **📊 智能交互**：前端集成数据解析与图表渲染，将模型预测结果可视化展示。
- **👁️ 自动化提取**：(后端配合) 支持 YOLO 视觉算法提取非结构化实验数据。

## 🛠️ 技术栈

| 模块 | 选型 | 理由 |
| :--- | :--- | :--- |
| **框架** | VitePress | 极致 SSG 性能，专注内容呈现 |
| **交互** | React 18 | 构建复杂的预测表单与状态逻辑 |
| **样式** | Tailwind CSS | 原子化 CSS，快速构建统一风格 |
| **构建** | Vite | 秒级启动，高效构建流水线 |

## 📂 目录结构

sitp-web
├── Documentation
│   ├── api.md
│   └── build.md
├── Introduction
│   ├── how-to-use.md
│   └── whats-this.md
├── README.md
├── about.md
├── index.md
├── package-lock.json
└── package.json

## 🚀 快速开始

1. **安装依赖**：`npm install`
2. **本地开发**：`npm run dev`
3. **打包构建**：`npm run build`