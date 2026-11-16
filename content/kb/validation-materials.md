# 立方体材质与降噪验证

`--scene materials` 在 Cornell 房间里放置三个共用网格的立方体。左侧是蓝色 Lambert 漫反射，中间是粗糙银色 GGX 金属，右侧是光滑黄铜色 GGX 金属。金属感知粗糙度分别为 0.50 和 0.18。各立方体有四段圆角，倒角顶点法线按交点重心坐标插值。相交、射线偏移和法线诊断使用几何法线。

材质缓冲保留原来的 32 字节步长。金属使用 RGB F0 的 Schlick 菲涅耳近似、Smith 遮蔽项和 GGX 可见法线采样。光源采样与路径延伸使用相同的反射方向 PDF 计算 MIS 权重。采样实现参考球冠方法。[Dupuy 与 Benyoub 的 GGX VNDF 论文](https://arxiv.org/abs/2306.05044)

`--denoise` 启用独立的 GPU 空间滤波。滤波使用中心射线提供的位置、法线和材质标签，在 7×7 邻域中平滑相近表面，并对孤立亮点做显示抑制。轮廓和低粗糙度反射使用较弱的滤波。历史和 PFM 导出保留原始线性辐亮度。空间保边思路可参考以下论文。[Dammertz 等人的保边滤波论文](https://diglib.eg.org/server/api/core/bitstreams/577ad3dc-c7f5-467b-8dce-30e7b5a1f645/content)

桌面 Release 和五项 CTest 通过。开启 Vulkan 同步验证后，97×71 几何诊断零差异，降噪模式的累积自检和 120 帧窗口缩放通过。原 Cornell 收敛统计与基线一致。

在 512×512 和相同 16 spp 随机种子下，开关降噪分别生成 `output/cubes-raw.png` 和 `output/cubes-denoised.png`。用独立随机种子的 1024 spp 画面 `output/cubes-reference.png` 比较，8 位 sRGB 显示误差的均方值从 66.78 降到 14.90，下降约 77.7%。光滑金属表面仍有少量高频噪声。96×96、4096 spp 的降噪开关两侧 PFM 哈希一致。

在 96×96、4096 spp、最多八次散射的固定视角下，测量三个立方体正面区域的线性亮度。

| 立方体 | MIS / 纯 BSDF 采样能量 |
| --- | ---: |
| 漫反射 | 1.005445 |
| 粗糙金属 | 0.983032 |
| 光滑金属 | 0.981976 |

本次验证覆盖电脑端。手机验证沿用用户指定关键节点的安排。

```powershell
Set-Location D:/raytrace
./build/Release/raytrace.exe --scene materials --denoise
./build/Release/raytrace.exe --headless --scene materials --width 96 --height 96 --spp 4096 --samples-per-frame 32 --self-test --output output/cubes-mis.pfm
./build/Release/raytrace.exe --headless --scene materials --width 96 --height 96 --spp 4096 --samples-per-frame 32 --self-test --bsdf-only --output output/cubes-bsdf.pfm
python -B tests/validate_materials.py output/cubes-mis.pfm output/cubes-bsdf.pfm
```
