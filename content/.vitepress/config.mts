import { defineConfig } from 'vitepress'
import {knowledgeSidebar} from './knowledge-sidebar.mjs'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Jack · 知识与实践',
  description: '从公式到像素。图形学阅读、渲染实现与可复现的实验。',
  base: '/',
  srcExclude: ['kb/licenses/**'],
  markdown: { math: true },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#f7f8f2' }],
  ],
  sitemap: { hostname: 'https://jackshi21.github.io' },
  themeConfig: {
    logo: '/favicon.svg',
    siteTitle: 'Jack / 知识与实践',
    nav: [
      { text: '首页', link: '/' },
      { text: '知识库', link: '/kb/topics', activeMatch: '/kb/' },
      { text: '关于', link: '/about' },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/Jackshi21' }],
    sidebar: {'/kb/':knowledgeSidebar},
    outline: { label: '本页目录', level: [2, 3] },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '返回顶部', sidebarMenuLabel: '文章目录',
    darkModeSwitchLabel: '外观', darkModeSwitchTitle: '切换到深色', lightModeSwitchTitle: '切换到浅色',
    search: {
      provider: 'local',
      options: { translations: {
        button: { buttonText: '搜索笔记', buttonAriaLabel: '搜索知识库' },
        modal: { noResultsText: '没有找到相关笔记', resetButtonTitle: '清空搜索',
          footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } },
      } },
    },
    footer: { message: '把知识写下来，让实践有迹可循。', copyright: 'Jack · 图形学与实时渲染' },
  },
})
