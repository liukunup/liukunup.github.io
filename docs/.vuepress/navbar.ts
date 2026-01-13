/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume'

export default defineNavbarConfig([
  { text: '首页', link: '/', icon: 'carbon:home' },
  { text: '博客', link: '/blog/', icon: 'carbon:blog' },
  { text: '标签', link: '/blog/tags/', icon: 'carbon:tag' },
  { text: '归档', link: '/blog/archives/', icon: 'carbon:archive' },
  {
    text: '笔记',
    icon: 'carbon:notebook',
    items: [
      {
        text: 'Vibe Coding',
        icon: 'material-icon-theme:claude',
        link: '/notes/vibe-coding/'
      },
      {
        text: 'Python',
        icon: 'devicon:python',
        link: '/notes/python/'
      },
      {
        text: 'Go',
        icon: 'devicon:go',
        link: '/notes/go/'
      },
      {
        text: 'Java',
        icon: 'devicon:java',
        link: '/notes/java/'
      },
      {
        text: 'C/C++',
        icon: 'devicon:cplusplus',
        link: '/notes/cpp/'
      },
      // {
      //   text: 'Linux',
      //   link: '/notes/linux/'
      // },
      // {
      //   text: 'Docker',
      //   link: '/notes/docker/'
      // },
      // {
      //   text: 'Kubernetes',
      //   link: '/notes/kubernetes/'
      // },
      // {
      //   text: '测试领域',
      //   link: '/notes/testing/'
      // },
      // {
      //   text: '算法领域',
      //   link: '/notes/algorithm/'
      // },
    ]
  },
  {
    text: 'AI',
    icon: 'carbon:ai-label',
    items: [
      {
        text: 'App',
        icon: 'carbon:apps',
        link: '/ai/app/'
      },
      {
        text: 'Agent',
        icon: 'carbon:bot',
        link: '/ai/agent/'
      },
      {
        text: 'MCP',
        icon: 'codicon:mcp',
        link: '/ai/mcp/'
      },
      {
        text: 'Model',
        icon: 'carbon:model',
        link: '/ai/model/'
      },
      {
        text: 'Infra',
        icon: 'carbon:bare-metal-server',
        link: '/ai/infra/'
      },
      {
        text: 'Eval',
        icon: 'carbon:test-tool',
        link: '/ai/eval/'
      },
    ]
  },
  {
    text: '家庭实验室',
    icon: 'carbon:chemistry',
    items: [
      {
        text: '架构设计',
        icon: 'carbon:flow-data',
        link: '/homelab/architecture/'
      },
      {
        text: '部署指南',
        icon: 'iconoir:box-iso',
        link: '/homelab/deploy/'
      },
    ]
  },
  { text: '友链', link: '/friends/', icon: 'carbon:friendship' },
  { text: '关于', link: '/about/', icon: 'carbon:user' },
])
