// 解析node_modules引入的第三方库
import { nodeResolve } from '@rollup/plugin-node-resolve'
// 解析commonjs规范代码
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import vue from 'rollup-plugin-vue'
import { type InputOptions, type OutputOptions, rollup } from 'rollup'
import { elementPlusRoot, outDir, projectRoot } from './utils/paths'
import path from 'path'
import { parallel, series } from 'gulp'
import { mkdir, readdir, writeFile } from 'fs/promises'
import { buildConfig } from './utils/config'
import { pathRewriter, run, withTaskName } from './utils'
import { glob } from 'fast-glob'
import {
  ModuleKind,
  OutputFile,
  Project,
  ScriptTarget,
  SourceFile,
} from 'ts-morph'

// 打包组件库 x-element-plus
const buildFull = async () => {
  // rollup打包的配置
  const inputOptions: InputOptions = {
    input: path.resolve(elementPlusRoot, 'index.ts'),
    plugins: [nodeResolve(), commonjs(), typescript(), vue()],
    external: (id) => /^vue/.test(id), // 表示打包的时候不打包vue相关代码
  }

  // 整个组件库 两种使用方式：import 导入组件库、在浏览器中使用script
  // esm、umd

  const outputOptionsList: OutputOptions[] = [
    {
      format: 'umd', // 打包的格式
      file: path.resolve(outDir, 'index.js'),
      name: 'XElementPlus', // 全局可访问的名称
      exports: 'named', // 用命名的方式导出
      globals: {
        // 表示使用的是全局的vue
        vue: 'Vue',
      },
    },
    {
      format: 'esm',
      file: path.resolve(outDir, 'index.esm.js'),
    },
  ]

  const bundle = await rollup(inputOptions)

  return Promise.all(
    outputOptionsList.map((outputOptions) => {
      return bundle.write(outputOptions)
    }),
  )
}

// 打包x-element-plus入口
const buildEntry = async () => {
  const entryFiles = await readdir(elementPlusRoot, { withFileTypes: true })
  const input = entryFiles.reduce((acc: string[], f) => {
    if (f.isFile() && !['package.json'].includes(f.name)) {
      acc = acc.concat(path.resolve(elementPlusRoot, f.name))
    }
    return acc
  }, [])
  const inputOptions: InputOptions = {
    input,
    plugins: [nodeResolve(), commonjs(), typescript(), vue()],
    external: (id: string) => /^vue/.test(id) || /^@x-element-plus/.test(id),
  }
  const bundle = await rollup(inputOptions)
  return Promise.all(
    Object.values(buildConfig).map((config) => {
      const outputOptions = {
        format: config.format,
        dir: config.output.path,
        paths: pathRewriter(config.bundle.path),
        exports: 'named', // 用命名的方式导出
      } as OutputOptions
      return bundle.write(outputOptions)
    }),
  )
}

// 生成入口的类型声明文件
const generateEntryType = async () => {
  // 生成 .d.ts 我们需要tsconfig
  const project = new Project({
    compilerOptions: {
      allowJs: true,
      declaration: true,
      module: ModuleKind.ESNext,
      emitDeclarationOnly: true,
      noEmitOnError: true,
      outDir: path.resolve(outDir, 'types'),
      baseUrl: projectRoot,
      // rootDir: elementPlusRoot,
      target: ScriptTarget.ESNext,
      skipLibCheck: true,
      strict: false,
    },
    tsConfigFilePath: path.resolve(projectRoot, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
  })

  // *.ts 任意ts文件
  const filePaths = await glob('*.ts', {
    cwd: elementPlusRoot,
    onlyFiles: true,
    absolute: true, // 需要绝对路径
  })

  const sourceFileList: SourceFile[] = []

  filePaths.forEach((filePath: string) => {
    // 把所有ts文件都放到一起 发射成 .d.ts
    const sourceFile = project.addSourceFileAtPath(filePath)
    sourceFileList.push(sourceFile)
  })

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
          outputFile.getText().replaceAll('@x-element-plus', '.'),
          'utf8',
        )
      })
    await Promise.all(outputFileTasks)
  })
  await Promise.all(sourceFileTasks)
}

// 拷贝入口类型到es/lib下面
const copyEntryType = (module: string) => {
  const input = path.resolve(outDir, 'types/element-plus/')
  const output = path.resolve(outDir, module)
  return async () => run(`cp -r ${input}/* ${output}`)
}

// 拷贝源文件package.json
const copySourceFile = () => {
  const input = path.resolve(elementPlusRoot, 'package.json')
  return async () => run(`cp ${input} ${outDir}`)
}

// gulp适合流程控制 和 代码的转译 不具备打包功能
// 一般搭配 rollup webpack等打包
export const buildFullComponent = parallel(
  buildFull,
  buildEntry,
  series(
    generateEntryType,
    parallel(
      withTaskName('copyEntryType:es', copyEntryType('es')),
      withTaskName('copyEntryType:lib', copyEntryType('lib')),
    ),
  ),
  withTaskName('copySourceFile', copySourceFile()),
)
