// Procedural archive scene created for Jack's knowledge site.
// Geometry, camera motion, picking and layout are authored in this project.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const smooth = (a, b, dt, speed = 6) => THREE.MathUtils.lerp(a, b, 1 - Math.exp(-speed * dt))
const wrap = (i, n) => ((i % n) + n) % n

export class KnowledgeScene {
  constructor(host, records, columns, onSelect, onHover) {
    this.host = host
    this.records = records
    this.groups = columns.map(c => records.map((r, i) => r.category === c ? i : -1).filter(i => i >= 0))
    this.onSelect = onSelect
    this.onHover = onHover
    this.selected = 0
    this.detail = 0
    this.detailTarget = 0
    this.lift = 0
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    this.disposed = false
    this.resources = new Set()
    this.events = new AbortController()
    this.ray = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this.cameraAim = new THREE.Vector3()
    this.cameraPosition = new THREE.Vector3()
    this.renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'})
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
    this.renderer.setClearColor('#e9e7e1')
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.15
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.domElement.setAttribute('aria-label', '三维知识档案盘，点击选择文章，拖动或滚轮翻阅')
    this.renderer.domElement.style.touchAction = 'none'
    host.appendChild(this.renderer.domElement)
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog('#e9e7e1', 25, 61)
    const environment = new RoomEnvironment()
    const generator = new THREE.PMREMGenerator(this.renderer)
    this.environment = generator.fromScene(environment, .025)
    this.scene.environment = this.environment.texture
    this.scene.environmentIntensity = .65
    environment.dispose(); generator.dispose()
    this.camera = new THREE.PerspectiveCamera(37, 1, .3, 120)
    this.scene.add(new THREE.HemisphereLight('#fffdf5', '#b3a28c', 2))
    const key = new THREE.DirectionalLight('#fff8e9', 3)
    key.position.set(-10, 20, 8)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    Object.assign(key.shadow.camera, {left:-22,right:22,top:22,bottom:-22,near:.5,far:70})
    key.shadow.normalBias = .035
    this.key = key
    this.scene.add(key, key.target)
    const fill = new THREE.DirectionalLight('#ffffff', 1.3)
    fill.position.set(9, 9, -8)
    this.scene.add(fill)
    const floor = new THREE.Mesh(this.geometry(new THREE.PlaneGeometry(180,180)), this.material(new THREE.MeshStandardMaterial({color:'#dcd6cb', roughness:.95})))
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -.08
    floor.receiveShadow = true
    this.scene.add(floor)
    this.createArray()
    this.createDisc()
    this.select(0, true)
    this.resize()
    this.bindEvents()
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(host)
    this.lastTime = performance.now()
    this.frame = requestAnimationFrame(time => this.render(time))
  }
  geometry(value) { this.resources.add(value); return value }
  material(value) { this.resources.add(value); return value }
  createArray() {
    this.cells = []
    for (let lane = -4; lane < this.groups.length + 4; lane++) {
      for (let row = -12; row < 20; row++) {
        const group = this.groups[wrap(lane,this.groups.length)]
        this.cells.push({lane,row,index:group[wrap(row,group.length)]})
      }
    }
    const shell = this.material(new THREE.MeshStandardMaterial({color:'#e1d8c8', roughness:.44, metalness:.06}))
    const edge = this.material(new THREE.MeshStandardMaterial({color:'#f5f0e5', roughness:.32, metalness:.05}))
    const ring = this.material(new THREE.MeshStandardMaterial({color:'#c8b7a0', roughness:.43, metalness:.18}))
    this.layers = []
    const add = (geometry, material, offset) => {
      const inst = new THREE.InstancedMesh(geometry,material,this.cells.length)
      inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      inst.castShadow = offset.z === 0
      inst.receiveShadow = true
      inst.frustumCulled = false
      this.layers.push({mesh:inst,offset})
      this.scene.add(inst)
    }
    add(this.geometry(new RoundedBoxGeometry(3.65,4.5,.28,2,.07)),shell,{x:0,y:2.25,z:0})
    add(this.geometry(new RoundedBoxGeometry(3.72,.13,.34,2,.04)),edge,{x:0,y:4.48,z:0})
    add(this.geometry(new THREE.TorusGeometry(1.0,.095,8,40)),ring,{x:-.35,y:2.0,z:.19})
    add(this.geometry(new THREE.TorusGeometry(.48,.07,8,32)),ring,{x:1,y:3.17,z:.19})
    this.dummy = new THREE.Object3D()
  }
  createDisc() {
    this.disc = new THREE.Group()
    this.scene.add(this.disc)
    this.parts = []
    const frame = this.material(new THREE.MeshPhysicalMaterial({color:'#eee6d8',roughness:.28,metalness:.2,clearcoat:.7}))
    const ceramic = this.material(new THREE.MeshStandardMaterial({color:'#dbd2c0',roughness:.45,metalness:.12}))
    const accent = this.material(new THREE.MeshStandardMaterial({color:'#a98555',roughness:.32,metalness:.55}))
    const glass = this.material(new THREE.MeshPhysicalMaterial({color:'#fffef8',roughness:.12,transmission:.87,thickness:.12,ior:1.45,clearcoat:1,attenuationColor:'#e6dbc9',attenuationDistance:3}))
    const mesh = (geometry, material, x,y,z, part=0) => {
      const object = new THREE.Mesh(geometry,material)
      object.position.set(x,y,z)
      object.userData.part = part
      object.userData.baseZ = z
      object.castShadow = material !== glass
      object.receiveShadow = true
      this.disc.add(object); this.parts.push(object)
      return object
    }
    mesh(this.geometry(new RoundedBoxGeometry(3.66,4.5,.16,3,.08)),frame,0,2.25,-.12,0)
    mesh(this.geometry(new RoundedBoxGeometry(3.42,4.22,.07,3,.06)),ceramic,0,2.25,-.025,1)
    mesh(this.geometry(new RoundedBoxGeometry(3.64,4.48,.12,3,.07)),glass,0,2.25,.28,4)
    const ringParts = [[-.38,1.93,1.03],[1.01,3.15,.49]]
    for(const [x,y,r] of ringParts) {
      mesh(this.geometry(new THREE.TorusGeometry(r,.12,16,80)),frame,x,y,.1,2)
      mesh(this.geometry(new THREE.TorusGeometry(r-.19,.035,8,72)),accent,x,y,.12,2)
      mesh(this.geometry(new THREE.TorusGeometry(r+.15,.025,8,72)),ceramic,x,y,.09,2)
    }
    const bar = mesh(this.geometry(new THREE.BoxGeometry(1.05,.055,.05)),accent,.52,2.54,.1,2)
    bar.rotation.z = .71
    const screwGeo = this.geometry(new THREE.CylinderGeometry(.055,.055,.045,12))
    for(const x of [-1.62,1.62]) for(const y of [.2,4.3]) {
      const screw = mesh(screwGeo,accent,x,y,.37,5)
      screw.rotation.x = Math.PI/2
    }
    const grooveGeo = this.geometry(new THREE.BoxGeometry(.025,.21,.02))
    for(let i=0;i<14;i++) {
      const groove = mesh(grooveGeo,accent,.54+i*.055,.39,.1,1)
      groove.rotation.z = -.52
    }
    this.labelCanvas = document.createElement('canvas')
    this.labelCanvas.width = 1024; this.labelCanvas.height = 400
    this.labelTexture = new THREE.CanvasTexture(this.labelCanvas)
    this.labelTexture.colorSpace = THREE.SRGBColorSpace
    this.resources.add(this.labelTexture)
    const labelMat = this.material(new THREE.MeshBasicMaterial({map:this.labelTexture,toneMapped:false,transparent:true}))
    mesh(this.geometry(new THREE.PlaneGeometry(2.72,1.05)),labelMat,-.08,3.64,.36,4)
    this.explode = 0; this.explodeTarget = 0
  }
  drawLabel(record) {
    const c = this.labelCanvas.getContext('2d')
    c.clearRect(0,0,1024,400)
    c.fillStyle='#ece8dc'; c.fillRect(0,0,1024,400)
    c.fillStyle='#30332d'; c.fillRect(0,0,1024,7)
    c.font='600 42px sans-serif'; c.fillText('JACK / KNOWLEDGE ARCHIVE',24,73)
    c.fillStyle='#7e8175';c.font='27px monospace';c.fillText(record.en.slice(0,43),24,120)
    c.fillStyle='#30332d';c.font='500 96px sans-serif';c.fillText(record.id,24,240)
    c.font='35px sans-serif'; c.fillText(record.title.slice(0,24),24,322)
    c.fillStyle='#a98555';c.fillRect(903,183,83,83)
    c.fillStyle='#ece8dc';c.font='600 42px monospace';c.fillText('JK',917,239)
    c.fillStyle='#7e8175';c.fillRect(0,377,1024,3)
    this.labelTexture.needsUpdate=true
  }
  select(index, immediate=false) {
    this.selected=index
    this.lane=this.groups.findIndex(g=>g.includes(index))
    this.row=this.groups[this.lane].indexOf(index)
    this.targetX=(this.lane-2)*4.7
    this.targetZ=-this.row*.57
    this.pulse=performance.now()/1000
    this.drawLabel(this.records[index])
    if(immediate) {
      this.disc.position.set(this.targetX,1.1,this.targetZ)
      this.camera.position.set(this.targetX-14,15,this.targetZ+21)
      this.cameraAim.set(this.targetX+1,2,this.targetZ-2)
    }
  }
  setDetail(value) { this.detailTarget=value?1:0; if(!value)this.explodeTarget=0 }
  setExploded(value) { this.explodeTarget=value?1:0 }
  setReduced(value) { this.reduced=value }
  setQuality(low) {
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,low?1:1.5))
    this.renderer.shadowMap.enabled=!low
    this.resize()
  }
  resize() {
    if(this.disposed)return
    const {width,height}=this.host.getBoundingClientRect()
    this.renderer.setSize(width,height)
    this.camera.aspect=width/height
    this.camera.updateProjectionMatrix()
  }
  pick(x,y) {
    const box=this.host.getBoundingClientRect()
    this.pointer.set((x-box.left)/box.width*2-1,-(y-box.top)/box.height*2+1)
    this.ray.setFromCamera(this.pointer,this.camera)
    const hit=this.ray.intersectObjects([this.layers[0].mesh,this.disc],true)[0]
    return hit ? hit.instanceId===undefined ? this.selected : this.cells[hit.instanceId].index : null
  }
  bindEvents() {
    const canvas=this.renderer.domElement, signal=this.events.signal
    let down=null, lastWheel=0
    canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)}, {signal})
    canvas.addEventListener('pointermove',e=>{
      if(down&&this.detailTarget) {
        this.disc.rotation.y+=e.movementX*.007
        this.disc.rotation.x=THREE.MathUtils.clamp(this.disc.rotation.x+e.movementY*.004,-.45,.45)
      } else if(!down) {
        const index=this.pick(e.clientX,e.clientY)
        canvas.style.cursor=index===null?'grab':'pointer'
        this.onHover(index)
      }
    },{signal})
    canvas.addEventListener('pointerup',e=>{
      if(!down)return
      const dx=e.clientX-down.x,dy=e.clientY-down.y
      down=null
      if(this.detailTarget)return
      if(Math.hypot(dx,dy)<8) {const index=this.pick(e.clientX,e.clientY);if(index!==null)this.onSelect(index)}
      else if(Math.abs(dx)>Math.abs(dy))this.navigate('lane',dx>0?-1:1)
      else this.navigate('row',dy>0?-1:1)
    },{signal})
    canvas.addEventListener('pointercancel',()=>{down=null},{signal})
    canvas.addEventListener('pointerleave',()=>this.onHover(null),{signal})
    canvas.addEventListener('wheel',e=>{
      e.preventDefault()
      if(this.detailTarget||performance.now()-lastWheel<180)return
      lastWheel=performance.now()
      this.navigate(Math.abs(e.deltaX)>Math.abs(e.deltaY)?'lane':'row',(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)>0?1:-1)
    },{signal,passive:false})
  }
  navigate(axis,direction) {
    const lane=axis==='lane'?wrap(this.lane+direction,this.groups.length):this.lane
    const row=axis==='row'?wrap(this.row+direction,this.groups[lane].length):Math.min(this.row,this.groups[lane].length-1)
    this.onSelect(this.groups[lane][row])
  }
  render(now) {
    if(this.disposed)return
    this.frame=requestAnimationFrame(t=>this.render(t))
    const dt=Math.min((now-this.lastTime)/1000,.05)
    this.lastTime=now
    if(document.hidden)return
    const speed=this.reduced?100:6
    this.detail=smooth(this.detail,this.detailTarget,dt,speed*.65)
    this.lift=smooth(this.lift,this.detailTarget?3.1:1.1,dt,speed)
    this.explode=smooth(this.explode,this.explodeTarget,dt,speed)
    this.disc.position.x=smooth(this.disc.position.x,this.targetX,dt,speed)
    this.disc.position.z=smooth(this.disc.position.z,this.targetZ,dt,speed)
    this.disc.position.y=this.lift
    if(!this.detailTarget) {
      this.disc.rotation.x=smooth(this.disc.rotation.x,0,dt,speed)
      this.disc.rotation.y=smooth(this.disc.rotation.y,0,dt,speed)
    }
    for(const part of this.parts)part.position.z=part.userData.baseZ+this.explode*part.userData.part*.33
    const portrait=this.camera.aspect<1
    const s=this.detail
    const defaultDistance=portrait?32:21
    this.cameraPosition.set(this.targetX+THREE.MathUtils.lerp(-14,-3,s),THREE.MathUtils.lerp(15,8.3,s),this.targetZ+THREE.MathUtils.lerp(defaultDistance,portrait?19:13,s))
    this.camera.position.lerp(this.cameraPosition,1-Math.exp(-dt*speed*.65))
    const aim=new THREE.Vector3(this.targetX+(portrait?0:THREE.MathUtils.lerp(1.7,3.2,s)),THREE.MathUtils.lerp(2,4.9,s),this.targetZ-THREE.MathUtils.lerp(2,0,s))
    this.cameraAim.lerp(aim,1-Math.exp(-dt*speed*.7))
    this.camera.lookAt(this.cameraAim)
    this.key.position.set(this.targetX-10,20,this.targetZ+8)
    this.key.target.position.set(this.targetX,0,this.targetZ)
    const age=now/1000-this.pulse
    for(let i=0;i<this.cells.length;i++) {
      const cell=this.cells[i],x=(cell.lane-2)*4.7,z=-cell.row*.57
      const distance=Math.hypot((x-this.targetX)*.45,z-this.targetZ)
      const wave=this.reduced?0:Math.sin(distance*1.4-age*5)*Math.exp(-Math.abs(distance-age*3)*1.2)*Math.exp(-age*.6)*.12
      const hidden=cell.lane===this.lane&&cell.row===this.row
      for(const layer of this.layers) {
        this.dummy.position.set(x+layer.offset.x,wave+layer.offset.y-this.detail*7,z+layer.offset.z)
        this.dummy.scale.setScalar(hidden?0:1)
        this.dummy.updateMatrix()
        layer.mesh.setMatrixAt(i,this.dummy.matrix)
      }
    }
    for(const layer of this.layers)layer.mesh.instanceMatrix.needsUpdate=true
    this.renderer.render(this.scene,this.camera)
  }
  dispose() {
    this.disposed=true
    cancelAnimationFrame(this.frame)
    this.events.abort();this.resizeObserver.disconnect()
    for(const resource of this.resources)resource.dispose()
    this.environment.dispose();this.key.shadow.map?.dispose()
    this.renderer.dispose();this.renderer.forceContextLoss();this.renderer.domElement.remove()
  }
}
