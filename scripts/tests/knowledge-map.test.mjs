import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFile,access} from 'node:fs/promises'
import {knowledgeSidebar} from '../../content/.vitepress/knowledge-sidebar.mjs'
const manifest=JSON.parse(await readFile(new URL('../../content/.vitepress/theme/knowledge-archives.json',import.meta.url),'utf8'))

test('the first level contains topic folders rather than mixed outline and article cards',()=>{
  assert.equal(manifest.root.records.length,10)
  assert.equal(manifest.root.columns.length,3)
  assert.ok(manifest.root.records.every(r=>r.kind==='topic'&&r.href.startsWith('/explore/')))
  assert.equal(new Set(manifest.articles.map(a=>a.file)).size,26)
})
test('every substantive article belongs to exactly one topic and overview pages remain above topics',()=>{
  const covered=manifest.topics.flatMap(t=>t.records.map(r=>r.file))
  assert.equal(new Set(covered).size,covered.length)
  assert.deepEqual([...covered].sort(),manifest.articles.filter(a=>!['index.md','topics.md'].includes(a.file)).map(a=>a.file).sort())
  assert.ok(!covered.includes('index.md')&&!covered.includes('topics.md'))
})
test('sampling dependencies and reading-plan-experiment steps preserve their explicit order',()=>{
  assert.deepEqual(manifest.topics.filter(t=>t.chapter==='sampling').map(t=>t.slug),['light-transport','many-lights','ris','spatial-reuse','temporal-reuse','pairwise-mis'])
  for(const slug of ['many-lights','ris','spatial-reuse','pairwise-mis','assets-materials']) {
    assert.deepEqual(manifest.topics.find(t=>t.slug===slug).records.map(r=>r.file.split('/')[0]),['reading','plans','experiments'])
  }
  assert.equal(manifest.topics.find(t=>t.slug==='temporal-reuse').records.length,1)
})
test('all folder routes and article routes exist and sidebar covers every article',async()=>{
  for(const record of [...manifest.root.records,...manifest.articles]) {
    const relative=record.kind==='topic'?record.href.slice(1).replace(/\.html$/,'.md'):`kb/${record.file}`
    await access(new URL(`../../content/${relative}`,import.meta.url))
  }
  const links=[]
  const walk=items=>{for(const item of items){if(item.link?.startsWith('/kb/'))links.push(item.link);if(item.items)walk(item.items)}}
  walk(knowledgeSidebar)
  for(const article of manifest.articles)assert.ok(links.includes(article.href.replace(/\.html$/,'')),article.file)
})
