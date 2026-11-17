<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import archive from './knowledge-archives.json'

const stage = ref(null)
const indexDialog = ref(null)
const searchInput = ref(null)
const query = ref('')
const category = ref('全部')
const selected = ref(0)
const hovered = ref(null)
const mode = ref('archive')
const loading = ref(true)
const failed = ref(false)
const boot = ref(true)
const lowQuality = ref(false)
const reduced = ref(false)
const exploded = ref(false)
const clock = ref('')
const active = computed(() => archive.records[selected.value])
const groups = archive.columns.map(c => archive.records.map((r,i) => r.category === c ? i : -1).filter(i => i >= 0))
const lane = computed(() => archive.columns.indexOf(active.value.category))
const row = computed(() => groups[lane.value].indexOf(selected.value))
const hoverRecord = computed(() => hovered.value === null ? null : archive.records[hovered.value])
const matches = computed(() => archive.records.map((r,i) => ({...r,index:i})).filter(r => (category.value === '全部' || r.category === category.value) && `${r.title} ${r.en} ${r.abstract}`.toLowerCase().includes(query.value.toLowerCase())))
let scene, disposed = false, timer, bootTimer, keyHandler, previousFocus
const wrap = (i,n) => ((i % n) + n) % n
function select(index,navigation) {
  selected.value = index
  hovered.value = null
  mode.value = 'archive'
  exploded.value = false
  scene?.setDetail(false)
  scene?.select(index,navigation)
}
function navigate(axis,direction) {
  if(mode.value === 'detail') return
  if(scene) {scene.navigate(axis,direction);return}
  const column = axis === 'lane' ? wrap(lane.value + direction,groups.length) : lane.value
  const position = axis === 'row' ? wrap(row.value + direction,groups[column].length) : Math.min(row.value,groups[column].length-1)
  select(groups[column][position])
}
function access() {
  if(loading.value || failed.value) return
  mode.value = 'detail'
  scene?.setDetail(true)
}
function back() {
  mode.value = 'archive'
  exploded.value = false
  scene?.setDetail(false)
}
function openIndex() {
  previousFocus = document.activeElement
  indexDialog.value.showModal()
  nextTick(() => searchInput.value?.focus())
}
function closeIndex() {
  indexDialog.value.close()
  previousFocus?.focus()
}
function pickResult(index) { select(index); closeIndex() }
function toggleReduced() { reduced.value = !reduced.value; scene?.setReduced(reduced.value) }
function toggleQuality() { lowQuality.value = !lowQuality.value; scene?.setQuality(lowQuality.value) }
function toggleExploded() { exploded.value = !exploded.value; scene?.setExploded(exploded.value) }
function fullSearch() {
  closeIndex()
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true}))
}
function skipBoot() { boot.value = false }
onMounted(async () => {
  reduced.value = matchMedia('(prefers-reduced-motion: reduce)').matches
  lowQuality.value = innerWidth < 700
  const updateClock = () => { clock.value = new Date().toLocaleTimeString('en-GB',{hour12:false,timeZone:'Asia/Shanghai'}) }
  updateClock(); timer = setInterval(updateClock,1000)
  bootTimer = setTimeout(skipBoot,reduced.value ? 0 : 1700)
  keyHandler = e => {
    if(indexDialog.value?.open || /INPUT|TEXTAREA|SELECT/.test(e.target?.tagName) || document.querySelector('.VPLocalSearchBox')) return
    if(e.key === '/') {e.preventDefault();openIndex();return}
    if(e.key === 'Escape') {boot.value = false;back();return}
    if(e.key === 'Enter') { if(boot.value){skipBoot();return} if(mode.value==='archive'){e.preventDefault();access()} return }
    const arrows = {ArrowLeft:['lane',-1],ArrowRight:['lane',1],ArrowUp:['row',-1],ArrowDown:['row',1]}
    if(arrows[e.key]) {e.preventDefault();navigate(...arrows[e.key])}
  }
  window.addEventListener('keydown',keyHandler)
  try {
    const {KnowledgeScene} = await import('./KnowledgeScene.js')
    if(disposed) return
    scene = new KnowledgeScene(stage.value,archive.records,archive.columns,select,i => {hovered.value = i})
    scene.setReduced(reduced.value)
    scene.setQuality(lowQuality.value)
    loading.value = false
  } catch(error) {
    console.error('Knowledge archive scene could not start',error)
    scene?.dispose()
    failed.value = true; loading.value = false; boot.value = false
  }
})
onUnmounted(() => {
  disposed = true
  clearInterval(timer); clearTimeout(bootTimer)
  window.removeEventListener('keydown',keyHandler)
  scene?.dispose()
})
</script>

<template>
  <main class="archive-terminal" :class="{'is-detail':mode === 'detail','reduce-motion':reduced}" aria-label="Jack 的三维知识档案终端">
    <div ref="stage" class="archive-stage" aria-hidden="true"></div>
    <div class="terminal-wash" aria-hidden="true"></div>
    <div class="terminal-grain" aria-hidden="true"></div>
    <header class="terminal-header">
      <a href="/" class="terminal-brand" aria-label="Jack 知识档案首页"><strong>JACK<span class="brand-square"></span></strong><span>COLLECT · UNDERSTAND · CREATE</span><b>KNOWLEDGE <em>OS</em></b></a>
      <nav class="terminal-tools" aria-label="终端导航">
        <button @click="openIndex" aria-label="打开档案索引"><span class="tool-search" aria-hidden="true">⌕</span><span>档案索引</span><kbd>/</kbd></button>
        <a href="/kb/topics.html">阅读模式 <span aria-hidden="true">↗</span></a>
        <a href="/about.html">关于</a>
      </nav>
    </header>

    <div v-if="loading" class="scene-loading" role="status"><span></span> 正在建立档案阵列…</div>
    <div v-if="failed" class="scene-fallback" role="status"><p>当前设备未能启用三维场景，文章仍可正常阅读。</p><button @click="openIndex">浏览全部 {{archive.records.length}} 篇笔记 ↗</button><a href="/kb/topics.html">进入主题索引</a></div>

    <template v-if="!failed">
      <section v-if="mode === 'archive'" class="archive-info" aria-live="polite" aria-atomic="true">
        <div class="info-eyebrow">PERSONAL KNOWLEDGE BASE <span>/</span> {{ active.category }}</div>
        <div class="file-number" :key="active.id">FILE NUMBER: {{ active.id }}</div>
        <div class="file-line"><i></i><span>REFERENCE AREA</span></div>
        <Transition name="title-roll" mode="out-in"><h1 :key="active.id">{{ active.title }}</h1></Transition>
        <button class="access-file" @click="access" :disabled="loading">读取档案 <span>ACCESS FILE</span><b aria-hidden="true">⟶</b></button>
      </section>
      <Transition name="detail-reveal">
        <section v-if="mode === 'detail'" class="archive-detail" aria-labelledby="detail-title">
          <div class="detail-id">{{ active.id }} <span>{{ active.department }} / KNOWLEDGE ARCHIVE</span></div>
          <h1 id="detail-title">{{ active.title }}</h1>
          <div class="detail-en">{{ active.en }}</div>
          <div class="detail-metadata"><div><small>COLLECTION / 分类</small><strong>{{ active.category }}</strong></div><div><small>STATUS / 状态</small><strong><i></i>公开 · 可阅读</strong></div><div><small>AUTHOR / 记录者</small><strong>Jack</strong></div><div><small>EXTENT / 篇幅</small><strong>{{ active.words.toLocaleString() }} 字符</strong></div></div>
          <div class="abstract-label">01 <span>档案摘要</span> / ABSTRACT</div>
          <p class="archive-abstract">{{ active.abstract }}</p>
          <a class="read-article" :href="active.href">阅读全文 <span>OPEN DOCUMENT ↗</span></a>
          <p class="detail-note">在阅读页查看完整公式、图像、复现步骤与原文链接。</p>
        </section>
      </Transition>
      <button v-if="mode === 'detail'" class="back-to-array" @click="back">⟵ <span>返回档案阵列</span> <kbd>ESC</kbd></button>
      <div v-if="mode === 'detail'" class="disc-inspect"><span>{{ active.id }}</span><small>拖动旋转 / DRAG TO INSPECT</small><button @click="toggleExploded">{{ exploded ? '重组档案盘' : '拆解档案盘' }} <b>{{ exploded ? '−' : '+' }}</b></button></div>
      <div v-if="hoverRecord && mode === 'archive'" class="hover-caption">{{ hoverRecord.id }} <span>{{ hoverRecord.title }}</span></div>
    </template>

    <footer class="terminal-footer">
      <template v-if="mode === 'archive'">
        <div class="selection-count"><small>ARCHIVE / SELECT</small><span>{{ String(row+1).padStart(2,'0') }}<i>/ {{ String(groups[lane].length).padStart(2,'0') }}</i></span></div>
        <div class="row-controls"><button @click="navigate('row',-1)" aria-label="上一篇档案">↑</button><div class="row-ticks" aria-label="当前分类文章"><button v-for="(index,i) in groups[lane]" :key="index" :class="{selected:index===selected}" @click="select(index)" :aria-label="archive.records[index].title" :aria-current="index===selected?'true':undefined"><span></span></button></div><button @click="navigate('row',1)" aria-label="下一篇档案">↓</button></div>
        <div class="column-controls"><button @click="navigate('lane',-1)" aria-label="上一个分类">←</button><div><small>COLUMN {{ String(lane+1).padStart(2,'0') }} / 05</small><span>{{active.category}}</span></div><button @click="navigate('lane',1)" aria-label="下一个分类">→</button></div>
      </template>
      <div class="terminal-signature">BUILT FROM <b>CURIOSITY</b><i></i></div>
    </footer>
    <div class="terminal-baseline"><span><i></i> {{ archive.records.length }} DOCUMENTS · ONLINE</span><span class="keyboard-hint">← → 切换分类 <b>/</b> ↑ ↓ 翻阅档案 <b>/</b> ENTER 读取</span><div><button @click="toggleQuality">{{lowQuality?'性能模式':'精细画质'}}</button><button @click="toggleReduced" :aria-pressed="reduced">{{reduced?'动效已减少':'完整动效'}}</button><time>{{ clock }}</time></div></div>

    <dialog ref="indexDialog" class="archive-index-dialog" @click.self="closeIndex" @cancel="previousFocus?.focus()">
      <div class="index-top"><div><small>KNOWLEDGE ARCHIVE / INDEX</small><h2>档案索引 <span>{{archive.records.length}}</span></h2></div><button @click="closeIndex" aria-label="关闭档案索引">×</button></div>
      <label class="index-query"><span>⌕</span><input ref="searchInput" v-model="query" placeholder="搜索标题、主题或摘要…" aria-label="搜索档案标题和摘要"><kbd>ESC</kbd></label>
      <div class="index-categories"><button v-for="item in ['全部',...archive.columns]" :key="item" :class="{active:category===item}" @click="category=item">{{item}}</button></div>
      <div class="index-results"><button v-for="record in matches" :key="record.id" @click="pickResult(record.index)"><span>{{record.id}}</span><div><strong>{{record.title}}</strong><small>{{record.category}}</small></div><b>↗</b></button><p v-if="!matches.length">没有找到匹配的档案，试试其他关键词。</p></div>
      <div class="index-bottom"><span>选择一个标题，定位到对应档案盘。</span><button @click="fullSearch">搜索全文 ↗</button></div>
    </dialog>
    <Transition name="boot-fade"><div v-if="boot" class="terminal-boot"><div class="boot-center"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40"/><path d="M55 25v35c0 22-30 22-30 3M73 35v30"/></svg><span>JACK / KNOWLEDGE OS</span><strong>让理解，持续发生。</strong><small>INITIALIZING PERSONAL ARCHIVE</small></div><button @click="skipBoot">进入终端 ↗ <kbd>ENTER</kbd></button></div></Transition>
  </main>
</template>
