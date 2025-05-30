import path from 'path'

export const projectRoot = path.resolve(__dirname, '../../')
export const outDir = path.resolve(projectRoot, 'dist')
export const elementPlusRoot = path.resolve(
  projectRoot,
  'packages/element-plus',
)
export const componentsRoot = path.resolve(projectRoot, 'packages/components')
