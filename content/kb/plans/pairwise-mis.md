# Pairwise MIS 实现计划

**状态**：2026-11-13 已完成实现与验证，[实测及经验回填](../experiments/pairwise-mis.md)。

先在已有静态空间基线上实现普通的 defensive Pairwise MIS，再考虑时间复用和随机大邻域选择。它直接针对[上一轮实验](../experiments/spatial-reuse.md)中完整交叉目标函数评价的成本。阅读依据为[第五篇笔记](../reading/restir-stochastic-pairwise.md)和课程式 7.8。

## 接入范围

新增 `--spatial-mis balance|pairwise`，默认 balance。两种模式共享初始候选、固定邻域、完整可见性、置信权重 1 和两阶段缓冲区。通过已有 push constant 的空字段选择权重公式。

令 $K$ 是本像素实际有效的邻居数量，$q$ 是当前像素。对于 $K>0$，采用等置信度下的 defensive 形式：

$$
m_i(y)=\frac{K}{K+1}\frac{\hat p_i(y)}{K\hat p_i(y)+\hat p_q(y)}
\quad(i\ne q),
$$

$$
m_q(y)=\frac{1}{K+1}+
\frac{1}{K+1}\sum_{j\ne q}
\frac{\hat p_q(y)}{K\hat p_j(y)+\hat p_q(y)}.
$$

零邻居时当前像素的权重为 1。借来的样本只需要在当前像素重新评价，当前像素样本则在每个来源上评价一次。空蓄水池的来源继续参与 canonical 项的计算。[课程 §7.1.3，式 7.8](https://intro-to-restir.cwyman.org/presentations/2023ReSTIR_Course_Notes.pdf#page=47)

## 验收与对照

- 零邻居的 pairwise 和独立 RIS 对照，RGB 最大误差小于 0.00001，阴影射线数一致。
- 两个多光源场景，在 128 spp、相同初始候选与邻域下，以三组种子比较 balance 和 pairwise 的整体／阴影误差、平均能量、阴影射线数和完整 GPU 时间。
- 对 pairwise 运行 8、64、512、2048 spp 的静态累积检查，确认整体与局部能量接近独立参考，误差随样本增加而下降。
- 以近似相同阴影射线预算再做对照，避免只比较相同 spp。检查窗口边界、非整工作组、重置与采样上限。
- 构建、现有回归与 Vulkan 同步验证通过后，把公式选择、实际收益和局限回填到知识库。
