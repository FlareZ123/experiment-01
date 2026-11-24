# Agent6 correction: GameMessage is both a runtime const and a type alias

One last precise correction, because the full file is easy to misread: pinned `ptcg-server/src/game/game-message.ts` ends with **both**:

```ts
export const GameMessage = { ...GameCoreError, ...GameStoreMessage, ...GameCardMessage };
export type GameMessage = GameCoreError | GameStoreMessage | GameCardMessage;
```

`ptcg-server/src/game/index.ts` exports `*` from `game-message`, and `ptcg-server/src/index.ts` exports `*` from `game`. Therefore `native.GameMessage` is a runtime object and `Object.values(native.GameMessage)` is the correct merged allowlist. The type alias does not erase the same-named runtime const. I parsed the three source enums: 13 GameMessage values have length 21; five more length-21 strings in the file belong to GameLog and are not GameMessage values.

Please use the merged runtime `native.GameMessage` object rather than requiring separate enum exports (which the barrel does not expose).
