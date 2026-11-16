# ReSTIR 入门第二篇：RIS 与蓄水池采样

**阶段** · 2026-11-12 初读完成，最小 RIS 基线已实现并回填。

**后续** · [最小 RIS 实现计划](../plans/ris-baseline.md) · [基线实验与经验](../experiments/ris-baseline.md)

基线完成后继续读[第三篇：从独立候选到时空复用](./restir-reuse.md)。

主读材料为 SIGGRAPH 2023 课程 **A Gentle Introduction to ReSTIR: Path Reuse in Real-Time**，使用作者于 2024-03-04 更新的课程笔记。这次聚焦 §2.4、§3.1、§4.1 和第 9 章，其他部分留作后续阅读。作者建议从这份综合笔记入门。[课程主页与视频入口](https://intro-to-restir.cwyman.org/) · [课程笔记 PDF](https://intro-to-restir.cwyman.org/presentations/2023ReSTIR_Course_Notes.pdf) · [Markus Kettunen 的 RIS 幻灯片](https://intro-to-restir.cwyman.org/presentations/2023ReSTIR_Course_RIS.pdf)

## 它要解决什么问题

我们现有的按功率选灯把整盏灯的发射功率当作重要性。RIS 则先产生一组候选，在当前着色点用目标函数评价候选，再随机保留一个。这样能把距离、朝向和 BSDF 等局部条件纳入选择。蓄水池采样让这一步可以逐个处理候选，保持常量存储。[课程笔记 §3–4](https://intro-to-restir.cwyman.org/presentations/2023ReSTIR_Course_Notes.pdf#page=15)

## 从候选到光照估计

以下限定候选独立同分布、来自同一个提议分布 $p$。$\hat p$ 是非负目标函数，$F$ 是待积分的光照贡献。二者和 $p$ 必须在同一积分域、同一度量下定义，并覆盖有贡献的区域。

生成 $M$ 个候选 $X_i$，计算权重并按比例抽出 $Y$：

$$
w_i=\frac{\hat p(X_i)}{p(X_i)},\qquad
S=\sum_{i=1}^{M}w_i,\qquad
P(Y=X_i\mid X_1,\ldots,X_M)=\frac{w_i}{S}.
$$

当 $S>0$，保留下来的样本还带有贡献权重：

$$
W_Y=\frac{S}{M\,\hat p(Y)}, \qquad \widehat I=F(Y)W_Y.
$$

这个权重包含整组候选的信息。目标函数可以不归一化，但最终估计必须带上 $W_Y$。幻灯片把它称为 unbiased contribution weight（UCW）。[RIS 幻灯片，第 5–11 页](https://intro-to-restir.cwyman.org/presentations/2023ReSTIR_Course_RIS.pdf#page=5)

蓄水池依次累加 $S$，以 $w_i/S$ 的概率用新候选替换当前样本，最后计算 $W_Y$。零权重候选不参与替换，全组权重为零时返回空样本、贡献为零。[课程笔记 §4.1，Algorithm 2](https://intro-to-restir.cwyman.org/presentations/2023ReSTIR_Course_Notes.pdf#page=23)

## 对挡板实验的启发

课程 §3.3 和第 9 章建议先把可见性纳入目标函数，建立可核对的基线，再逐步优化遮挡查询。若目标函数仍忽略挡板，它仍可能反复偏爱被挡住的强光候选。对本项目而言，这是一个需要验证的预期：RIS 在挡板阴影里的收益，会受目标函数如何处理可见性的影响。[课程笔记 §3.3](https://intro-to-restir.cwyman.org/presentations/2023ReSTIR_Course_Notes.pdf#page=20) · [实现建议](https://intro-to-restir.cwyman.org/presentations/2023ReSTIR_Course_Notes.pdf#page=55)

读后需要继续想清楚三个问题：

- 候选打分包含可见性时，实际多发了多少射线？总 GPU 时间能否抵消误差下降的收益？
- 当目标函数和最终积分的贡献不相同时，如何检查平均能量、整体误差和挡板阴影误差？
- 后续引入时空复用，候选来自不同分布时，应怎样根据课程的广义公式处理权重与支持域？

后面的实现规划将沿用[多光源基线实验](../experiments/many-light-sampling.md)的参考图和指标，再明确第一轮 RIS 的范围。
