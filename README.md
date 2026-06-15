> **You are on `main`** — clean baseline, no worklets/reanimated.

# react-native-reanimated / worklets — iOS memory repros

Minimal repros measuring iOS **memory footprint** growth when adding
`react-native-worklets` / `react-native-reanimated` to a clean React Native app.

The blowup (mounting a single `<Animated.View>` → **86 MB** in prod) only happens
with the **default Hermes (v1) + worklets legacy mode**. Two independent fixes
each keep the footprint flat:

1. **Hermes bytecode < v1** — `byteCodeVersion: 96` + `hermes-compiler@0.16.0` + `hermes-engine@0.17.0` (the `-prev1` branches)
2. **Worklets Bundle Mode** — `bundleMode: true` babel/metro + metro patches (the `bundleMode` branches)

Upstream issue: https://github.com/software-mansion/react-native-reanimated/issues/9650

## Setup

- Clean app from `@react-native-community/cli` (**no Expo**)
- React Native **0.86.0**, React **19.2.3**
- `react-native-worklets` **0.9.2**, `react-native-reanimated` **4.4.1**
- Platform: **iOS**

## Branches

Naming: `repro-ios-<mode>-<variant>[-prev1]`

- **`<mode>`** — `legacy` (default worklets) or `bundleMode` (worklets [Bundle Mode](https://docs.swmansion.com/react-native-worklets/docs/bundleMode/), babel/metro toggle + metro patches via `patch-package`)
- **`-prev1`** suffix — Hermes bytecode **< v1**: `byteCodeVersion: 96`, `overrides.hermes-compiler 0.16.0`, and `hermes-engine 0.17.0` pinned in `ios/Podfile` (`RCT_HERMES_V1_ENABLED=0`)
- Setups (no repro code): `main`, `prev1-setup`, `bundleMode-setup`, `bundleMode-prev1-setup`

| `<variant>` | `App.tsx` change | Extra dep |
|---|---|---|
| `scheduleOnUIOnly` | `scheduleOnUI(() => { ... })` | `react-native-worklets` |
| `importReanimatedOnly` | `import Animated` + `console.log(Animated)` | `react-native-reanimated` |
| `mountAnimatedViewOnly` | renders `<Animated.View>` | `react-native-reanimated` |
| `useAnimatedStyle` | `<Animated.View>` + animated opacity via `useAnimatedStyle` | `react-native-reanimated` |
| `cssAnimation` | `<Animated.View>` + reanimated v4 CSS animation | `react-native-reanimated` |

> Deps are scoped per branch: worklets-only branches do **not** pull in reanimated.

## Results — iOS memory footprint (prod)

`—` = not measured · `n/a` = branch doesn't exist

### Hermes v1 (default)

| Variant | Legacy mode | Bundle mode |
|---|---|---|
| Clean | 20 MB | 21 MB |
| + worklets (`scheduleOnUIOnly`) | 33 MB | 23 MB |
| + reanimated import (`importReanimatedOnly`) | 33 MB | — |
| + mounted `<Animated.View>` (`mountAnimatedViewOnly`) | 86 MB 😨 | 25 MB ✅ |
| + `useAnimatedStyle` | — | — |
| + reanimated CSS animation (`cssAnimation`) | — | 24 MB |

**Bundle mode fixes the blowup on Hermes v1** — a mounted `<Animated.View>`
stays at **25 MB** instead of 86 MB, no bytecode workaround needed. A bare
reanimated import is the same cost as worklets in legacy prod (33 MB); mounting
the view is what explodes.

### Hermes < v1 (`byteCodeVersion: 96`)

| Variant | Legacy mode | Bundle mode |
|---|---|---|
| Clean | 20 MB | 21 MB |
| + worklets (`scheduleOnUIOnly`) | 21 MB | 23 MB |
| + reanimated import (`importReanimatedOnly`) | 22 MB | — |
| + mounted `<Animated.View>` (`mountAnimatedViewOnly`) | 22 MB 👌 | 25 MB |

Targeting Hermes bytecode < v1 also keeps it flat — the 86 MB blowup is
**specific to Hermes v1 + legacy worklets**. (No `cssAnimation`/`useAnimatedStyle`
`-prev1` branches exist.)

### Hermes v1 — dev build (legacy mode)

| Variant | Footprint |
|---|---|
| Clean | 106 MB |
| + worklets (`scheduleOnUIOnly`) | 120 MB |
| + reanimated import (`importReanimatedOnly`) | 240 MB |

Calling `scheduleOnUI` vs. not makes **no difference** — the cost is in adding
the dependency, not in invoking it.

## Run a repro

```sh
git checkout <branch>
npm install                 # postinstall applies metro patches (bundle mode branches)
cd ios && bundle exec pod install && cd ..
npm start -- --reset-cache  # bundle mode branches
npm run ios                 # prod: build the Release scheme in Xcode
```

> Switching between a `-prev1` and a non-`-prev1` branch flips `hermes-engine`
> (0.17.0 ↔ 250829098.0.14). If `pod install` errors with *"you've changed the
> version of hermes-engine"*, run `cd ios && pod update hermes-engine --no-repo-update`.
