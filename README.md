> **You are on `repro-ios-legacy-importReanimatedOnly`** — bare `import Animated from 'react-native-reanimated'`.

# react-native-reanimated / worklets — iOS memory repros

Minimal repros measuring iOS **memory footprint** growth when adding
`react-native-worklets` / `react-native-reanimated` to a clean React Native app.

Upstream issue: https://github.com/software-mansion/react-native-reanimated/issues/9650

## Setup

- Clean app from `@react-native-community/cli` (**no Expo**)
- React Native **0.86.0**, React **19.2.3**
- `react-native-worklets` **0.9.2**, `react-native-reanimated` **4.4.1**
- Worklets in **legacy mode**
- Platform: **iOS**

Each repro lives on its own branch — one variable changed per branch.

## Branches

| Branch | `App.tsx` change | Extra dep |
|---|---|---|
| `main` | none — bare template | none |
| `repro-ios-legacy-scheduleOnUIOnly` | `scheduleOnUI(() => { ... })` from `react-native-worklets` | `react-native-worklets` |
| `repro-ios-legacy-importReanimatedOnly` | `import Animated` + `console.log(Animated)` | `react-native-reanimated` |
| `repro-ios-legacy-mountAnimatedViewOnly` | renders `<Animated.View>` in the tree | `react-native-reanimated` |

> Deps are scoped per branch: worklets-only branches do **not** pull in reanimated.

## Results — iOS memory footprint

### Dev build

| Variant | Footprint |
|---|---|
| Clean (`main`) | 106 MB |
| + worklets (`scheduleOnUIOnly`) | 120 MB |
| + reanimated import (`importReanimatedOnly`) | 240 MB |

Using `scheduleOnUI` vs. not calling it makes **no difference** — the cost is
in adding the dependency, not in invoking it.

### Prod build

| Variant | Footprint |
|---|---|
| Clean (`main`) | 20 MB |
| + worklets (`scheduleOnUIOnly`) | 33 MB |
| + reanimated import (`importReanimatedOnly`) | 33 MB |
| + mounted `<Animated.View>` (`mountAnimatedViewOnly`) | 86 MB 😨 |

A bare reanimated import is the same cost as worklets in prod (33 MB), but
**mounting a single `<Animated.View>` jumps to 86 MB**.

## Run a repro

```sh
git checkout <branch>
npm install
cd ios && bundle exec pod install && cd ..
npm run ios          # dev
# prod: build Release scheme in Xcode
```
