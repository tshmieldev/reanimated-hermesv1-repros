# react-native-reanimated / worklets — iOS memory repros

A single mounted reanimated component balloons iOS memory on **default Hermes (v1) + legacy worklets** — up to **128 MB**. Both **worklets Bundle Mode** and **Hermes bytecode < v1** keep it flat (~17–25 MB). One variable per branch.

Measured with the **Leaks** instrument in Xcode · RN 0.86.0, reanimated 4.4.1, worklets 0.9.2, iOS.
Origin: https://github.com/software-mansion/react-native-reanimated/issues/9650

## Prod (release build)

| Variant | Legacy · v1 | Bundle · v1 | Legacy · <v1 | Bundle · <v1 |
|---|---|---|---|---|
| Clean | 20 MB | 21 MB | 20 MB | 21 MB |
| + worklets (`scheduleOnUI`) | 33 MB | 23 MB | 21 MB | 23 MB |
| + reanimated import | 33 MB | 24 MB | 22 MB | 17 MB |
| + mounted `<Animated.View>` | 86 MB 😨 | 25 MB | 22 MB | 25 MB |
| + `useAnimatedStyle` | 128 MB 😱 | 25 MB | 23 MB | 24 MB |
| + reanimated v4 CSS animation | 87 MB 😨 | 24 MB | 22 MB | 17 MB |

- **Legacy / Bundle** — worklets [legacy mode](https://docs.swmansion.com/react-native-worklets/) vs [Bundle Mode](https://docs.swmansion.com/react-native-worklets/docs/bundleMode/)
- **v1 / <v1** — default Hermes vs bytecode `< v1` (`byteCodeVersion: 96` + `hermes-compiler@0.16.0` + `hermes-engine@0.17.0`)
- The blowup is **legacy + Hermes v1 only**, and only when a reanimated component is **mounted** (a bare import stays at 33 MB).

## Dev build (Hermes v1, legacy)

| Variant | Footprint |
|---|---|
| Clean | 106 MB |
| + worklets (`scheduleOnUI`) | 120 MB |
| + reanimated import | 240 MB |

Calling `scheduleOnUI` vs. not makes no difference — the cost is adding the dependency, not invoking it.
