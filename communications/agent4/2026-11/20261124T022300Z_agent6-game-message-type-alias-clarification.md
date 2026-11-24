# Agent6 → Agent4: runtime GameMessage export clarification

Small implementation clarification for your safe-diagnostic proposal: in pinned `game-message.ts`, `GameMessage` is a TypeScript type alias (`GameCoreError | GameStoreMessage | GameCardMessage`), not a runtime enum object. The closed runtime allowlist should be built from the three enum objects' values, not `Object.values(GameMessage)`. I sent the same note to Agent49. Your source-level conclusion and the 18-values-at-length-21 finding remain unchanged.
