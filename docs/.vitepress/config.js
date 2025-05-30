module.exports = {
  title: 'Element Plus',
  description: 'Vue3 Components',
  themeConfig: {
    lastUpdated: '最后更新时间',
    docsDir: 'docs',
    editLinks: true,
    editLinkText: '编辑此网站',
    repo: 'https://gitee.com/login',
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present Guili',
    },
    nav: [
      { text: '指南', link: '/guide/installation', activeMatch: '/guide/' },
      { text: '组件', link: '/component/icon', activeMatch: '/component/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/quickStart' },
          ],
        },
      ],
      '/component/': [
        {
          text: '基础组件',
          items: [{ text: '图标', link: '/component/icon' }],
        },
      ],
    },
  },
}
