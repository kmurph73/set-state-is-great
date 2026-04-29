# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn b` — clean `dist/` and compile (`rimraf dist && tsc`). This is the publish build; `package.json` ships `dist/` (JS) and `src/` (types via `"types": "./src/index.ts"`).
- `yarn lint` — ESLint flat-config over `src/**/*.ts`.

There is no test runner. `test/test.ts` is an ad-hoc sanity script (not wired to any `package.json` script and not included by `tsconfig.json`); don't treat it as a suite.

## Architecture

This is a tiny zero-dependency global-store library for React 19. The whole surface is two files in `src/`:

- `store.ts` — `Store<State>` class. Holds `state: State` directly (publicly mutable) plus a private `listeners: Map<keyof State, Set<() => void>>`. Public methods: `subscribe(key, listener)` (returns unsubscribe), `setState(key, value)`, `setPartialState(key, partial)`, and `getNonNullState(key)`. A private `notify(key)` walks the listener set; both setters end by calling it.
- `useStoreState.ts` — `useStoreState` / `useNonNullState` hooks. Both are thin wrappers over `React.useSyncExternalStore`, with `subscribe` and `getSnapshot` memoized via `useCallback([store, key])`. `useNonNullState` delegates to `useStoreState` and throws if the value is null/undefined, narrowing the return type with `NonNullable`.

Mental model: the store is a `Map<TopLevelKey, Value>`. Subscriptions are per top-level key only — there is no nested-path tracking.

**Re-render contract (important):** `useSyncExternalStore` compares snapshots with `Object.is`, so re-renders only fire when the reference at `state[key]` changes. Both setters are reference-producing: `setState` replaces, `setPartialState` does an immutable shallow-merge (`{...existing, ...partial}`). Direct in-place mutation of `store.state.foo.bar` will **not** trigger a re-render — the underlying reference at `state.foo` is unchanged, so `Object.is(prev, next)` is true and React bails out. To force a re-render after such a mutation, replace the slice with a shallow copy: `store.setState('foo', { ...store.state.foo })`.

There is intentionally no public `forceUpdate` and no `setStateIfDifferent`. The former existed to support the mutate-and-notify pattern back when the library used `useReducer` dispatch as the listener (which always re-rendered); under `useSyncExternalStore` it would silently no-op for in-place mutations and confuse callers. The latter was a manual short-circuit for an unconditional re-render path that no longer exists — `setState` with the same value already no-ops at React's snapshot-comparison layer. Don't reintroduce either without a clear reason.

## Toolchain

- Peer dep is `react@^19`. `useSyncExternalStore` is the only React API consumed.
- ESLint 10 flat config in `eslint.config.mjs`. Uses the unified `typescript-eslint` package and `eslint-plugin-react-hooks` v7's `configs.flat['recommended-latest']` preset (note: this preset is much broader than v5's two-rule preset — `static-components`, `use-memo`, `immutability`, `set-state-in-effect`, etc. are all on). Project-level overrides: `@typescript-eslint/explicit-function-return-type` off, `react-hooks/exhaustive-deps` set to warn.
- TypeScript 6, `module: esnext` + `moduleResolution: bundler`. `strict` and `noUncheckedIndexedAccess` are on; `Store` uses `keyof State` generics throughout to keep the setters type-safe per key.
- Public types ship straight from `src/` (the package's `types` field is `./src/index.ts`), so any breaking change to exported signatures is immediately user-facing.
