> **You are on `main`** — clean baseline, no worklets/reanimated.

# react-native-reanimated / worklets — iOS memory repros

Minimal repros measuring iOS **memory footprint** growth when adding
`react-native-worklets` / `react-native-reanimated` to a clean React Native app,
on **two Hermes bytecode targets**.

The blowup only happens on the **default Hermes (v1)**. Targeting
**Hermes bytecode < v1** (`byteCodeVersion: 96` in `metro.config.js`) the
footprint stays flat.

Upstream issue: https://github.com/software-mansion/react-native-reanimated/issues/9650

## Setup

- Clean app from `@react-native-community/cli` (**no Expo**)
- React Native **0.86.0**, React **19.2.3**
- `react-native-worklets` **0.9.2**, `react-native-reanimated` **4.4.1**
- Worklets in **legacy mode**
- Platform: **iOS**

Each repro lives on its own branch — one variable changed per branch.

Two Hermes targets:

- **Hermes v1** (default) — `main`-based branches
- **Hermes < v1** (`byteCodeVersion: 96`) — `prev1-setup`-based branches, suffixed `-prev1`

## Branches

| Branch | `App.tsx` change | Extra dep |
|---|---|---|
| `main` | none — bare template | none |
| `prev1-setup` | none — bare template, Hermes bytecode 96 | none |
| `repro-ios-legacy-scheduleOnUIOnly` | `scheduleOnUI(() => { ... })` from `react-native-worklets` | `react-native-worklets` |
| `repro-ios-legacy-importReanimatedOnly` | `import Animated` + `console.log(Animated)` | `react-native-reanimated` |
| `repro-ios-legacy-mountAnimatedViewOnly` | renders `<Animated.View>` in the tree | `react-native-reanimated` |
| `repro-ios-legacy-scheduleOnUIOnly-prev1` | same as above, Hermes bytecode 96 | `react-native-worklets` |
| `repro-ios-legacy-importReanimatedOnly-prev1` | same as above, Hermes bytecode 96 | `react-native-reanimated` |
| `repro-ios-legacy-mountAnimatedViewOnly-prev1` | same as above, Hermes bytecode 96 | `react-native-reanimated` |

> Deps are scoped per branch: worklets-only branches do **not** pull in reanimated.

## Results — iOS memory footprint

### Hermes v1 (default)

**Dev build**

| Variant | Footprint |
|---|---|
| Clean (`main`) | 106 MB |
| + worklets (`scheduleOnUIOnly`) | 120 MB |
| + reanimated import (`importReanimatedOnly`) | 240 MB |

Using `scheduleOnUI` vs. not calling it makes **no difference** — the cost is
in adding the dependency, not in invoking it.

**Prod build**

| Variant | Footprint |
|---|---|
| Clean (`main`) | 20 MB |
| + worklets (`scheduleOnUIOnly`) | 33 MB |
| + reanimated import (`importReanimatedOnly`) | 33 MB |
| + mounted `<Animated.View>` (`mountAnimatedViewOnly`) | 86 MB 😨 |

A bare reanimated import is the same cost as worklets in prod (33 MB), but
**mounting a single `<Animated.View>` jumps to 86 MB**.

### Hermes < v1 (`byteCodeVersion: 96`)

**Prod build**

| Variant | Footprint |
|---|---|
| Clean (`prev1-setup`) | 20 MB |
| + worklets (`scheduleOnUIOnly-prev1`) | 21 MB |
| + reanimated import (`importReanimatedOnly-prev1`) | 22 MB |
| + mounted `<Animated.View>` (`mountAnimatedViewOnly-prev1`) | 22 MB 👌 |

Targeting Hermes bytecode < v1 the footprint is **flat** — adding worklets,
importing reanimated, and mounting an `<Animated.View>` all stay within ~2 MB
of clean. The 86 MB blowup is **specific to Hermes v1**. (`scheduleOnUI`
called vs. not still makes no difference.)

## Run a repro

```sh
git checkout <branch>
npm install
cd ios && bundle exec pod install && cd ..
npm run ios          # dev
# prod: build Release scheme in Xcode
```
