import { spawn } from 'child_process'
import { projectRoot } from './paths'

export const withTaskName = <T extends (...args: unknown[]) => unknown>(
  name: string,
  fn: T,
) => Object.assign(fn, { displayName: name })

// 在 node 中使用子进程来运行脚本
export const run = async (command: string) => {
  return new Promise<void>((resolve, _) => {
    const [cmd, ...args] = command.split(' ')
    const app = spawn(cmd, args, {
      cwd: projectRoot,
      stdio: 'inherit', // 直接将这个子进程输出
      shell: true, // 默认情况下，linux 支持 rm -rf，windows 需要安装 git bash
    })
    app.on('close', (code: number) => {
      if (code !== 0) {
        const errMsg = `${command} process exited with code ${code}`
        console.error(errMsg)
      }
      resolve()
    })
  })
}

export const pathRewriter = (path: string) => {
  return (id: string) => {
    return id.replaceAll('@x-element-plus', path)
  }
}
