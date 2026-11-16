# Cornell Box milestone 0.2

## Implemented scope

- Cornell-style room, red/green diffuse walls, one downward area light, two transformed instances of a shared box mesh.
- Compute Ray Query path tracing, cosine-weighted diffuse scattering, NEE + power-heuristic MIS, Russian roulette, configurable scatter limit.
- FP32 progressive averaging, camera invalidation, display-only exposure updates, configurable sample caps and deterministic seed.
- Desktop fly camera, Android orbit/pinch/exposure gestures, PNG display output and linear HDR PFM output with render metadata.

This is a diffuse reference renderer. Textures, glTF, metals, glass, environment lighting, denoising and Metal/iOS are not implemented.

## Desktop evidence

Release builds passed on NVIDIA GeForce RTX 4070 SUPER and AMD Radeon(TM) Graphics. Khronos validation and synchronization validation were enabled for the desktop GPU checks.

- Five CTest checks passed: capability gating, scene/light/instance invariants, original triangle oracle, Cornell primary-ray normal oracle, accumulation state checks.
- Cornell geometry diagnostics passed on both GPUs. Physical-corner rays with ambiguous face normals are excluded explicitly; all other compared pixels matched.
- Camera movement resets history; replay with the same camera/seed reproduces radiance. Grouping four samples in one dispatch matches four progressive frames. Exposure changes retain linear history and sample caps are respected.
- Cornell window resizing passed over 120 frames: 960×720 → 640×480 → 540×800 → 960×720. It accumulated 120 spp without a Vulkan validation error.
- 512×512 / 1024 spp output was rendered, inspected and saved as `output/cornell-final.png`.

## Integrator checks

`python tests/validate_integrator.py build/Release/raytrace.exe` renders 96×96 images and compares linear radiance, not tone-mapped display values. The convergence reference uses 4096 spp and a different seed. Directly visible emitter pixels are excluded from these diffuse-illumination statistics (9076 pixels retained).

| Quantity | Observed result |
| --- | --- |
| MSE at 8 spp | 0.00271079 |
| MSE at 64 spp | 0.000349545 |
| MSE at 512 spp | 0.0000480348 |
| Direct-light MIS / BSDF-only mean energy | 0.998793 |
| Full-path MIS / BSDF-only mean energy | 1.000301 |
| Full-path / one-scatter mean energy | 1.933620 |

These checks detect non-convergence, major PDF/double-counting errors and missing indirect light. Agreement between two estimators is useful evidence, not a proof of an unbiased unlimited-path solution: the configured bounce limit truncates transport and ray offsets introduce a small geometric approximation.

## Android evidence

The arm64-v8a debug APK compiled successfully. Magic V5 (Adreno 830, Android 16) ran the Cornell integrator and produced progressive PNG snapshots and a linear HDR image. The retrieved image was inspected and showed diffuse indirect illumination and soft shadows.

During interactive testing, metrics showed 384×384, eight allowed diffuse scattering events, one new sample per dispatch and about 1.37 ms for one sampled dispatch. The changing sample counter and exposure field confirmed history invalidation and exposure interaction. This is a diagnostic sample, not a sustained or thermal performance claim.

Android Vulkan validation is not enabled; desktop validation is not substituted for device evidence.

The final Android build passed the 65×49 fixed-camera normal/geometry self-test. It also completed a 96×96, 512 spp, 8-scatter render with the same camera and seed as the desktop reference. All radiance checks passed at the sample cap, and the retrieved metadata confirmed the expected camera, seed, exposure and estimator.

| Comparison to NVIDIA reference, 96×96 / 512 spp | Diffuse energy ratio | Luminance RMSE |
| --- | --- | --- |
| Adreno 830 / NVIDIA | 0.999999757 | 0.00000542364 |
| AMD / NVIDIA | 1.000000374 | 0.00000284843 |

These cross-GPU statistics retain 9077 diffuse pixels and exclude directly visible emitter pixels. They demonstrate close numerical agreement for this scene/seed, not general device compatibility. Artifacts are in `output/android-comparison/`, `output/android-normals/` and `output/integrator/`.

The final default-size device run completed 2048 spp at 384×384 and passed radiance checks at the cap. One active one-sample/eight-scatter dispatch measured 1.32396 ms; the later display-only dispatch measured 0.0541 ms. The metadata recorded the user-adjusted camera and exposure, confirming that the completed image was from the interactive run rather than the fixed comparison.

The user confirmed orbit, pinch/exposure, fold/unfold and background recovery with continued convergence. Retrieved lifecycle events also show 1060×2376 → 2172×2352 → 1060×2376 surface changes. No application error artifact was present. Thermal endurance and broader scenes/devices remain outside this milestone.

## Reproduction

```powershell
./tools/build.ps1 -Test
python tests/validate_integrator.py build/Release/raytrace.exe
./build/Release/raytrace.exe --headless --spp 1024 --samples-per-frame 8 --self-test --output output/cornell-final.png
./tools/build-android.ps1 -JavaHome 'your JDK directory'
```

See [architecture](architecture.md) for data layouts, synchronization and estimator details, and [milestone 0.1](validation.md) for the initial device bring-up.
