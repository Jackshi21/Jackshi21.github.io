import { defineConfig } from 'vitepress'

const section = (text: string, items: [string, string][]) => ({
  text, collapsed: false,
  items: items.map(([text, link]) => ({ text, link: `/kb/${link}` }))
})

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
    sidebar: {
      '/kb/': [
        section('从这里开始', [['知识库导览', ''], ['主题索引', 'topics'], ['研究与实现工作流', 'workflow']]),
        section('阅读笔记', [
          ['多光源采样与 ReSTIR', 'reading/many-light-sampling'],
          ['RIS 与蓄水池', 'reading/restir-ris'],
          ['空间复用', 'reading/restir-reuse'],
          ['历史复用', 'reading/restir-temporal'],
          ['随机 Pairwise MIS', 'reading/restir-stochastic-pairwise'],
          ['模型与材质资源', 'reading/assets-gltf'],
        ]),
        section('实验与验证', [
          ['Gallery 与 PBR 模型', 'experiments/asset-gallery'],
          ['Cornell Box 与 MIS', 'experiments/cornell-mis'],
          ['多光源采样', 'experiments/many-light-sampling'],
          ['最小 RIS 基线', 'experiments/ris-baseline'],
          ['静态空间复用', 'experiments/spatial-reuse'],
          ['Pairwise MIS 成本对照', 'experiments/pairwise-mis'],
        ]),
        section('实现计划', [
          ['模型与材质接入', 'plans/asset-gallery'],
          ['多光源采样', 'plans/many-light-sampling'],
          ['RIS 基线', 'plans/ris-baseline'],
          ['空间复用', 'plans/spatial-reuse'],
          ['Pairwise MIS', 'plans/pairwise-mis'],
        ]),
        section('项目档案', [
          ['渲染器架构', 'architecture'], ['项目进度', 'progress'],
          ['依赖说明', 'dependencies'], ['设备验证', 'validation'],
          ['Cornell Box 验证', 'validation-cornell'], ['材质与降噪', 'validation-materials'],
        ]),
      ],
    },
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
