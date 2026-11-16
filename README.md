# Jack · 知识与实践

个人首页与 Raytrace 图形学知识库。目标地址：https://jackshi21.github.io

## 本地使用

需要 Node.js 20 或更新版本。

```powershell
npm ci
npm run dev
npm run build
npm run preview
```

## 维护内容

文章位于 `content/kb/`，支持 Markdown、LaTeX 公式、图片和全文搜索。个人首页在 `content/.vitepress/theme/KnowledgeHome.vue`，导航和目录在 `content/.vitepress/config.mts`。

执行 `npm run sync` 可重新复制 `D:/raytrace/docs` 的文档与实验图片，然后执行 `npm run build`。在其他设备可以执行 `npm run sync -- <文档目录>` 指定来源。同步为覆盖式复制，不删除目标中已有的文章；源文档删除或重命名时，请同步调整本站对应文件和导航。

## GitHub Pages

1. 在 `Jackshi21` 下创建公开仓库 `Jackshi21.github.io`。
2. 将本目录作为独立仓库推送到 `main`。
3. 在仓库 Settings → Pages → Build and deployment 中选择 **GitHub Actions**。
4. Actions 中的 Publish knowledge site 工作流成功后，访问目标地址。

以后推送 `main` 会自动构建和更新网页。仓库只包含本站文档和资源，不包含渲染器构建目录与本机工具。
