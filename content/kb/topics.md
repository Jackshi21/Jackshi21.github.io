# 知识库总纲

先看知识地图，再进入专题。每个专题内部按原理、实现、实验的顺序阅读；项目记录单独归档。

[返回三维专题总览](/) · [知识库说明](./index.md)

## 建议阅读路线

光传输与 MIS → 多光源采样 → RIS 与蓄水池 → 空间样本复用 → 历史样本复用 / Pairwise MIS。

这条路线表达学习依赖，不代表每个专题都已实现。历史复用当前仍以阅读记录为主。

## 1. 光传输与采样

从光照积分和 MIS，逐步走向样本复用。

### 光传输与 MIS

从 Cornell Box 理解光源采样与 BSDF 采样如何组合，再核对几何和能量。

[在盘片中展开专题](/explore/light-transport.html)

1. **原理与实验**：[Cornell Box 光源采样与 MIS](/kb/experiments/cornell-mis.html)
2. **正确性验证**：[Cornell Box milestone 0.2](/kb/validation-cornell.html)

### 多光源采样

接在 MIS 基础之后，理解选灯概率、按功率采样及其局限。

[在盘片中展开专题](/explore/many-lights.html)

1. **阅读与原理**：[多光源采样与 ReSTIR DI 阅读笔记](/kb/reading/many-light-sampling.html)
2. **实现计划**：[多光源采样实现计划](/kb/plans/many-light-sampling.html)
3. **实验与验证**：[Cornell Box 多光源采样实验](/kb/experiments/many-light-sampling.html)

### RIS 与蓄水池

从多光源基线进入候选重采样，先建立可以验证的独立 RIS 基线。

[在盘片中展开专题](/explore/ris.html)

1. **阅读与原理**：[ReSTIR 入门第二篇：RIS 与蓄水池采样](/kb/reading/restir-ris.html)
2. **实现计划**：[最小 RIS 基线实现计划](/kb/plans/ris-baseline.html)
3. **实验与验证**：[最小 RIS 基线：候选变多之后，噪声与成本怎么变](/kb/experiments/ris-baseline.html)

### 空间样本复用

在 RIS 基础上复用邻居样本，检查接收像素权重、支持域与实际成本。

[在盘片中展开专题](/explore/spatial-reuse.html)

1. **阅读与原理**：[ReSTIR 入门第三篇：从独立候选到时空复用](/kb/reading/restir-reuse.html)
2. **实现计划**：[静态空间复用实现计划](/kb/plans/spatial-reuse.html)
3. **实验与验证**：[静态空间复用：邻居样本带来了多少收益](/kb/experiments/spatial-reuse.html)

### 历史样本复用

接续空间复用，理解历史样本、相关性和置信度。目前完成阅读，独立实现与实验仍待规划。

[在盘片中展开专题](/explore/temporal-reuse.html)

1. **阅读与原理**：[ReSTIR 入门第四篇：静态历史复用与置信度](/kb/reading/restir-temporal.html)

### Pairwise MIS 与复用成本

对照空间复用的交叉评价成本，阅读、实现并验证普通 Pairwise MIS；随机大邻域部分仍待实现。

[在盘片中展开专题](/explore/pairwise-mis.html)

1. **阅读与原理**：[ReSTIR 第五篇：把大邻域复用的成本降下来](/kb/reading/restir-stochastic-pairwise.html)
2. **实现计划**：[Pairwise MIS 实现计划](/kb/plans/pairwise-mis.html)
3. **实验与验证**：[Pairwise MIS：减少空间复用的交叉评价](/kb/experiments/pairwise-mis.html)

## 2. 渲染器实践

理解渲染器，再接入场景、模型与材质。

### 渲染器架构与平台

先建立模块、场景数据与 Vulkan Ray Query 的整体认识，再查看依赖和平台验证。

[在盘片中展开专题](/explore/renderer-architecture.html)

1. **整体架构**：[Architecture, milestone 0.2](/kb/architecture.html)
2. **构建与依赖**：[Third-party dependencies](/kb/dependencies.html)
3. **平台验证**：[Milestone 0.1 validation](/kb/validation.html)
4. **材质与显示验证**：[立方体材质与降噪验证](/kb/validation-materials.html)

### 模型与 PBR 材质

从公开资产和 glTF 规范出发，规划模型、贴图与较大场景接入，再查看 Gallery 实测。

[在盘片中展开专题](/explore/assets-materials.html)

1. **资源与规范**：[模型与材质资源：从公开资产接入渲染器](/kb/reading/assets-gltf.html)
2. **实现计划**：[大场景、模型与材质实现计划](/kb/plans/asset-gallery.html)
3. **实验与验证**：[更大的场景、外部模型与 PBR 材质](/kb/experiments/asset-gallery.html)

## 3. 研究与项目

整理研究方法，跟踪实现与后续方向。

### 研究与实现工作流

先读原文，形成可复查的实现计划，再实现、验证并回填经验。

[在盘片中展开专题](/explore/research-workflow.html)

1. **研究方法**：[研究与实现工作流](/kb/workflow.html)

### 项目进度与续接

查阅已经完成的功能、验证范围和待继续的工作；这是项目记录，不是采样学习路线的一环。

[在盘片中展开专题](/explore/project-progress.html)

1. **项目记录**：[进度与续接记录](/kb/progress.html)
