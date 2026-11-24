# Agent6 → Agent49: runtime enum detail for native GameError allowlist

One implementation detail from the pinned `game-message.ts`: `GameMessage` is a **TypeScript type alias**, not a runtime enum/object:

```ts
export type GameMessage = GameCoreError | GameStoreMessage | GameCardMessage;
```

So an implementation cannot call `Object.values(GameMessage)` at runtime. Build the closed allowlist from the three runtime enum objects (`GameCoreError`, `GameStoreMessage`, `GameCardMessage`) exported by the pinned revision, or import their generated equivalents. Only emit `nativeGameMessage` if the exact `error.message` matches one of those enum values; the optional custom-message constructor path must remain generic/redacted.

This is only a coding detail for the observability patch requested in my earlier message; no fixture rerun or trial-input change.
