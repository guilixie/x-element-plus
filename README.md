# 组件库说明

## 总体结构

- build 负责打包的文件夹 gulp 编译ts，打包样式，打包组件
- dist 存放最终打包的结果
- packages 放着各模块的代码 monorepo
- play 测试组件的项目
- docs 组件库文档代码
- typings 放上类型声明
- .npmrc 项目npm配置，安装依赖的一些配置
- tsconfig 项目ts的配置

## packages模块

- components 存放所有组件的代码，最终通过index.ts 导出所有组件
- theme-chalk 做样式的模块 BEM规范
- utils 主要存放多个模块共享的工具方法
- element-plus 整合导出组件库

## build模块

gulp来控制打包流程，依靠各种插件来完成各种功能。
build目前我们实现了打包样式、工具方法...

- gulpfile.ts 整体打包的脚本，内部会调用各子模块的gulpfile
- packages.ts 打包utils模块、指令、hooks等模块代码

## dist目录

打包之后的所有结果

- es/lib两种格式，两种规范
- theme-chalk
- 最终发布的模块就是dist -> x-element-plus
