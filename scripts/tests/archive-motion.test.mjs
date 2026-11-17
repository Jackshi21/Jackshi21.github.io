import { test } from 'node:test'
import assert from 'node:assert/strict'
import {ArchiveMotion,HOVER_LIFT,PREVIEW_LIFT,cellKey,resolveCell,rippleHeight,slotPosition} from '../../content/.vitepress/theme/archive-motion.mjs'

const groups=[[0,1,2],[3,4,5,6,7,8],[9,10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24,25]]
const advance=(motion,seconds) => {for(let i=0;i<Math.ceil(seconds*120);i++)motion.step(1/120)}

test('hover previews a lower physical card without changing selection, camera target or ripples',()=>{
  const motion=new ArchiveMotion(groups)
  const selected=motion.select(0,null,true),cell={...motion.cell}
  const hovered=motion.hover(1)
  advance(motion,1)
  assert.equal(motion.active,selected)
  assert.equal(motion.index,0)
  assert.deepEqual(motion.cell,cell)
  assert.equal(motion.ripples.length,0)
  assert.ok(Math.abs(hovered.lift-HOVER_LIFT)<.002)
  assert.ok(hovered.lift<selected.lift)
})
test('leaving hover lowers only the preview and keeps the selected card raised',()=>{
  const motion=new ArchiveMotion(groups)
  const selected=motion.select(0,null,true)
  motion.hover(1)
  advance(motion,.5)
  motion.hover(null)
  advance(motion,1.5)
  assert.equal(motion.entries.size,1)
  assert.equal(motion.active,selected)
  assert.ok(Math.abs(selected.lift-PREVIEW_LIFT)<.002)
})
test('clicking a preview promotes the same physical card smoothly to selected',()=>{
  const motion=new ArchiveMotion(groups)
  motion.select(0,null,true)
  const hovered=motion.hover(25,{cell:{lane:-1,row:5}})
  advance(motion,.4)
  const before=hovered.lift,velocity=hovered.velocity
  assert.equal(motion.select(25,{cell:{lane:-1,row:5}}),hovered)
  assert.equal(hovered.lift,before)
  assert.equal(hovered.velocity,velocity)
  assert.equal(motion.hovered,null)
  advance(motion,1)
  assert.ok(Math.abs(hovered.lift-PREVIEW_LIFT)<.002)
})
test('hovering the selected slot keeps selected height and distinguishes repeated copies',()=>{
  const motion=new ArchiveMotion(groups)
  const selected=motion.select(0,null,true)
  assert.equal(motion.hover(0,{cell:{lane:0,row:0}}),null)
  const duplicate=motion.hover(0,{cell:{lane:5,row:0}})
  assert.notEqual(duplicate,selected)
  motion.step(1/60,false,true)
  assert.equal(selected.lift,PREVIEW_LIFT)
  assert.equal(duplicate.lift,HOVER_LIFT)
})
test('both column boundaries continue to the adjacent physical slot',()=>{
  const motion=new ArchiveMotion(groups)
  motion.select(0,null,true)
  for(const direction of [-1,1,1,1,1,1,1,1,1,1,1]) {
    const before=slotPosition(motion.cell)
    const next=motion.navigation('lane',direction)
    motion.select(next.index,next.navigation)
    assert.ok(Math.abs(slotPosition(motion.cell).x-before.x-direction*4.7)<1e-9)
  }
})
test('row wrapping advances one physical row, including unequal category sizes',()=>{
  const motion=new ArchiveMotion(groups)
  motion.select(2,null,true)
  const next=motion.navigation('row',1)
  assert.equal(next.index,0)
  motion.select(next.index,next.navigation)
  assert.deepEqual(motion.cell,{lane:0,row:3})
  const lane=motion.navigation('lane',1)
  motion.select(lane.index,lane.navigation)
  assert.equal(motion.cell.lane,1)
  assert.equal(motion.cell.row,3)
  assert.equal(groups[1][motion.cell.row%6],motion.index)
})
test('clicking a repeated visible column preserves its physical position',()=>{
  assert.deepEqual(resolveCell(groups,25,{lane:4,row:5},{cell:{lane:9,row:5}}),{lane:9,row:5})
})
test('outgoing and incoming discs retain their own slots and labels until settled',()=>{
  const motion=new ArchiveMotion(groups)
  const first=motion.select(0,null,true),firstPosition=slotPosition(first.cell)
  const second=motion.select(1)
  assert.equal(first.index,0)
  assert.equal(second.index,1)
  assert.equal(second.lift,0)
  motion.step(1/60)
  assert.ok(first.lift<1.1&&first.lift>0)
  assert.ok(second.lift>0&&second.lift<1.1)
  assert.deepEqual(slotPosition(first.cell),firstPosition)
  assert.notEqual(cellKey(first.cell),cellKey(second.cell))
  advance(motion,1.5)
  assert.equal(motion.entries.size,1)
  assert.equal(motion.active,second)
})
test('rapid reverse selection resumes the same returning physical disc',()=>{
  const motion=new ArchiveMotion(groups)
  const first=motion.select(0,null,true)
  motion.select(1)
  advance(motion,.15)
  const lift=first.lift,velocity=first.velocity
  assert.equal(motion.select(0),first)
  assert.equal(first.lift,lift)
  assert.equal(first.velocity,velocity)
})
test('a rotated or exploded card stays aloft until it is aligned for return',()=>{
  const motion=new ArchiveMotion(groups)
  const first=motion.select(0,null,true)
  motion.step(1/60,true,true)
  assert.equal(first.lift,3.1)
  first.holdLower=true
  motion.select(1)
  advance(motion,.3)
  assert.ok(first.lift>=3.09)
  first.holdLower=false
  advance(motion,1.5)
  assert.equal(motion.entries.size,1)
})
test('ripples propagate, overlap without resetting, decay and honor reduced motion',()=>{
  const motion=new ArchiveMotion(groups)
  motion.select(0,null,true)
  motion.select(1)
  advance(motion,.25)
  const original={...motion.ripples[0]}
  motion.select(2)
  assert.deepEqual(motion.ripples[0],original)
  assert.equal(motion.ripples.length,2)
  assert.ok(rippleHeight([original],0,original.row+4,original.time+.5)>.1)
  assert.ok(Math.abs(rippleHeight([original],0,original.row+4,original.time+.05))<.02)
  assert.equal(motion.field(0,2,true),0)
  advance(motion,4)
  assert.equal(motion.ripples.length,0)
  assert.equal(motion.field(0,2),0)
})
