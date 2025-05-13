import { createApp } from 'vue'
import App from './App.vue'
import ElIcon from '@x-element-plus/components/icon'
import '@x-element-plus/theme-chalk/src/index.scss'
const app = createApp(App)
app.use(ElIcon)
app.mount('#app')
