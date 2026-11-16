# Third-party dependencies

Source revisions are pinned in `tools/dependencies.json`. Each checkout retains its upstream license and copyright notices. Copies of the license texts are in `docs/licenses/` for local binary distribution alongside the project documentation.

| Component | Version | Use | Upstream license |
| --- | --- | --- | --- |
| Vulkan-Headers | v1.4.313 | Vulkan API declarations | Apache-2.0 / MIT; see upstream per-file notices |
| volk | SDK 1.4.313.0 | Vulkan loader/dispatch | MIT |
| GLFW | 3.4 | Desktop window and input | zlib/libpng |
| glslang | 15.2.0 | Host-only Shader compilation | See its full LICENSE.txt (multiple notices) |
| cgltf | v1.15, commit 360db1a95480fe102ae9c69b27c5d101167ff5ba | glTF / GLB parsing | MIT; `licenses/cgltf.txt` |
| stb_image | commit 78770d85c4d94787a56c7859017da963bc4f3439 | PNG / JPEG decoding | MIT / public domain; `licenses/stb.txt` |

The headers use pinned raw URLs and SHA256 verification in bootstrap. The optional Poly Haven CC0 sample is tracked separately in `assets/manifest.json`; run `tools/download-sample-assets.ps1` to restore or verify it.

Android Native App Glue and libc++ come from the Android NDK; consult `NOTICE`, `NOTICE.toolchain` and the individual source-file notices in the NDK package. Gradle, Android SDK/NDK and the optional validation layer are development tools and are not renderer backends.

The application APK is signed with a local development certificate. It is a debug build for testing.
