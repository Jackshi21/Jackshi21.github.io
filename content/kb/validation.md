# Milestone 0.1 validation

## Desktop

Validated on this Windows development machine with MSVC 19.38 / Visual Studio 2022, Release x64. The Vulkan loader reports version 1.4.357; the application requests Vulkan 1.2.

- Capability gating tests: passed.
- NVIDIA GeForce RTX 4070 SUPER: Ray Query triangle image and CPU coverage/color comparison passed.
- AMD Radeon(TM) Graphics: Ray Query triangle image at 513×377 and CPU coverage/color comparison passed (43,924 hit pixels, zero mismatches).
- Forced diagnostic mode: rendered with RT features disabled.
- Window resize test: 120 frames, 960×720 → 640×480 → 540×800 → 960×720, passed; internal image remained 512×512 (81,192 hit pixels, zero mismatches).
- Final desktop checks above used Khronos validation layer API version 1.4.368, with `VK_LAYER_VALIDATE_SYNC=1`; no validation errors were reported by the passing runs.

The validation-layer binary used was the official Windows x64 nightly asset from 2026-11-08; SHA-256 `bc8ed6b0b618b6ae3edb4f24457a5e546726e54190d0ba8a2ca30cfd6a446496`. It is a local development tool, not a runtime dependency.

## Android build

- `assembleDebug`: passed, arm64-v8a, AGP 8.9.2, Gradle 8.11.1, NDK 28.0.13004108, SDK/build-tools 35, JDK 21.
- APK signature verification: passed (v2 signature, development certificate).
- APK 16 KB native-library ZIP alignment: passed.
- Native library ELF load segments: 16 KB aligned.
- Host Shader compiler produces SPIR-V targeting Vulkan 1.2; Shader bytecode is embedded in the native library and needs no runtime asset path.

## Magic V5 device run

Installed and launched successfully using Android wireless debugging. USB initially exposed file transfer without an ADB interface; wireless pairing provided a working connection.

- Device: HONOR MBH-AN10 (Magic V5), arm64-v8a.
- Installed OS: Android 16 / SDK 36; build `MBH-AN10 10.0.0.175(C00E175R301P7)`.
- Vulkan loader: 1.4.0; Adreno (TM) 830 device API: 1.3.284; raw driver version: 2150760522.
- Ray Query requirements: supported; triangle BLAS/TLAS and compute tracing ran successfully.
- Initial CPU/GPU triangle oracle: PASS; 512×512 normal image retrieved and visually inspected.
- User performed fold/unfold and background/foreground switching and confirmed that the normal image remained correct.
- Retrieved lifecycle events confirm inner/outer surface changes between 2172×2352 and 1060×2376, as well as PAUSE → TERM_WINDOW → RESUME → INIT_WINDOW recovery.
- CPU/GPU oracle remained PASS after window recreation; no app error artifact was produced.
- One session reached 3,900 rendered frames over about 59 seconds. A sampled trace-plus-barriers GPU time was 0.0455 ms; a first-frame sample after recovery was 0.0473 ms. These are samples from the minimal 512×512 triangle, not sustained workload performance claims.
- Android Vulkan validation layer: not installed/enabled. Desktop validation results do not imply that Android validation ran.

The diagnostic update adds `metrics.txt` and `lifecycle.txt`, allowing continued rendering and window transitions to be checked without relying on vendor logcat behavior. The device's filtered logcat output was not useful for inspecting application messages, so files supplied the validation evidence. Sustained complex workloads, explicit screen lock recovery and thermal behavior remain future checks.

## Local Windows Java setup

Gradle initially failed while Java NIO established an internal Unix-domain socket in the inherited temporary directory. The Android build helper sets `jdk.net.unixdomain.tmpdir` to the project's `tools/local/tmp` for the build, then restores the caller's `JAVA_TOOL_OPTIONS`. No global JDK configuration is modified.
