import { ElIcon } from '@x-element-plus/components'
import type { App } from 'vue'

const components = [ElIcon]

const install = (app: App) => {
  components.forEach((component) => app.use(component))
}

export default {
  install,
}

export * from '@x-element-plus/components'
