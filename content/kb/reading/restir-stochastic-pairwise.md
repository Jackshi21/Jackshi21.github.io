# ReSTIR 第五篇：把大邻域复用的成本降下来

**阶段** · 阅读与沉淀，2026-11-13 初读。

**项目回填** · 已按[实现计划](../plans/pairwise-mis.md)完成普通 defensive Pairwise MIS，成本、误差和收敛见[实验页](../experiments/pairwise-mis.md)。随机大邻域部分仍处于阅读阶段。

主读 **Stochastic Pairwise MIS for Unbiased Large-Kernel Reuse in Real-Time**，Trevor Hedstrom、Markus Kettunen、Daqi Lin、Chris Wyman、Tzu-Mao Li，Eurographics / Computer Graphics Forum 2026。此次聚焦 §2.7、§3–5，配合课程 §7.1.3 理解 Pairwise MIS。[作者项目页](https://research.nvidia.com/labs/rtr/publication/hedstrom2026stochastic/) · [论文 PDF](https://research.nvidia.com/labs/rtr/publication/hedstrom2026stochastic/hedstrom2026stochastic.pdf) · [Pairwise MIS 课程章节](https://intro-to-restir.cwyman.org/presentations/2023ReSTIR_Course_Notes.pdf#page=46)

## 它要解决什么问题

我们的[空间基线](../experiments/spatial-reuse.md)只有四个邻居，完整交叉权重检查就让采样 GPU 时间增加到约 3 倍。扩大邻域时，这类检查还会继续增加。

论文同时关注候选的质量。运动后新显露的区域缺少可用历史，附近的蓄水池也可能没有能贡献的样本。扩大搜索范围可以找到更好的来源，但逐个处理它们成本很高。[作者摘要与研究动机](https://research.nvidia.com/labs/rtr/publication/hedstrom2026stochastic/)

## 先理解 Pairwise MIS

广义 balance heuristic 为每个候选评价全部来源的目标函数，$M$ 个来源通常需要 $O(M^2)$ 次评价。Pairwise MIS 把每个邻居与当前像素的 canonical 来源配对，把总评价次数降到 $O(M)$。Canonical 来源仍需覆盖当前目标的支持域，并使用与邻居项配套的权重。[课程 §7.1.3](https://intro-to-restir.cwyman.org/presentations/2023ReSTIR_Course_Notes.pdf#page=46)

这是当前基线可以独立研究的一步。目标函数与遮挡查询的定义可以保持一致，先对比两种 MIS 权重的误差和成本。

## 再从大集合里抽少量来源

论文把非 canonical 项的确定性权重 $m_i$ 换成随机估计：

$$
\widetilde m_i(Y_i)=
\frac{K(i)}{\widetilde N\,P(i)}m_i(Y_i).
$$

$P(i)$ 是选择来源 $i$ 的概率，$\widetilde N$ 是有放回抽样次数，$K(i)$ 是它实际被抽中的次数。固定输入样本和贡献权重后，对新的抽样随机数取期望，恢复原来的 $m_i$。因此选择概率可以利用样本信息，同时带上相应的校正。Canonical 项单独估计，支持域和概率覆盖条件仍要满足。[论文 §3–4，式 13–18](https://research.nvidia.com/labs/rtr/publication/hedstrom2026stochastic/hedstrom2026stochastic.pdf)

## 零贡献来源怎样处理

论文的 GPU 实现维护两份来源列表。一份包含 cell 内全部像素，用于 canonical 权重估计；另一份包含非零样本，供按贡献抽取复用候选。两份列表分别服务不同的估计步骤。

对照我们的挡板场景，直接把空蓄水池从全部来源中删除会影响权重分母。论文通过抽样概率、重复次数和 canonical 项的专门估计来处理这种选择依赖。[论文 §5.2，Algorithm 1–2](https://research.nvidia.com/labs/rtr/publication/hedstrom2026stochastic/hedstrom2026stochastic.pdf)

## 带进后续规划的问题

- 先在现有四邻居、完整可见性条件下，对比 balance 和 pairwise，能降低多少目标函数评价与阴影查询？
- 扩大候选来源集合后，构建 cell、抽样和 canonical 权重估计各占多少 GPU 时间？
- 更偏爱有贡献的来源后，挡板阴影的平均能量和静态多帧收敛是否仍通过？
- 我们目前是三盏灯、一次散射的小场景。论文侧重更复杂场景和历史不足区域，实际收益需要在本项目里单独测量。

这篇为[第四篇历史复用笔记](./restir-temporal.md)补充了权重成本的优化路线。本轮先完成普通 defensive Pairwise MIS 的独立对照，下一步回到静态时间复用规划。
