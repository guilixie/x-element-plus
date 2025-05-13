import { series, parallel } from 'gulp'
import { run, withTaskName } from './utils'

// 1. 打包样式 2. 打包工具方法 3. 打包所有组件 4. 打包单个组件 5. 生成组件库 6. 发布组件
export default series(
  withTaskName('clean', async () => run('rm -rf ./dist')),
  parallel(
    withTaskName('buildPackages', async () =>
      run('pnpm run --filter "@x-element-plus/*" --parallel build'),
    ),
    withTaskName('buildFullComponent', async () =>
      run('pnpm run build buildFullComponent'),
    ), // buildFullComponent是一个任务名
    withTaskName('buildComponents', async () =>
      run('pnpm run build buildComponents'),
    ), // buildComponents是一个任务名
  ),
)

export * from './full-component'
export * from './components'
