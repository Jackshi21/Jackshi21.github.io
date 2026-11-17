import {knowledgeChapters,knowledgeTopics} from './knowledge-map.mjs'

export const knowledgeSidebar=[
  {text:'总纲',items:[{text:'知识库说明',link:'/kb/'},{text:'知识地图与阅读路线',link:'/kb/topics'}]},
  ...knowledgeChapters.map((chapter,index)=>({
    text:`${index+1}. ${chapter.title}`,collapsed:false,
    items:knowledgeTopics.filter(topic=>topic.chapter===chapter.id).map(topic=>({
      text:topic.title,link:`/explore/${topic.slug}.html`,collapsed:true,
      items:topic.steps.map(([file,stage],step)=>({text:`${String(step+1).padStart(2,'0')} ${stage}`,link:`/kb/${file.replace(/index\.md$/,'').replace(/\.md$/,'')}`})),
    })),
  })),
]
