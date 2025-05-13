import path from 'path'
import { outDir } from './paths'
export const buildConfig = {
  esm: {
    module: 'ESNext', // tsconfig输出的结果es6模块
    format: 'esm', // 需要配置格式化之后的模块规范
    output: {
      name: 'es', // 打包到dist目录下的哪个目录
      path: path.resolve(outDir, 'es'),
    },
    bundle: {
      path: 'x-element-plus/es', // 单独组件打包时，路径中包含@x-element-plus更改为这种格式
    },
  },
  cjs: {
    module: 'CommonJS',
    format: 'cjs',
    output: {
      name: 'lib',
      path: path.resolve(outDir, 'lib'),
    },
    bundle: {
      path: 'x-element-plus/lib',
    },
  },
}

export type BuildConfig = typeof buildConfig
