# 研究与实现工作流

图形学专题按 **阅读与沉淀 → 实现规划 → 实现与验证 → 经验回填** 推进。每个阶段在知识库里留下可接续的记录。

| 阶段 | 在知识库里留下什么 |
| --- | --- |
| **1. 阅读与沉淀** | 先读对应的原论文、规范或作者文章。记下原文入口、问题、方法、假设、证据和疑问，标清哪些结论来自原文、哪些是对本项目的推断。阅读阶段只做资料整理。 |
| **2. 实现规划** | 根据阅读笔记明确范围和基线，想清楚如何接入现有代码、怎么拆步骤、用什么场景和指标验收。形成可复查的计划后，再进入实现。 |
| **3. 实现与验证** | 按计划落地，用记录好的命令和场景检查正确性与性能，保留关键输出。发现计划中的假设有问题时，先更新计划再继续。 |
| **4. 经验回填** | 记录最终实现位置、复现步骤、结果、踩坑和适用边界。实验页链接回阅读笔记，让论文结论和本项目实测可以对照。 |

先用这套流程跑一个专题。遇到阶段边界不清、记录断档或难以复现的情况，再根据实际问题修订这页。

首个专题已完成从[阅读笔记](./reading/many-light-sampling.md)、[实现规划](./plans/many-light-sampling.md)到[实现与实验回填](./experiments/many-light-sampling.md)的完整流程。结果页记录了哪些现象值得在后续 ReSTIR DI 专题继续验证。

RIS 专题已从[第二篇阅读笔记](./reading/restir-ris.md)走到[实现计划](./plans/ris-baseline.md)与[实验回填](./experiments/ris-baseline.md)。后续接入时空复用前，先补读接收像素的权重与支持域处理。

空间复用已完成从[第三篇阅读笔记](./reading/restir-reuse.md)、[实现计划](./plans/spatial-reuse.md)到[实验回填](./experiments/spatial-reuse.md)的流程。[第四篇历史复用笔记](./reading/restir-temporal.md)已沉淀，静态时间复用待规划。

结合空间基线的成本，补充了[第五篇随机 Pairwise MIS 阅读笔记](./reading/restir-stochastic-pairwise.md)，并先完成普通 defensive Pairwise MIS 的[实现计划](./plans/pairwise-mis.md)、实现与[实验回填](./experiments/pairwise-mis.md)。历史复用仍待独立规划与验收。

2026-11-13 根据用户的新优先级转向渲染器功能。先整理[公开资产与 glTF 规范](./reading/assets-gltf.md)，再写[Gallery 计划](./plans/asset-gallery.md)，已完成扩大场景、模型与 PBR 贴图接入并[回填实测](./experiments/asset-gallery.md)。下一步围绕用户实际选择的资源继续扩充。
