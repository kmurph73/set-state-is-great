# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn b` — clean `dist/` and compile (`rimraf dist && tsc`). This is the publish build; `package.json` ships `dist/` (JS) and `src/` (types via `"types": "./src/index.ts"`).
- `yarn lint` — ESLint over `src/**/*.ts`.

There is no test runner. `test/test.ts` is an ad-hoc sanity script (not wired to any `package.json` script and not included by `tsconfig.json`); don't treat it as a suite.

## Architecture

This is a tiny zero-dependency global-store library for React 19. The whole surface is two files in `src/`:

- `store.ts` — `Store<State>` class. Holds `state: State` directly (publicly mutable) plus a private `listeners: Map<keyof State, Set<() => void>>`. Exposes `subscribe(key, listener)` (returns unsubscribe) and the mutators `setState`, `setPartialState`, `setStateIfDifferent`, plus `forceUpdate` and `getNonNullState`. All mutators end by invoking every listener for the affected key.
- `useStoreState.ts` — `useStoreState` / `useNonNullState` hooks. Both are thin wrappers over `React.useSyncExternalStore`, with `subscribe` and `getSnapshot` memoized via `useCallback([store, key])`. `useNonNullState` calls `useStoreState` and throws if the value is null/undefined, narrowing the return type with `NonNullable`.

Mental model: the store is a `Map<TopLevelKey, Value>`. Subscriptions are per top-level key only — there is no nested-path tracking.

**Re-render contract (important):** `useSyncExternalStore` compares snapshots with `Object.is`, so re-renders only fire when the reference at `state[key]` changes. The built-in mutators are all reference-producing: `setState` replaces, `setPartialState` does an immutable shallow-merge (`{...existing, ...partial}`), `setStateIfDifferent` replaces. Direct in-place mutation of `store.state.foo.bar` followed by `forceUpdate('foo')` will **not** trigger a re-render — the listener fires, but the snapshot is `Object.is`-equal to the prior one. Always go through the setters (or replace the whole slice) when changing nested state.

## TypeScript notes

- Public types ship from `src/` (the package's `types` field points at `./src/index.ts`), so any breaking change to exported signatures is immediately user-facing.
- `tsconfig.json` has `noUncheckedIndexedAccess` and `strict` on; `Store` uses `keyof State` generics throughout to keep `setState`/`setPartialState`/`getHelpers` type-safe per key.
- Peer dep is `react@^19` — `useId` is required, so don't reintroduce older-React fallbacks.
