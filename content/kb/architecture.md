# Architecture, milestone 0.2

## Boundaries

`src/core` contains API-neutral scenes, meshes, instances, materials, camera math, explicit GPU data layouts, image export, render configuration and capability gating. `src/vulkan` owns Vulkan handles, memory, synchronization, acceleration structures and compute dispatch. Platform entry points construct the native surface adapter. A future Metal implementation can implement the renderer contract without importing Vulkan into shared scene data.

This first milestone uses dedicated allocations and one frame in flight to make lifetime and synchronization easy to inspect. It is not a general allocator or final scheduling design. Introduce suballocation/VMA when scene resource counts justify it.

Internal resolution defaults to 512×512 on desktop and 384×384 on Android. Window size affects presentation only; the image is fitted with letterboxing. The default scene is a Cornell-style room: red/green walls, a downward rectangular emitter, and two instances of a shared box mesh. The original triangle remains available through `--scene triangle`.

## Scene data and integration

The room and unit box have separate BLASes; TLAS instance transforms position the boxes. Instance custom indices select the first world-space shading triangle for that instance. The primitive index addresses the remaining triangle data. World-space shading geometry is currently flattened per instance for simplicity; the shared BLAS still avoids rebuilding identical geometry. All GPU structures use explicit 16-byte lanes with C++ size/offset assertions.

`pathtrace.comp` implements `traceClosest` and `traceAny`, cosine-weighted Lambertian scattering, uniform sampling on one rectangular area light, power-heuristic MIS, and Russian roulette after three scattering events. Both NEE and BSDF-hit emission use the same solid-angle light PDF. Emitters radiate from their front side. `maxBounces` limits diffuse scattering events; a final continuation intersection still accounts for directly hit emitters. The finite bounce limit truncates light transport; this is configurable and differs from the unlimited-path solution.

Each pixel/sample gets a deterministic PCG stream derived from pixel ID, absolute sample index and seed. It is independent of frame grouping. The integrator averages linear radiance into a device-local FP32 buffer. No radiance clamp or denoiser is applied. The display uses exposure in EV, Reinhard mapping and explicit sRGB encoding. PNG exports display pixels; PFM exports original linear RGB radiance with no exposure or tone mapping.

Camera changes reset the sample counter and overwrite prior history. Exposure changes retain history. At the sample cap, the compute pass only redisplays stored radiance. The latest active-sampling GPU time is tracked separately from display-only dispatches. Android camera gestures retain the API-neutral camera across native-window recreation; the GPU history restarts when the backend is recreated.

## Desktop asset extension (2026-11-13)

Gallery adds a 16 × 14 floor, multiple emitters and shared mesh instances. `core/gltf.cpp` imports static opaque glTF/GLB with cgltf and decodes PNG/JPEG with stb_image. Selected-scene node transforms append world-space shading records while retaining shared BLAS meshes. GpuTriangle is 144 bytes (UV0 added), GpuMaterial is 64 bytes (PBR and texture indices added), and push constants remain 128 bytes.

Binding 7 is an RGBA8 texture storage buffer with size, offset and wrapping headers. Compute shaders perform linear-space bilinear filtering and evaluate a Lambert/GGX metallic-roughness mixture with a matching PDF. Normal-map frames come from triangle edges and UV0. Mipmaps, authored tangents, transparency and full glTF material extensions are not implemented. Ordinary path mode needs five compute storage buffers, spatial mode six. Descriptor, buffer-range and acceleration-structure limits are checked.

The desktop panel can open and frame a model; invalid assets restore previous settings. External assets are gated out of experimental spatial reuse. See [scope and validation](experiments/asset-gallery.md). This extension has desktop validation only.

## Vulkan baseline and capability gates

The prototype requires Vulkan 1.2. This makes SPIR-V 1.4 and the core buffer-device-address API available without extra extension variants. Ray Query additionally requires the acceleration-structure, ray-query and deferred-host-operations extensions, their applicable feature bits, bufferDeviceAddress and the required image/vertex formats.

Queries report unsupported devices rather than silently enabling missing features. The diagnostic compute pipeline uses neither acceleration structures nor Ray Query. `--force-fallback` exercises this path even on a capable GPU.

## Lifetime and synchronization

- Scene build inputs survive each completed build; AS storage survives tracing. Scratch addresses satisfy the queried device alignment.
- BLAS/TLAS build writes are made visible to subsequent AS builds and compute traversal.
- Compute output transitions between shader-write and transfer-read use. Readback includes a transfer-to-host barrier and waits for completion.
- The accumulation buffer has shader-write/read and transfer-read dependencies across frames and readbacks. Resetting the sample counter does not discard these dependencies; the previous GPU writer still completes before overwrite.
- A frame fence protects the command buffer and acquire semaphore. Present-complete semaphores are per swapchain image, so a previous presentation has released the image before its semaphore is reused.
- Resize drains the device, rebuilds the swapchain and preserves the fixed internal image. On Android window termination, the backend is destroyed before the native window is released; initialization creates a fresh backend. Rendering pauses when the app is paused or loses focus.
- Android activity recreation starts a fresh render session. Camera changes reset accumulation; presentation-only resize preserves it. Scene/internal-resolution replacement currently requires a new renderer.

## Validation strategy

Capability tests independently remove each required feature. The GPU smoke test reads every pixel and compares ray-query hit coverage to an analytic CPU triangle oracle, allowing a small floating point edge tolerance. Color and alpha are also checked. The test returns code 77 (skip) if hardware RT is unavailable; initialization failures remain failures.

The Cornell normal pass is compared to CPU triangle intersections, excluding rays exactly on non-coplanar shared edges, where either normal is valid. Accumulation tests cover deterministic replay, camera invalidation, exposure preservation, sample caps and equivalence of progressive/batched samples. `tests/validate_integrator.py` checks decreasing error against an independently seeded high-sample image and compares MIS energy to a BSDF-only estimator for direct and full light transport.

Vulkan validation is enabled when `VK_LAYER_KHRONOS_validation` is installed; logs explicitly say when it is absent. A passing image test alone is not evidence that Vulkan validation ran. Android writes capability, image and smoke-test artifacts into the app's files directory and logs through the `Raytrace` tag.

Desktop rendering is evidence for the desktop backend only. Android compilation and Android device runs are reported separately. Fold/unfold, window resize, pause/resume and sustained GPU timing require physical-device checks. Metal and iOS remain unimplemented and unverified.

## References

- [Vulkan ray tracing extensions](https://docs.vulkan.org/guide/latest/extensions/ray_tracing.html)
- [Buffer device address](https://docs.vulkan.org/guide/latest/buffer_device_address.html)
- [Android NDK with CMake](https://developer.android.com/ndk/guides/cmake)
- [PBRT: A Better Path Tracer](https://pbr-book.org/4ed/Light_Transport_I_Surface_Reflection/A_Better_Path_Tracer)
