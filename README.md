# 图片尺寸调整

<img src="http://mbimage.ybvips.com/electron/imageresize/256x256.png" width="256" alt="App Icon" />

## Mac & Windows下快速批量调整图片尺寸

[![GitHub release](https://img.shields.io/github/release/xpf0000/ImageResize.svg)](https://github.com/xpf0000/ImageResize/releases)  [![Total Downloads](https://img.shields.io/github/downloads/xpf0000/ImageResize/total.svg)](https://github.com/xpf0000/ImageResize/releases)

图片尺寸调整 是一款Mac & Windows下快速批量调整图片尺寸的应用 
## ✨ 特性

- 简洁明了的图形操作界面
- 多线程并行处理 极致的处理速度

## 💽 安装稳定版

[GitHub](https://github.com/xpf0000/ImageResize/releases) 提供了已经编译好的稳定版安装包，当然你也可以自己克隆代码编译打包。

## 🖥 应用界面

![screen0.png](http://mbimage.ybvips.com/electron/imageresize/screen0.png)
![screen1.png](http://mbimage.ybvips.com/electron/imageresize/screen1.png)

## ⌨️ 本地开发

### 克隆代码

```bash
git clone git@github.com:xpf0000/ImageResize.git
```

### 安装依赖

```bash
cd ImageResize
yarn install
```

无法安装electron的建议使用淘宝的 npm 源

```bash
npm config set registry 'https://registry.npm.taobao.org'
export ELECTRON_MIRROR='https://npm.taobao.org/mirrors/electron/'
export SASS_BINARY_SITE='https://npm.taobao.org/mirrors/node-sass'
```

如果喜欢 [Yarn](https://yarnpkg.com/)，也可以使用 `yarn` 安装依赖

### 开发模式

```bash
yarn run dev
```

### 编译打包

```bash
yarn run build
```

完成之后可以在项目的 `release` 目录看到编译打包好的应用文件

## 🛠 技术栈

- [Electron](https://electronjs.org/)
- [Vue3](https://vuejs.org/)
- [Vite](https://vitejs.cn/)
- [Element-Plus](https://element-plus.gitee.io/zh-CN/)
- [sharp](https://github.com/lovell/sharp)

## 📜 开源许可

基于 [MIT license](https://opensource.org/licenses/MIT) 许可进行开源。
