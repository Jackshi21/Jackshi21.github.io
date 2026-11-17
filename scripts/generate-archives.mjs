import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {knowledgeChapters,knowledgeTopics} from '../content/.vitepress/knowledge-map.mjs'

const root=fileURLToPath(new URL('../',import.meta.url))
const kb=path.join(root,'content/kb')
const href=file=>`/kb/${file.replace(/index\.md$/,'').replace(/\.md$/,'.html')}`
const guide=['# 知识库总纲','','先看知识地图，再进入专题。每个专题内部按原理、实现、实验的顺序阅读；项目记录单独归档。','','[返回三维专题总览](/) · [知识库说明](./index.md)','','## 建议阅读路线','','光传输与 MIS → 多光源采样 → RIS 与蓄水池 → 空间样本复用 → 历史样本复用 / Pairwise MIS。','','这条路线表达学习依赖，不代表每个专题都已实现。历史复用当前仍以阅读记录为主。','']
for(const [chapterIndex,chapter] of knowledgeChapters.entries()) {
  guide.push(`## ${chapterIndex+1}. ${chapter.title}`,'',chapter.description,'')
  for(const topic of knowledgeTopics.filter(t=>t.chapter===chapter.id)) {
    guide.push(`### ${topic.title}`,'',topic.description,'',`[在盘片中展开专题](/explore/${topic.slug}.html)`,'')
    for(const [index,[file,stage]] of topic.steps.entries())guide.push(`${index+1}. **${stage}**：[${(await readFile(path.join(kb,file),'utf8')).match(/^#\s+(.+)$/m)?.[1]||file}](${href(file)})`)
    guide.push('')
  }
}
await writeFile(path.join(kb,'topics.md'),guide.join('\n'))
// Preserve existing article IDs while adding explicit topic membership.
const types=['导览与索引','阅读笔记','实验与验证','实现计划','项目档案']
const groups=[['index.md','topics.md','workflow.md'],...(await Promise.all(['reading','experiments','plans'].map(async dir=>(await readdir(path.join(kb,dir))).filter(f=>f.endsWith('.md')).sort().map(f=>`${dir}/${f}`)))),(await readdir(kb)).filter(f=>f.endsWith('.md')&&!['index.md','topics.md','workflow.md'].includes(f)).sort()]
const articles=[]
for(const [lane,files] of groups.entries())for(const file of files) {
  const markdown=await readFile(path.join(kb,file),'utf8')
  const title=markdown.match(/^#\s+(.+)$/m)?.[1]||file
  const plain=markdown.replace(/```[\s\S]*?```/g,'').replace(/\[([^\]]+)\]\([^\)]+\)/g,'$1').replace(/<[^>]+>/g,'').replace(/[*`#_$]/g,'')
  const paragraphs=plain.split(/\n\s*\n/).map(s=>s.replace(/\n/g,' ').trim()).filter(s=>s.length>35&&!s.startsWith('|')&&!s.startsWith('-')&&!s.startsWith('阶段'))
  const topic=knowledgeTopics.find(t=>t.steps.some(([p])=>p===file))
  articles.push({id:`K-${String(articles.length+1).padStart(3,'0')}`,kind:'article',file,title,en:file.replace(/\.md$/,'').toUpperCase().replaceAll('/',' / '),department:types[lane],category:types[lane],date:markdown.match(/2026-\d{2}-\d{2}/)?.[0]||'',lead:'Jack',clearance:'公开 · 可阅读',abstract:(paragraphs[0]||'从公式到实现，记录可以接续的理解与实践。').slice(0,230),findings:[],source:'Raytrace 图形学知识库',href:href(file),words:plain.replace(/\s/g,'').length,topicSlug:topic?.slug||null})
}
const topics=knowledgeTopics.map((topic,index)=>({
  ...topic,number:index+1,chapterTitle:knowledgeChapters.find(c=>c.id===topic.chapter).title,
  columns:[topic.title],
  records:topic.steps.map(([file,stage],step)=>{
    const article=articles.find(a=>a.file===file)
    if(!article)throw new Error(`Topic ${topic.slug} references missing article ${file}`)
    return {...article,category:topic.title,stage,step:step+1,totalSteps:topic.steps.length}
  }),
}))
const rootView={columns:knowledgeChapters.map(c=>c.title),records:topics.map(topic=>({
  id:`T-${String(topic.number).padStart(2,'0')}`,kind:'topic',slug:topic.slug,title:topic.title,en:`TOPIC / ${topic.slug.toUpperCase()}`,category:topic.chapterTitle,department:topic.chapterTitle,abstract:topic.description,href:`/explore/${topic.slug}.html`,words:0,articleCount:topic.records.length,stages:topic.records.map(r=>r.stage),
}))}
await writeFile(path.join(root,'content/.vitepress/theme/knowledge-archives.json'),JSON.stringify({articles,chapters:knowledgeChapters,root:rootView,topics},null,2)+'\n')
await mkdir(path.join(root,'content/explore'),{recursive:true})
for(const topic of topics)await writeFile(path.join(root,`content/explore/${topic.slug}.md`),`---\nlayout: page\ntitle: ${topic.title}\ndescription: ${topic.description}\n---\n\n<!-- Generated from knowledge-map.mjs -->\n<KnowledgeHome topic="${topic.slug}" />\n`)
console.log(`Generated ${articles.length} articles inside ${topics.length} topics and ${knowledgeChapters.length} chapters.`)
