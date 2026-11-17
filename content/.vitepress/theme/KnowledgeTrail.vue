<script setup>
import {computed} from 'vue'
import {useData} from 'vitepress'
import knowledge from './knowledge-archives.json'
const {page}=useData()
const context=computed(()=>{
  const file=page.value.relativePath.replace(/^kb\//,'')
  const topic=knowledge.topics.find(item=>item.steps.some(([path])=>path===file))
  if(!topic)return null
  const index=topic.records.findIndex(record=>record.file===file)
  return {topic,index,record:topic.records[index],next:topic.records[index+1]}
})
</script>
<template>
  <nav v-if="context" class="doc-knowledge-trail" aria-label="文章所属知识层级">
    <div><a href="/">知识库总纲</a><span>/</span><a :href="`/explore/${context.topic.slug}.html?doc=${context.record.id}`">{{context.topic.title}}</a><span>/</span><strong>{{context.record.stage}}</strong></div>
    <p>本专题第 {{context.index+1}} / {{context.topic.records.length}} 环节 <a v-if="context.next" :href="context.next.href">下一步：{{context.next.stage}} →</a><a v-else :href="`/explore/${context.topic.slug}.html`">返回专题目录 ↗</a></p>
  </nav>
</template>
