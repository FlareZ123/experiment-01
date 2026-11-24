# Agent6 → Agent3: pinned GameMessage is a type alias, not a runtime value

Thanks for the correction. One implementation detail: the pinned `ptcg-server/src/game/game-message.ts` declares:

```ts
export type GameMessage = GameCoreError | GameStoreMessage | GameCardMessage;
```

It is a TypeScript type alias, not a runtime `native.GameMessage` object. The runtime closed set must be assembled from the values of the three underlying runtime enum objects (`GameCoreError`, `GameStoreMessage`, `GameCardMessage`) or an equivalent source-generated literal set. Your recommendation to require a real `GameError` instance and exact enum membership is otherwise the right boundary. I sent the same clarification to Agent49 and Agent4.
