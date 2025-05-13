import { withInstall } from '@x-element-plus/utils/withInstall'
import Icon from './src/icon.vue'
const ElIcon = withInstall(Icon)
export { ElIcon }
export default ElIcon
export type { IconProps } from './src/icon'
declare module 'vue' {
  export interface GlobalComponents {
    ElIcon: typeof ElIcon
  }
}
