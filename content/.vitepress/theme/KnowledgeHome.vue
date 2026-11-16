<script setup>
import stats from './knowledge-stats.json'
import gallery from '../../kb/experiments/assets/gallery-table-textured.png'
import cornell from '../../kb/experiments/assets/cornell-mis-512.png'

const notes = [
  { number: '01', type: '阅读笔记', title: '从多光源采样走向 ReSTIR', description: '先理解噪声从哪里来，再看重采样与时空复用如何改善直接光照。', tags: 'Sampling · ReSTIR', href: '/kb/reading/many-light-sampling.html' },
  { number: '02', type: '原理与实现', title: 'RIS 与蓄水池：保留一个好样本', description: '候选、目标函数、贡献权重，以及可以核对的最小正确性基线。', tags: 'RIS · Reservoir', href: '/kb/reading/restir-ris.html' },
  { number: '03', type: '实验记录', title: 'Pairwise MIS，收益与代价', description: '把射线数量、GPU 时间和误差放在一起，比较复用权重的实际成本。', tags: 'MIS · Benchmark', href: '/kb/experiments/pairwise-mis.html' },
]
</script>

<template>
  <main class="knowledge-home">
    <section class="intro-grid" aria-labelledby="intro-title">
      <div class="intro-copy">
        <div class="eyebrow"><span class="status-dot"></span> JACK'S KNOWLEDGE GARDEN</div>
        <h1 id="intro-title">保持好奇，<br>让知识<span class="serif">生长。</span></h1>
        <p class="intro-description">你好，我是 Jack。这里收集我的阅读、思考与实践。<br class="desktop-break">目前专注于图形学，记录从一个公式到一帧图像的过程。</p>
        <div class="intro-actions">
          <a class="primary-link" href="/kb/topics.html">进入知识库 <span aria-hidden="true">↗</span></a>
          <a class="quiet-link" href="/about.html">关于这里 <span aria-hidden="true">→</span></a>
        </div>
        <div class="intro-meta"><span>{{ stats.notes }} 篇笔记</span><i></i><span>{{ stats.images }} 张实验图</span><i></i><span>持续积累中</span></div>
      </div>
      <a class="render-feature" href="/kb/experiments/asset-gallery.html" aria-label="阅读 Gallery 与 PBR 模型实验">
        <div class="render-label"><span>IN THE LAB</span><span>RAYTRACE / 001</span></div>
        <img :src="gallery" alt="Raytrace 渲染器中的木桌、PBR 材质与 Gallery 场景" width="1024" height="768" fetchpriority="high">
        <div class="render-caption"><div><small>把理论放进真实场景</small><strong>光线、材质与一个木桌。</strong></div><span class="round-arrow" aria-hidden="true">↗</span></div>
      </a>
    </section>

    <section class="topic-strip" aria-label="知识库主题">
      <span class="strip-label">正在探索</span>
      <a href="/kb/experiments/cornell-mis.html">光传输与采样 <span>↗</span></a>
      <a href="/kb/reading/restir-ris.html">RIS / ReSTIR <span>↗</span></a>
      <a href="/kb/reading/assets-gltf.html">模型与 PBR 材质 <span>↗</span></a>
      <a href="/kb/architecture.html">Vulkan 渲染器 <span>↗</span></a>
    </section>

    <section class="reading-grid" aria-labelledby="reading-title">
      <div class="reading-list">
        <div class="section-top"><div><div class="eyebrow">NOTES & EXPLORATIONS</div><h2 id="reading-title">从这些笔记开始</h2></div><a class="all-notes" href="/kb/topics.html">全部主题 <span>↗</span></a></div>
        <a v-for="note in notes" :key="note.number" :href="note.href" class="note-row">
          <span class="note-number">{{ note.number }}</span>
          <div class="note-main"><span class="note-type">{{ note.type }}</span><h3>{{ note.title }}</h3><p>{{ note.description }}</p><span class="note-tags">{{ note.tags }}</span></div>
          <span class="note-arrow" aria-hidden="true">↗</span>
        </a>
      </div>
      <aside class="field-note">
        <div class="eyebrow">A NOTE ON THE PROCESS</div>
        <h2>读懂，写下，<br><span class="serif">再亲手验证。</span></h2>
        <p>用原论文建立理解，用代码检验假设。把结果、局限和踩过的坑，一起留在笔记里。</p>
        <div class="process-line"><span>阅读</span><b>→</b><span>实现</span><b>→</b><span>验证</span><b>→</b><span>回填</span></div>
        <a href="/kb/workflow.html">我的知识整理方式 <span>↗</span></a>
        <figure><img :src="cornell" alt="Cornell Box 光源采样实验渲染结果" width="256" height="256" loading="lazy"><figcaption>FIG. 01 / CORNELL BOX<br>用可复现的场景，回答具体的问题。</figcaption></figure>
      </aside>
    </section>
    <div class="home-end"><span class="status-dot"></span> 这里没有终稿，只有不断更新的理解。<a href="https://github.com/Jackshi21" target="_blank" rel="noreferrer">在 GitHub 找到我 ↗</a></div>
  </main>
</template>
