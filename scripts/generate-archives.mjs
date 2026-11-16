import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const kb = path.join(root, 'content/kb')
const columns = ['导览与索引', '阅读笔记', '实验与验证', '实现计划', '项目档案']
const groups = [
  ['index.md', 'topics.md', 'workflow.md'],
  (await readdir(path.join(kb, 'reading'))).filter(f => f.endsWith('.md')).map(f => `reading/${f}`),
  (await readdir(path.join(kb, 'experiments'))).filter(f => f.endsWith('.md')).map(f => `experiments/${f}`),
  (await readdir(path.join(kb, 'plans'))).filter(f => f.endsWith('.md')).map(f => `plans/${f}`),
  (await readdir(kb)).filter(f => f.endsWith('.md') && !['index.md', 'topics.md', 'workflow.md'].includes(f)),
]
const records = []
for (let lane = 0; lane < groups.length; lane++) {
  for (const file of groups[lane]) {
    const markdown = await readFile(path.join(kb, file), 'utf8')
    const title = markdown.match(/^#\s+(.+)$/m)?.[1] || file
    const plain = markdown.replace(/```[\s\S]*?```/g, '').replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/<[^>]+>/g, '').replace(/[*`#_$]/g, '')
    const paragraphs = plain.split(/\n\s*\n/).map(s => s.replace(/\n/g, ' ').trim()).filter(s => s.length > 35 && !s.startsWith('|') && !s.startsWith('-') && !s.startsWith('阶段'))
    records.push({
      id: `K-${String(records.length + 1).padStart(3, '0')}`,
      title, en: file.replace(/\.md$/, '').toUpperCase().replaceAll('/', ' / '),
      department: columns[lane], category: columns[lane], date: markdown.match(/2026-\d{2}-\d{2}/)?.[0] || '',
      lead: 'Jack', clearance: '公开 · 可阅读', abstract: (paragraphs[0] || '从公式到实现，记录可以接续的理解与实践。').slice(0, 230),
      findings: [], source: 'Raytrace 图形学知识库', href: `/kb/${file.replace(/index\.md$/, '').replace(/\.md$/, '.html')}`,
      words: plain.replace(/\s/g, '').length,
    })
  }
}
await writeFile(path.join(root, 'content/.vitepress/theme/knowledge-archives.json'), JSON.stringify({ categories: columns, columns, records }, null, 2) + '\n')
console.log(`Generated ${records.length} real article discs in ${columns.length} columns.`)
