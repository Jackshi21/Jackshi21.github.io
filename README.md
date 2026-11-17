# Jack · 知识与实践

当前状态与下次继续入口：[进度与续接](PROGRESS.md)。

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

## 三维档案主页

主页以自行实现的程序化几何生成档案盘，通过 Three.js 渲染。首页按三个知识方向组织十个专题盘；展开专题后，盘片才对应该专题的文章，按阅读、实现计划、实验与验证等环节排列。上下键／滚轮按顺序切换，首页左右键切换方向，Enter 展开专题或查看文章摘要，Esc 返回。详情支持拖动旋转、分层拆解和阅读跳转。索引可搜索标题与摘要，全文搜索沿用 VitePress。

知识层级和阅读顺序统一维护在 `content/.vitepress/knowledge-map.mjs`，侧栏、盘片索引、专题入口和文字总纲由这份结构生成。新增文章后需在对应专题登记，已有文章 URL 保持不变。构建前会自动生成盘片索引和 `content/explore/` 专题页，并刷新 `content/kb/topics.md`。模型、场景、相机运动和终端界面均在本站实现；未包含参考项目 RhineLabUI 的源码、GLB 模型或标志。Three.js 的 MIT 声明见 content/public/licenses/three-MIT.txt。

回归检查：执行 `node --test scripts/tests/*.test.mjs`，覆盖盘片归位、连续切列、悬停与点击、涟漪，以及专题归属、阅读顺序、路由和侧栏完整性。
