/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume'

export const zhNavbar = defineNavbarConfig([
  { text: '首页', link: '/', icon: 'material-symbols:home-outline' },
  { text: '博客', link: '/blog/' },
  { text: '标签', link: '/blog/tags/' },
  { text: '归档', link: '/blog/archives/' },
  {
    text: '笔记',
    items: [
      { text: 'Python', link: '/notes/python/搭建开发环境.md' },
      { text: 'Go', link: '/notes/go/搭建开发环境.md' },
    ]
  },
  {
    text: '家庭实验室',
    items: [
      {
        text: '架构设计',
        link: '/homelab/architecture/',
        activeMatch: '^/homelab/architecture/',
      },
      {
        text: '部署指南',
        link: '/homelab/deploy/',
        activeMatch: '^/homelab/deploy/',
      },
    ]
  },
])

export const enNavbar = defineNavbarConfig([
  { text: 'Home', link: '/en/', icon: 'material-symbols:home-outline' },
  { text: 'Blog', link: '/en/blog/' },
  { text: 'Tags', link: '/en/blog/tags/' },
  { text: 'Archives', link: '/en/blog/archives/' },
  {
    text: 'Notes',
    items: [
      { text: 'Python', link: '/en/notes/python/setup-development-environment.md' },
      { text: 'Go', link: '/en/notes/go/setup-development-environment.md' },
    ]
  },
  {
    text: 'HomeLab',
    items: [
      { text: 'Architecture', link: '/en/homelab/architecture/' },
      { text: 'Deployment', link: '/en/homelab/deploy/' },
    ]
  },
])
