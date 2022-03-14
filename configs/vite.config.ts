import type { UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'

const renderPath = path.resolve(__dirname, '../src/render/')

const config: UserConfig = {
  base: './',
  plugins: [vue()],
  root: renderPath,
  resolve: {
    alias: {
      '@': renderPath
    }
  },
  css: {
    // css预处理器
    preprocessorOptions: {
      scss: {
        // 引入 var.scss 这样就可以在全局中使用 var.scss中预定义的变量了
        // 给导入的路径最后加上 ;
        additionalData: '@import "@/components/Theme/Variables.scss";'
      }
    }
  }
}

const serverConfig: UserConfig = {
  server: {
    port: 3000
  },
  ...config
}

const serveConfig: UserConfig = {
  server: {
    port: 3000,
    open: true
  },
  ...config
}

const buildConfig: UserConfig = {
  mode: 'production',
  build: {
    outDir: '../../dist/render',
    assetsDir: 'static',
    rollupOptions: {
      output: {
        entryFileNames: 'static/js/[name].[hash].js',
        chunkFileNames: 'static/js/[name].[hash].js',
        assetFileNames: 'static/[ext]/[name].[hash].[ext]',
        manualChunks(id) {
          console.log('id: ', id)
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString()
          }
          return undefined
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  ...config
}

export default {
  serveConfig,
  serverConfig,
  buildConfig
}
