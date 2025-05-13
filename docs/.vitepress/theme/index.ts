import DefaultTheme from 'vitepress/theme'
import '@x-element-plus/theme-chalk/src/index.scss'
import ElIcon from '@x-element-plus/components/icon'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.use(ElIcon) // 注册组件
  },
}
