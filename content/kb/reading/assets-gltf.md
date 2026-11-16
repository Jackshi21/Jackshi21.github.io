# 模型与材质资源：从公开资产接入渲染器

2026-11-13，阅读与沉淀。用户将当前重点转向更大的场景、外部模型与材质。

## 资源从哪里找

| 来源 | 适合什么 | 格式与使用入口 |
| --- | --- | --- |
| [Poly Haven](https://polyhaven.com/models) | 写实家具、道具、PBR 表面 | 模型可选 glTF、FBX、Blender 等；以实际资产下载项为准。首个样例选 [Wooden Table 02](https://polyhaven.com/a/wooden_table_02)，已核实有 1K glTF + BIN + JPG 贴图。 |
| [Kenney](https://kenney.nl/assets) | 低多边形游戏场景和成套道具 | 官方明确其 glTF 以 GLB 分发，适合下一轮验证成套资产。[格式说明](https://kenney.nl/knowledge-base/game-assets-3d/importing-3d-models-into-game-engines) |
| [ambientCG](https://ambientcg.com/) | 地板、墙面、木材、金属等独立 PBR 材质 | 例如 [Wood Floor 051](https://ambientcg.com/view?id=WoodFloor051)提供 JPG / PNG 贴图 ZIP，需分配到网格 UV 与材质槽。 |

上述来源有 CC0 资产：[Poly Haven 授权](https://polyhaven.com/license)、[Kenney 授权说明](https://kenney.nl/support)、[ambientCG 授权](https://docs.ambientcg.com/license/)。保存资产页面与作者信息方便复现。不要把免费预览图、收费服务和资产本身混为一谈。

## 为什么先接 glTF / GLB

glTF 将网格、节点层级、材质和贴图引用一起描述。GLB 使用二进制容器；`.gltf` 常需同时保留 `.bin` 与贴图文件。采用 glTF 2.0 的 metallic-roughness 工作流，避免为首个模型另写一套材质映射规则。[官方规范](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)

基础颜色贴图按 sRGB 解码；金属度／粗糙度贴图按线性数值读取，G 是粗糙度、B 是金属度。法线采用切线空间，不能按颜色做 sRGB 转换。节点变换、逆转置法线变换与负缩放都需要处理。[规范材质章节](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#materials)

采用 [cgltf](https://github.com/jkuhlmann/cgltf) 解析容器、accessor 与节点结构，采用 [stb_image](https://github.com/nothings/stb) 解码 PNG/JPEG。实际渲染继续在 Vulkan Compute Shader 与 Ray Query 中执行。

实现范围与验收见[计划](../plans/asset-gallery.md)。

**经验回填**：已完成第一批模型、PBR 贴图与 Gallery，[实际图像和验证](../experiments/asset-gallery.md)。
