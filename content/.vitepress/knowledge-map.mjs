// Explicit knowledge relationships; document type is a step within a topic.
export const knowledgeChapters = [
  {id:'sampling',title:'光传输与采样',description:'从光照积分和 MIS，逐步走向样本复用。'},
  {id:'renderer',title:'渲染器实践',description:'理解渲染器，再接入场景、模型与材质。'},
  {id:'research',title:'研究与项目',description:'整理研究方法，跟踪实现与后续方向。'},
]
export const knowledgeTopics = [
  {slug:'light-transport',chapter:'sampling',title:'光传输与 MIS',description:'从 Cornell Box 理解光源采样与 BSDF 采样如何组合，再核对几何和能量。',steps:[['experiments/cornell-mis.md','原理与实验'],['validation-cornell.md','正确性验证']]},
  {slug:'many-lights',chapter:'sampling',title:'多光源采样',description:'接在 MIS 基础之后，理解选灯概率、按功率采样及其局限。',steps:[['reading/many-light-sampling.md','阅读与原理'],['plans/many-light-sampling.md','实现计划'],['experiments/many-light-sampling.md','实验与验证']]},
  {slug:'ris',chapter:'sampling',title:'RIS 与蓄水池',description:'从多光源基线进入候选重采样，先建立可以验证的独立 RIS 基线。',steps:[['reading/restir-ris.md','阅读与原理'],['plans/ris-baseline.md','实现计划'],['experiments/ris-baseline.md','实验与验证']]},
  {slug:'spatial-reuse',chapter:'sampling',title:'空间样本复用',description:'在 RIS 基础上复用邻居样本，检查接收像素权重、支持域与实际成本。',steps:[['reading/restir-reuse.md','阅读与原理'],['plans/spatial-reuse.md','实现计划'],['experiments/spatial-reuse.md','实验与验证']]},
  {slug:'temporal-reuse',chapter:'sampling',title:'历史样本复用',description:'接续空间复用，理解历史样本、相关性和置信度。目前完成阅读，独立实现与实验仍待规划。',steps:[['reading/restir-temporal.md','阅读与原理']]},
  {slug:'pairwise-mis',chapter:'sampling',title:'Pairwise MIS 与复用成本',description:'对照空间复用的交叉评价成本，阅读、实现并验证普通 Pairwise MIS；随机大邻域部分仍待实现。',steps:[['reading/restir-stochastic-pairwise.md','阅读与原理'],['plans/pairwise-mis.md','实现计划'],['experiments/pairwise-mis.md','实验与验证']]},
  {slug:'renderer-architecture',chapter:'renderer',title:'渲染器架构与平台',description:'先建立模块、场景数据与 Vulkan Ray Query 的整体认识，再查看依赖和平台验证。',steps:[['architecture.md','整体架构'],['dependencies.md','构建与依赖'],['validation.md','平台验证'],['validation-materials.md','材质与显示验证']]},
  {slug:'assets-materials',chapter:'renderer',title:'模型与 PBR 材质',description:'从公开资产和 glTF 规范出发，规划模型、贴图与较大场景接入，再查看 Gallery 实测。',steps:[['reading/assets-gltf.md','资源与规范'],['plans/asset-gallery.md','实现计划'],['experiments/asset-gallery.md','实验与验证']]},
  {slug:'research-workflow',chapter:'research',title:'研究与实现工作流',description:'先读原文，形成可复查的实现计划，再实现、验证并回填经验。',steps:[['workflow.md','研究方法']]},
  {slug:'project-progress',chapter:'research',title:'项目进度与续接',description:'查阅已经完成的功能、验证范围和待继续的工作；这是项目记录，不是采样学习路线的一环。',steps:[['progress.md','项目记录']]},
]
