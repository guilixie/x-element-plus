import { parallel, series } from 'gulp'
import { glob, sync } from 'fast-glob'
import { componentsRoot, outDir, projectRoot } from './utils/paths'
import path from 'path'
import { type InputOptions, type OutputOptions, rollup } from 'rollup'
// 解析node_modules引入的第三方库
import { nodeResolve } from '@rollup/plugin-node-resolve'
// 解析commonjs规范代码
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import vue from 'rollup-plugin-vue'
import { buildConfig } from './utils/config'
import { pathRewriter, run, withTaskName } from './utils'
import { type OutputFile, Project, type SourceFile } from 'ts-morph'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { compileScript, parse as parseSFC } from '@vue/compiler-sfc'

// Vue 实际使用 hash-sum 库，使用 完整文件路径的哈希，保证稳定性和唯一性
// eslint-disable-next-line @typescript-eslint/no-var-requires
const hash = require('hash-sum')

// 打包每个组件
const buildEachComponent = async () => {
  const directories = sync('*', {
    cwd: componentsRoot,
    onlyDirectories: true,
  })
  // 分别把components 文件下的组件分别 放到dist/es/components下 和 dist/lib/components下
  const buildTasks = directories.map(async (dirName: string) => {
    const input = path.resolve(componentsRoot, dirName, 'index.ts') // 每个组件的入口
    const inputOptions: InputOptions = {
      input,
      plugins: [nodeResolve(), commonjs(), typescript(), vue()],
      external: (id) => /^vue/.test(id) || /^@x-element-plus/.test(id),
    }
    const bundle = await rollup(inputOptions)
    const outputOptionsList: OutputOptions[] = Object.values(buildConfig).map(
      (config) => {
        return {
          // 指定生成的包的格式
          format: config.format,
          // 要写入的文件
          file: path.resolve(
            config.output.path,
            `components/${dirName}/index.js`,
          ),
          // 将外部模块 ID 映射到路径
          paths: pathRewriter(config.bundle.path), // @x-element-plus => x-element-plus/es or x-element-plus/lib
          exports: 'named', // 用命名的方式导出
        } as OutputOptions
      },
    )
    await Promise.all(
      outputOptionsList.map((outputOptions) => {
        return bundle.write(outputOptions)
      }),
    )
  })
  await Promise.all(buildTasks)
}

// 打包单组件类型定义
const generateEachType = async () => {
  // 生成 .d.ts 我们需要tsconfig
  const project = new Project({
    compilerOptions: {
      allowJs: true,
      declaration: true,
      emitDeclarationOnly: true,
      noEmitOnError: true,
      outDir: path.resolve(outDir, 'types'),
      baseUrl: projectRoot,
      paths: {
        // 代码中使用了 Vue 内部类型（如 defineProps、PropType），但未显式导入，导致 TypeScript 推断类型时直接引用底层模块路径。
        '@vue/shared': ['node_modules/@vue/shared/dist/shared.d.ts'],
        '@x-element-plus/*': ['packages/*'],
      },
      skipLibCheck: true,
      strict: false,
    },
    tsConfigFilePath: path.resolve(projectRoot, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  })

  // ** 任意目录 * 任意文件
  const filePaths = await glob('**/*', {
    cwd: componentsRoot,
    onlyFiles: true,
    absolute: true, // 需要绝对路径
  })

  const sourceFileList: SourceFile[] = []

  const buildTasks = filePaths.map(async (filePath: string) => {
    if (filePath.endsWith('.vue')) {
      const content = await readFile(filePath, 'utf-8')
      const sfc = parseSFC(content)
      const { content: scriptContent } = compileScript(sfc.descriptor, {
        id: hash(filePath),
        isProd: true,
      })
      if (scriptContent) {
        const sourceFile = project.createSourceFile(
          filePath + '.ts',
          scriptContent,
        )
        sourceFileList.push(sourceFile)
      }
    } else if (filePath.endsWith('.ts')) {
      // 把所有ts文件都放到一起 发射成 .d.ts
      const sourceFile = project.addSourceFileAtPath(filePath)
      sourceFileList.push(sourceFile)
    }
  })
  await Promise.all(buildTasks)

  // 仅发出声明文件（.d.ts），默认是放内存中的
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const emitResult = await project.emit({
    emitOnlyDtsFiles: true,
  })
  // 打印编译错误
  const diagnostics = project.getPreEmitDiagnostics()
  diagnostics.forEach((d) => console.error(d.getMessageText()))

  // if (emitResult.getEmitSkipped()) {
  // 	throw new Error('Type declaration emit skipped due to errors.')
  // }

  // 生成文件到指定目录
  const sourceFileTasks = sourceFileList.map(async (sourceFile: SourceFile) => {
    const emitOutput = sourceFile.getEmitOutput()
    const outputFileTasks = emitOutput
      .getOutputFiles()
      .map(async (outputFile: OutputFile) => {
        const filePath = outputFile.getFilePath()
        // 创建目录结构
        await mkdir(path.dirname(filePath), {
          recursive: true,
        })
        // 生成文件，一般不会去lib下寻找类型声明，在es下面寻找 .d.ts，@x-element-plus => x-element-plus/es
        await writeFile(
          filePath,
          pathRewriter('x-element-plus/es')(outputFile.getText()),
          'utf8',
        )
      })
    await Promise.all(outputFileTasks)
  })
  await Promise.all(sourceFileTasks)
}

// 拷贝类型到es/lib下面
const copyEachType = (module: string) => {
  const input = path.resolve(outDir, 'types/components/')
  const output = path.resolve(outDir, module, 'components')
  return async () => run(`cp -r ${input}/* ${output}`)
}

// 打包组件库入口index.js
const buildComponentsEntry = async () => {
  const inputOptions: InputOptions = {
    input: path.resolve(componentsRoot, 'index.ts'),
    plugins: [typescript()],
    external: () => true,
  }
  const bundle = await rollup(inputOptions)
  const outputOptionsList: OutputOptions[] = Object.values(buildConfig).map(
    (config) => {
      return {
        // 指定生成的包的格式
        format: config.format,
        // 要写入的文件
        file: path.resolve(config.output.path, `components/index.js`),
      } as OutputOptions
    },
  )
  await Promise.all(
    outputOptionsList.map((outputOptions) => {
      return bundle.write(outputOptions)
    }),
  )
}

// 打包单独每个组件
export const buildComponents = series(
  parallel(buildEachComponent, buildComponentsEntry),
  generateEachType,
  parallel(
    withTaskName('copyEachType:es', copyEachType('es')),
    withTaskName('copyEachType:lib', copyEachType('lib')),
  ),
)
