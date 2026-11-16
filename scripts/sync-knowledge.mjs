import { cp, mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const source = path.resolve(process.argv[2] || 'D:/raytrace/docs')
const destination = path.join(root, 'content', 'kb')
const excluded = new Set(['node_modules', '.vitepress', 'index.md', 'package.json', 'package-lock.json'])
await mkdir(destination, { recursive: true })
for (const entry of await readdir(source, { withFileTypes: true })) {
  if (excluded.has(entry.name)) continue
  if (!entry.isDirectory() && !entry.name.endsWith('.md')) continue
  await cp(path.join(source, entry.name), path.join(destination, entry.name), { recursive: true })
}
// The original home uses absolute links; give the public knowledge section its own introduction.
await writeFile(path.join(destination, 'index.md'), `# Raytrace 图形学知识库\n\n从公式推到着色器，用可复现的渲染实验检验实现。\n\n## 选择一个入口\n\n- [主题索引](./topics.md)：按主题串起阅读、计划与实验。\n- [多光源采样与 ReSTIR](./reading/many-light-sampling.md)：从采样问题开始阅读。\n- [Gallery 与 PBR 模型](./experiments/asset-gallery.md)：查看渲染器的模型与材质实践。\n- [Cornell Box 与 MIS](./experiments/cornell-mis.md)：对照公式理解光源采样。\n- [渲染器架构](./architecture.md)：理解从场景数据到 Vulkan Ray Query 的路径。\n- [研究与实现工作流](./workflow.md)：阅读、规划、实现与经验回填。\n\n正文保留项目里的命令、实验环境与结果。文中的本机路径用于说明复现环境。\n`)
const stats = { notes: 0, images: 0 }
async function count(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'licenses') continue
    const filename = path.join(dir, entry.name)
    if (entry.isDirectory()) await count(filename)
    else if (entry.name.endsWith('.md')) stats.notes++
    else if (/\.(png|jpe?g|webp|svg)$/i.test(entry.name)) stats.images++
  }
}
await count(destination)
await writeFile(path.join(root, 'content', '.vitepress', 'theme', 'knowledge-stats.json'), JSON.stringify(stats, null, 2) + '\n')
console.log(`Synced ${stats.notes} notes and ${stats.images} images from ${source}`)
