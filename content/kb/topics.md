# 主题索引

| 主题 | 从哪里读 | 在项目里看什么 |
| --- | --- | --- |
| 外部模型与 PBR 资产 | [资源与规范](./reading/assets-gltf.md) · [实现计划](./plans/asset-gallery.md) · [Gallery 实测](./experiments/asset-gallery.md) | glTF / GLB、节点实例、UV、PNG/JPEG 贴图与较大展示场景 |
| 光传输与采样 | [Cornell Box 光源采样与 MIS](./experiments/cornell-mis.md) | `shaders/pathtrace.comp` 里的积分器、光源 PDF 与 BSDF PDF |
| 多光源直接光照 | [阅读笔记](./reading/many-light-sampling.md) · [实现计划](./plans/many-light-sampling.md) · [实测结果](./experiments/many-light-sampling.md) | 多盏矩形面光源、选灯概率与 MIS |
| RIS 与 ReSTIR | [第二篇阅读笔记](./reading/restir-ris.md) · [实现计划](./plans/ris-baseline.md) · [实测结果](./experiments/ris-baseline.md) | 候选重采样、贡献权重、蓄水池与可见性 |
| 空间样本复用 | [第三篇阅读笔记](./reading/restir-reuse.md) · [实现计划](./plans/spatial-reuse.md) · [实测结果](./experiments/spatial-reuse.md) | 接收像素的贡献、支持域和交叉评价成本 |
| 历史样本复用 | [第四篇阅读笔记](./reading/restir-temporal.md) | 静态时间复用、置信度和跨帧相关性 |
| 复用权重优化 | [第五篇阅读笔记](./reading/restir-stochastic-pairwise.md) · [实现计划](./plans/pairwise-mis.md) · [实测结果](./experiments/pairwise-mis.md) | 普通 defensive Pairwise MIS 的成本对照；随机大邻域抽样待实现 |
| 几何与硬件求交 | [架构说明](./architecture.md) · [Cornell Box 验证](./validation-cornell.md) | 场景实例、BLAS/TLAS、最近交点与遮挡查询 |
| 材质与显示 | [材质与降噪验证](./validation-materials.md) | 漫反射、GGX 金属、粗糙度和显示降噪 |
| 平台与设备 | [设备验证](./validation.md) · [项目进度](./progress.md) | Windows 和 Android 的设备能力、呈现与运行记录 |

每篇实验笔记从一个可检验的问题出发，记录原理、代码入口、复现命令、结果和适用范围。

新增专题按[研究与实现工作流](./workflow.md)推进。
