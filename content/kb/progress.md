# 进度与续接记录

最后更新：2026-11-13（北京时间）。按用户新优先级完成扩大场景、glTF/GLB 模型与 PBR 贴图支持。

## 今日收尾与暂停位置

2026-11-13，用户确认今天先到这里，暂停开发，之后继续。本轮功能与知识库回填已完成；最后一次构建无编译警告／错误，七项 CTest 与资产验证通过，VitePress 构建成功，实验页三张图片引用已核对。

已保留可执行文件、公开木桌及依赖贴图、下载校验清单、原始图像、PFM、参数与测试日志。桌面“打开模型”流程已实际验证；下次启动时重新打开模型，不依赖当前窗口仍在运行。

下次先读本页和[Gallery 实测](experiments/asset-gallery.md)，从模型／材质功能继续。优先根据用户选择的资源规划独立材质包覆盖与场景布置；mipmap、切线和更完整材质支持按实际需求安排。ReSTIR 历史复用暂缓。仍按阅读沉淀 → 实现规划 → 实现验证 → 经验回填推进。

快速恢复木桌演示（在 `D:/raytrace` 运行，已有资产无需重新下载）：

```powershell
./build/Release/raytrace.exe --model assets/wooden_table_02/wooden_table_02_1k.gltf --model-scale 2.5
```

## 当前状态

本轮从 ReSTIR 实验切换到渲染器功能，已按[资源与规范](reading/assets-gltf.md)、[实现计划](plans/asset-gallery.md)、实现验证与[实验回填](experiments/asset-gallery.md)推进。新增 Gallery（16 × 14 地面、三盏面光源）、静态不透明 glTF/GLB 导入、节点实例、UV 与 PBR 因子和 PNG/JPEG 贴图。面板可选模型文件，载入后自动取景；CLI 支持位置、旋转与缩放。

实际下载并验证 Poly Haven CC0 木桌 1K glTF，保存来源、授权、文件 URL 和 SHA256。加入木桌后共有 3 个网格、12 个实例、9,928 个世界空间着色三角形、3 张 1024² 贴图。已通过桌面文件选择器实际载入，观察到木纹和正确取景。

七项 CTest 全部通过。glTF/GLB 同内容线性 RGB 最大差为 0，木桌 GPU/CPU 几何 oracle 为 0 不一致。独立种子 16,384 spp 的 PBR MIS / BSDF 能量比为整体 0.99933、中心区域 0.99714。8 → 64 → 512 spp 收敛、累积状态、原积分器与金属材质回归通过，原 balance 实验逐像素差为 0。开启 Vulkan 同步验证，日志无错误。此轮覆盖 Windows / RTX 4070 SUPER，未做手机验收。

当前资产通路支持完整路径积分器；空间复用暂保留原实验配置。独立材质包覆盖、mipmap、作者切线与透明材质待后续。历史复用暂缓，优先让用户提供／选择的模型和材质实际可用。

已从[第五篇阅读笔记](reading/restir-stochastic-pairwise.md)进入[普通 Pairwise MIS 计划](plans/pairwise-mis.md)、实现与[实验回填](experiments/pairwise-mis.md)。新增 `--spatial-mis balance|pairwise`，默认 balance，固定四邻居、等置信度、完整可见性。2026 论文中的随机大邻域抽样仍待后续实现。

同轮三种子对照中，128 spp 的挡板场景相对 balance，pairwise 的 NEE 阴影射线减少 42.4%，采样 GPU 时间减少 28.5%，整体 RMSE 增加 0.49%，阴影 RMSE 增加 2.90%。匹配 balance 射线预算后使用 222 spp，整体 RMSE 下降 26.7%，GPU 时间增加 24.0%。这些结果来自 96 × 96 的 RTX 4070 SUPER 桌面实验。

五项 CTest、零邻居对照、65 × 49 边界检查、两场景三种子预算对照、静态 8 → 2048 spp 收敛和 pairwise 累积状态检查通过，开启 Vulkan 同步验证。挡板场景 2048 spp 整体／阴影平均能量比为 0.99939 / 1.00090。结果与日志保留在 `output/pairwise/`。

2026-11-13 修复 Windows 视口键盘输入。已重现中文输入法截获字母键，现为渲染视口取消输入法关联，并开启帧间短按锁存。桌面实测 W 移动、R 复位和 P 保存通过，五项 CTest 通过。细节与验证位置见[空间复用实验的交互修复记录](experiments/spatial-reuse.md)。

静态、一次散射的空间复用已按[实现计划](plans/spatial-reuse.md)落地。桌面参数 `--spatial-neighbors 0..4` 启用两阶段流程，要求正数 RIS 候选、每帧 1 spp 和原始路径视图。每像素新增 128 字节缓冲区，保留来源表面、光源样本与贡献权重。

128 spp 的挡板场景中，四邻居复用相对独立 RIS 的整体 RMSE 降低约 4.5%，阴影区域降低约 24%，阴影射线数约为 3.88 倍，GPU 采样时间约为 3.06 倍。匹配阴影射线预算后，整体误差升高约 39%，GPU 时间约为原方法的 79%。完整数据、图像和成本分析见[空间复用实验](experiments/spatial-reuse.md)。

五项 CTest、单灯积分器回归、零邻居退化、空间模式累积状态和非整工作组检查均通过，已开启 Vulkan 同步验证。静态累积到 2048 spp 时，整体和阴影区域平均能量比分别为 0.99944 和 1.00094。此轮验收覆盖 Windows / RTX 4070 SUPER。

空间实现经验已回填。[第四篇历史复用笔记](reading/restir-temporal.md)已读，静态时间复用待规划。

RIS 专题已完成从[第二篇阅读笔记](reading/restir-ris.md)、[实现计划](plans/ris-baseline.md)到[实测与经验回填](experiments/ris-baseline.md)的流程。桌面参数 `--ris-candidates 1..64` 启用逐像素独立候选的 RIS，0 使用原积分器。目标函数包含可见性和原 NEE 项的 MIS 权重。

挡板场景、按功率生成候选、同为 128 spp 时，4 候选 RIS 的整体亮度 RMSE 下降约 14%，阴影区域下降约 41%；实际阴影射线数约 4 倍，采样 GPU 时间约 1.76 倍。改用 32 spp 匹配阴影射线预算后，整体 RMSE 上升约 27%，采样 GPU 时间约为原方法的 44%。这些统计来自 RTX 4070 SUPER 的 96 × 96、三个种子的中位数，展示图为 256 × 256。

本轮同步验证下，五项 CTest、单灯积分器回归、单候选退化检查以及 RIS 金属材质检查均通过。新增的累计采样 GPU 计时覆盖完整累积过程，重复读回和仅更新显示的 dispatch 不会重复计数。

多光源 Cornell Box 已支持均匀选灯与按发射功率选灯。两组场景的同射线预算对照、阴影区域误差和复现命令见[多光源采样实验](experiments/many-light-sampling.md)。

2026-11-11 在 RTX 4070 SUPER 上完成五项 CTest、单灯 Cornell 与材质回归，以及开启 Vulkan 同步验证的多灯对照。在实际阴影射线数相差不到 1% 时，按功率选灯让无挡板和有挡板场景的整体 RMSE 分别下降约 41% 和 28%，挡板阴影区域的 RMSE 上升约 37%。多光源基线的验收范围是 Windows 桌面。

知识库已串起[工作流](workflow.md)、[阅读笔记](reading/many-light-sampling.md)、[实现计划](plans/many-light-sampling.md)和[实测结果](experiments/many-light-sampling.md)。阅读笔记补充了按功率选灯要解决的采样噪声问题，以及发射功率和局部受光不一致时的局限。

已完成 v0.2 Cornell Box 漫反射渐进式路径追踪。Windows 和荣耀 Magic V5 均已运行验证，最终调试 APK 已安装到手机。源码和构建产物均保留在 `D:/raytrace`。

`--scene materials` 展示三个带圆角和插值法线的立方体。蓝色漫反射、粗糙银色金属、光滑黄铜色金属从左到右排列。`--denoise` 开启独立 GPU 显示滤波。桌面测试和 Cornell 回归已通过，具体指标和复现命令见 [材质验证记录](validation-materials.md)。手机适配与真机验证由用户在关键节点或阶段结束时指定。

工作区目前不是 Git 仓库，本次没有初始化仓库或创建提交；进度通过本文件与验证文档记录。

## 已确定的方向

- C++20 + CMake，GLSL 经 glslang 编译到 SPIR-V。
- Windows + Vulkan 日常开发，Android + Vulkan 尽早真机验证。
- Vulkan Ray Query 为当前核心，不依赖专用 Ray Tracing Pipeline/SBT。
- 共享场景、相机、材质及 API 无关的渲染接口，平台层处理窗口和生命周期。
- iOS 暂时预留 Metal 后端边界，尚未实现或验证；ARM64 CPU 不代表相同的 GPU/API 能力。

## v0.2 基线完成项

1. Vulkan 设备能力报告、功能门控、诊断回退画面；保留最小三角形测试。
2. 房间、红绿墙、面光源、两个共用网格的盒子实例；BLAS/TLAS 与明确的 GPU 数据布局。
3. 漫反射多次反弹、光源直接采样、BSDF 采样、power-heuristic MIS、俄罗斯轮盘赌。
4. FP32 线性累积、固定随机种子、采样上限；相机变化重置历史，曝光变化保留历史。
5. 桌面移动/观察相机，手机轨道旋转、缩放和曝光手势。
6. PNG/PPM 显示图、PFM 线性 HDR、参数/相机元数据，以及手机渐进快照和生命周期/计时文件。
7. Windows/Android 构建、安装、启动、项目诊断收集脚本和固定版本依赖。

## v0.2 基线验证

- 桌面五项 CTest 全部通过，涵盖功能门控、场景、三角形、Cornell 几何和累积状态。
- NVIDIA RTX 4070 SUPER 与 AMD Radeon Graphics 均通过几何和路径追踪检查；桌面 Vulkan/同步验证无错误。
- 120 帧窗口缩放测试通过，呈现尺寸变化不清空内部累积。
- 收敛测试的 MSE 随 8 → 64 → 512 spp 下降；MIS 与 BSDF-only 参考积分器的总能量差约 0.03%。
- Magic V5：Android 16 / Adreno 830 / Vulkan 1.3.284，所需 Ray Query 能力开放。
- 手机 65×49 几何自检、96×96 / 512 spp 固定相机对比通过；与 NVIDIA 的漫反射平均能量差小于 0.001%。
- 手机默认 384×384 完成 2048 spp，自检通过；用户确认触控、折叠展开和前后台恢复后画面正常且能继续累积。
- 手机一次实际采样 dispatch 约 1.324 ms（1 spp、最多 8 次散射）；达到上限后的显示 dispatch 约 0.054 ms。它们不是完整帧耗时或持续温控测试结论。
- Android 未启用 Vulkan 验证层，不能将桌面验证层结果视为手机验证层结果。

详细证据见 [Cornell 验证记录](validation-cornell.md)、[初始设备验证](validation.md) 和 [架构说明](architecture.md)。

## 关键代码入口

- `src/core/scene.hpp/.cpp`：场景、实例、显式 GPU 结构、相机、CPU 求交参考。
- `src/core/renderer.hpp`：API 无关配置和渲染器接口。
- `src/core/image.cpp`：PNG 与线性 PFM 导出。
- `src/vulkan/context.cpp`：设备选择、能力检测与 Vulkan 初始化。
- `src/vulkan/renderer.cpp`：加速结构、描述符、累积、提交同步、呈现和读回。
- `shaders/pathtrace.comp`：Cornell 路径积分、MIS、累积和显示变换。
- `src/platform/desktop_main.cpp`：命令行与桌面控制。
- `src/platform/android_main.cpp`：NativeActivity、触控、Intent 参数、窗口生命周期和快照。

## 下次从这里继续

1. 先读[Gallery 与外部模型实测](experiments/asset-gallery.md)，继续接入用户选择的模型与材质。根据实际资源决定独立材质包覆盖、切线／mipmap 和场景布置的下一步；静态时间复用暂缓，阅读笔记与基线均保留。
2. 如果先做规模对照，保留房间尺度和相机，把灯数从 3 扩到 16、64，再单独加隔断。分别记录灯的功率分布、实际阴影射线数、GPU 时间和整体／局部误差。这个对照目前是待验证的问题。

GGX 金属、两档粗糙度、静态 glTF/GLB 和基础 PBR 贴图的桌面验证已完成。环境光照明仍待后续。

还需要覆盖的内容：

- 更完整的 glTF／材质扩展、独立材质覆盖、mipmap、切线、玻璃、环境光、时间域降噪、Metal/iOS。
- 更复杂场景、其他手机/GPU、持续负载与温控，以及专门的锁屏恢复检查。
- 当前仍采用专用分配和单帧在途；不要直接当作最终资源管理或调度方案。
- Bounce 上限截断光传输，固定尺度的 ray offset 有几何近似；当前能量/收敛测试不能证明一般场景无偏。

## 本机恢复方式

已有依赖和 Android SDK/NDK/Gradle 缓存在 `third_party/`、`tools/local/`，无需再次下载。JDK 可用 `D:/Rider/jbr`；Visual Studio 工具链位于 `C:/sshi/visual/visual_self`，构建脚本会自动查找 CMake。

```powershell
Set-Location D:/raytrace
./tools/build.ps1 -Test
./build/Release/raytrace.exe
npm run dev --prefix docs
./build/Release/raytrace.exe --scene many-lights-occluded --light-sampling power --spp 128 --max-bounces 1
python tests/validate_integrator.py build/Release/raytrace.exe
python tests/validate_many_lights.py build/Release/raytrace.exe
python tests/validate_ris.py build/Release/raytrace.exe
python tests/validate_spatial.py build/Release/raytrace.exe
python tests/validate_spatial.py build/Release/raytrace.exe --mis pairwise --output output/pairwise
./tools/download-sample-assets.ps1
./build/Release/raytrace.exe --model assets/wooden_table_02/wooden_table_02_1k.gltf --model-scale 2.5
python tests/validate_assets.py build/Release/raytrace.exe
./build/Release/raytrace.exe --scene many-lights-occluded --light-sampling power --ris-candidates 4 --spp 128 --max-bounces 1
./build/Release/raytrace.exe --scene many-lights-occluded --light-sampling power --ris-candidates 4 --spatial-neighbors 4 --samples-per-frame 1 --max-bounces 1 --spp 128
./tools/build-android.ps1 -JavaHome D:/Rider/jbr
```

需要显式同步验证时，当前独立验证层目录为 `D:/raytrace/tools/local/validation`，设置 `VK_LAYER_PATH` 和 `VK_LAYER_VALIDATE_SYNC=1`。Android 构建脚本已将 Java 临时 Unix-domain socket 目录限定在项目内，修复本环境中的 Gradle 本地连接问题；不要修改全局 JDK 配置。

手机 USB 曾只能枚举文件传输接口，实际验证使用无线 ADB。下次重新读取无线调试地址，不能假定旧端口仍有效；先用 `adb mdns services` 发现服务，必要时让用户打开配对窗口。配对码短时有效，不记录在工程中。手机安装可能弹出确认：安装命令明确成功后再启动测试场景；若系统拒绝，先确认用户意图，勿连续重试。

## 保留的产物

- 桌面程序：`build/Release/raytrace.exe`。
- 最终 APK：`android/app/build/outputs/apk/debug/app-debug.apk`，应用 ID `dev.raytrace.app`，版本 0.2.0。
- 桌面展示图：`output/cornell-final.png`（512×512 / 1024 spp）。
- 积分器参考与统计：`output/integrator/`。
- 多灯参考、统计和预览图：`output/many-lights/`，对照图也已收录到知识库实验页。
- RIS 参考、逐种子对照、统计和展示图：`output/ris/`，知识库展示图同时保存在 `docs/experiments/assets/`。
- 空间复用的逐种子预算对照、静态收敛、累积状态和展示图：`output/spatial/`。
- Pairwise MIS 与同轮 balance 控制组、逐种子预算对照和展示图：`output/pairwise/`。
- Gallery、真实木桌、贴图／材质因子对照与验证日志：`output/assets/`，公开资产及下载校验清单在 `assets/`。
- 手机固定相机比较：`output/android-comparison/`。
- 手机几何检查：`output/android-normals/`。
- 最终交互测试记录与图像：`output/android/`。

构建目录、下载依赖和输出目录均被 `.gitignore` 忽略。后续若建立版本管理，源码基线与需要保留的结果应分别安排。
