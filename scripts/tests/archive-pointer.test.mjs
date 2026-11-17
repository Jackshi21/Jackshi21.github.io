import {test} from 'node:test'
import assert from 'node:assert/strict'
import {KnowledgeScene} from '../../content/.vitepress/theme/KnowledgeScene.js'

test('a click selects the pressed preview even if its rising geometry changes the release hit',t=>{
  const previousWindow=globalThis.window
  globalThis.window=new EventTarget()
  t.after(()=>{globalThis.window=previousWindow})
  const canvas=new EventTarget()
  canvas.style={}
  canvas.setPointerCapture=()=>{}
  const scene=Object.create(KnowledgeScene.prototype)
  scene.renderer={domElement:canvas}
  scene.events=new AbortController()
  scene.detailTarget=0
  let hit={index:1,cell:{lane:0,row:1}}
  scene.pick=()=>hit
  const selected=[],hovered=[]
  scene.onSelect=(...args)=>selected.push(args)
  scene.setHovered=entry=>hovered.push(entry)
  scene.bindEvents()
  const emit=(type,fields={})=>canvas.dispatchEvent(Object.assign(new Event(type),{button:0,clientX:100,clientY:100,pointerId:1,pointerType:'mouse',...fields}))
  emit('pointerdown')
  hit={index:2,cell:{lane:0,row:2}}
  emit('pointerup')
  assert.deepEqual(selected,[[1,{cell:{lane:0,row:1}}]])
  const before=hovered.length
  emit('pointermove')
  assert.equal(hovered.length,before,'post-click mouse jitter must not immediately replace selected information')
  emit('pointermove',{clientX:110})
  assert.equal(hovered.at(-1).index,2)
  scene.events.abort()
})
