// Physical archive positions and motion, independent of the renderer.
export const COLUMN_PITCH = 4.7
// Leave clearance for the cover and screw heads, not just the thin backplate.
export const ROW_PITCH = .66
export const PREVIEW_LIFT = 1.1
export const HOVER_LIFT = .36
export const wrap = (value, count) => ((value % count) + count) % count
export const cellKey = cell => `${cell.lane}:${cell.row}`
export const slotPosition = cell => ({x:(cell.lane-2)*COLUMN_PITCH,z:-cell.row*ROW_PITCH})
const nearest = (value, center, period) => value + Math.round((center-value)/period)*period

export function resolveCell(groups,index,current,navigation) {
  if(navigation?.cell) {
    const cell = {...navigation.cell}
    const group = groups[wrap(cell.lane,groups.length)]
    if(group[wrap(cell.row,group.length)] === index) return cell
  }
  const canonicalLane = groups.findIndex(group => group.includes(index))
  if(canonicalLane < 0) throw new RangeError('Unknown archive index')
  const group = groups[canonicalLane]
  const row = group.indexOf(index)
  if(!current) return {lane:canonicalLane,row}
  const lane = navigation?.axis === 'lane' ? current.lane+navigation.direction : nearest(canonicalLane,current.lane,groups.length)
  return {lane,row:navigation?.axis === 'row' ? current.row+navigation.direction : nearest(row,current.row,group.length)}
}

export function rippleHeight(ripples,lane,row,time) {
  let height = 0
  for(const ripple of ripples) {
    const age = time-ripple.time
    if(age < 0 || age > 3.4) continue
    const distance = Math.hypot((lane-ripple.lane)*2.8,(row-ripple.row)*ROW_PITCH)
    const front = (distance-age*4.5)/1.05
    const onset = Math.sin(Math.min(1,age/.16)*Math.PI/2)**2
    // A moving crest with a shallow trailing trough; every click keeps its own origin.
    height += .62*onset*(1-.85*front*front)*Math.exp(-front*front)*Math.exp(-age*.7)/Math.sqrt(1+distance*.12)
  }
  return .7*Math.tanh(height/.7)
}

export class ArchiveMotion {
  constructor(groups) {
    this.groups=groups
    this.entries=new Map()
    this.ripples=[]
    this.time=0
    this.cell=null
    this.hovered=null
  }
  hover(index,navigation) {
    if(index===null) {this.hovered=null;return null}
    const cell=resolveCell(this.groups,index,this.cell,navigation)
    const key=cellKey(cell)
    if(this.active&&key===cellKey(this.active.cell)) {this.hovered=null;return null}
    let entry=this.entries.get(key)
    if(!entry) {
      entry={cell,index,lift:0,velocity:0,holdLower:false}
      this.entries.set(key,entry)
    }
    this.hovered=entry
    return entry
  }
  select(index,navigation,immediate=false) {
    const cell=resolveCell(this.groups,index,this.cell,navigation)
    const key=cellKey(cell)
    let entry=this.entries.get(key)
    if(!entry) {
      entry={cell,index,lift:immediate?PREVIEW_LIFT:0,velocity:0,holdLower:false}
      this.entries.set(key,entry)
    }
    this.cell=cell
    this.active=entry
    this.index=index
    this.hovered=null
    if(!immediate) this.ripples.push({...cell,time:this.time})
    this.ripples=this.ripples.slice(-12)
    return entry
  }
  navigation(axis,direction) {
    const lane=this.cell.lane+(axis==='lane'?direction:0)
    const group=this.groups[wrap(lane,this.groups.length)]
    const row=this.cell.row+(axis==='row'?direction:0)
    return {index:group[wrap(row,group.length)],navigation:{cell:{lane,row}}}
  }
  step(dt,detail=false,reduced=false) {
    this.time+=dt
    this.ripples=this.ripples.filter(r => this.time-r.time<3.4)
    for(const [key,entry] of this.entries) {
      const target=entry.holdLower ? Math.max(PREVIEW_LIFT,entry.lift) : entry===this.active ? detail?3.1:PREVIEW_LIFT : entry===this.hovered?HOVER_LIFT:0
      if(reduced) { entry.lift=target;entry.velocity=0 }
      else {
        const steps=Math.max(1,Math.ceil(dt*120)),h=dt/steps
        for(let step=0;step<steps;step++) {
          entry.velocity+=((target-entry.lift)*144-entry.velocity*24)*h
          entry.lift+=entry.velocity*h
        }
      }
      if(entry!==this.active && entry!==this.hovered && !entry.holdLower && Math.abs(entry.lift)<.002 && Math.abs(entry.velocity)<.02) this.entries.delete(key)
    }
  }
  field(lane,row,reduced=false) { return reduced?0:rippleHeight(this.ripples,lane,row,this.time) }
}
