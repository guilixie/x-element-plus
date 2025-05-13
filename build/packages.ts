// 打包工具、指令、hooks 等
import { dest, parallel, series, src } from 'gulp'
import { buildConfig } from './utils/config'
import { projectRoot } from './utils/paths'
import path from 'path'
import ts from 'gulp-typescript'
import { run, withTaskName } from './utils'

export default function (dirname: string, pkgName: string) {
  const tsConfig = path.resolve(projectRoot, 'tsconfig.json')
  const inputs = ['**/*.ts', '!gulpfile.ts', '!node_modules']
  const outDir = path.resolve(dirname, 'dist')
  const tasks = Object.entries(buildConfig).map(([_, config]) => {
    const output = path.resolve(outDir, config.output.name)
    return series(
      withTaskName(`build:${pkgName}:${config.output.name}`, () => {
        const tsProject = ts.createProject(tsConfig, {
          declaration: true,
          strict: false,
          module: config.module,
        })
        return src(inputs).pipe(tsProject()).pipe(dest(output))
      }),
      withTaskName(`copy:${pkgName}:${config.output.name}`, () => {
        // 复制到dist中，放到es下面的utils和lib下面的utils
        return src(`${output}/**`).pipe(
          dest(path.resolve(config.output.path, pkgName)),
        )
      }),
    )
  })
  return series(
    withTaskName(`clean:${pkgName}:dist`, async () =>
      run(`rm -rf ${path.resolve(dirname, 'dist')}`),
    ),
    parallel(...tasks),
  )
}
