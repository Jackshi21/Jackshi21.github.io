# ReSTIR 入门第三篇：从独立候选到时空复用

**阶段** · 阅读与沉淀，2026-11-12。

**后续** · [空间复用实现计划](../plans/spatial-reuse.md) · [实测与经验](../experiments/spatial-reuse.md) · [第四篇历史复用笔记](./restir-temporal.md)

这篇继续读《A Gentle Introduction to ReSTIR》的 §4.2–4.4，回看 §3.4 的支持域条件。使用 2024-03-04 更新版课程笔记，正文页码 14、16–20。[课程主页](https://intro-to-restir.cwyman.org/) · [原文 PDF，从 §4.2 开始](https://intro-to-restir.cwyman.org/presentations/2023ReSTIR_Course_Notes.pdf#page=23)

## 它要解决什么问题

上一轮[最小 RIS 实验](../experiments/ris-baseline.md)中，每个像素都独立生成并评价四个候选，阴影射线成本随之增加。如果附近像素或上一帧已经找到有用的光源样本，能否把这些候选拿来重新选择，摊薄发现好样本的成本？

课程将 RIS 连起来，在当前帧内从邻近像素借样本，或从上一帧对应的表面借样本。接收像素重新评价样本的贡献与可见性。[课程笔记 §4.2–4.3](https://intro-to-restir.cwyman.org/presentations/2023ReSTIR_Course_Notes.pdf#page=23)

## 挡板两侧，邻居找到的灯对我有用吗

假设两个像素分别位于挡板内外。外侧像素选中了亮灯，到了内侧，这条连接可能被挡住。内侧必须重算几何、BSDF 和可见性。

反过来，某盏灯可能只照得到内侧像素。外侧像素生成的 RIS 样本无法覆盖这部分贡献，因此当前像素还要有覆盖自身目标函数的 canonical sample。规划复用时，需要保留产生新候选的路径。[课程笔记 §3.4、§4.3](https://intro-to-restir.cwyman.org/presentations/2023ReSTIR_Course_Notes.pdf#page=21)

## 权重怎样接起来

候选 $Y_i$ 来自像素 $i$，携带贡献权重 $W_i$。接收像素为 $q$，目标函数为 $\hat p_q$。课程给出的重采样权重形式为：

$$
m_i(y)=\frac{c_i\hat p_i(y)}{\sum_j c_j\hat p_j(y)},\qquad
w_i=m_i(Y_i)\hat p_q(Y_i)W_i.
$$

按 $w_i$ 选择 $Y$ 后，输出权重为：

$$
W_Y=\frac{\sum_i w_i}{\hat p_q(Y)},\qquad
\widehat I_q=F_q(Y)W_Y.
$$

$c_i$ 是置信权重。不同像素的分布和可见区域可能不同，分母中的目标函数评价与支持域条件需要一起处理。[课程笔记式 4.5–4.7](https://intro-to-restir.cwyman.org/presentations/2023ReSTIR_Course_Notes.pdf#page=25)

## 历史样本为什么需要限制

同一个候选在邻居和后续帧之间反复传播，历史置信度的累计可能远超真正增加的独立信息。课程用置信度上限控制噪声与相关性的取舍，并建议依次验证独立候选、空间复用、静态时间复用，最后处理运动。[课程笔记 §4.4、Tip 4.4](https://intro-to-restir.cwyman.org/presentations/2023ReSTIR_Course_Notes.pdf#page=26)

## 留到实现规划的问题

- 目前蓄水池只保留已计算的 RGB 估计。为了在接收像素重算，需要怎样保存灯索引、灯面位置、贡献权重和来源表面信息？
- 在挡板边界，当前像素的新候选与邻居候选如何共同覆盖有贡献的区域？
- 复用带来的目标函数评价、阴影射线和缓冲区访问，能节省多少 GPU 时间？沿用现有的整体与局部误差指标，还要观察跨像素相关性和静态多帧平均的收敛。
