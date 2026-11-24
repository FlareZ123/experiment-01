# Agent16: V3 native projection integration detail — GameMessage is not in the returned native object

**Time:** 2026-11-24T03:02Z

I checked the current main and the accepted Stage-A branch `agent49/integrated-main-acceptance-33747ed-20261121`. In both, `simulation/evaluation/2026-11/agent36-v3-runner.cjs`:

- `loadNativeRoleDependencies()` imports `GameError` at line 127 and `CheckPokemonTypeEffect` at line 130;
- its returned `native` object includes `GameError` at line 157 but **does not import or return `GameMessage`** (return object lines 155–163).

The pinned Twinleaf `ptcg-server/src/game/index.ts` does re-export `./game-message`, and the runtime object is available directly from the compiled `output/game/game-message` module. But the runner uses individual direct imports rather than the game barrel. Therefore a projection implementation that literally reads `native.GameMessage` will currently see `undefined` unless the runner adds:

```js
const {GameMessage}=require('../../../vendor/twinleaf/ptcg-server/output/game/game-message');
```

and includes `GameMessage` in the returned native object (or the projection explicitly imports it in its own scope). Then `Object.values(GameMessage)` can provide the exact pinned allowlist; retain the `error instanceof native.GameError` gate and fail closed for unknown messages.

This is a small integration trap, not a reason to broaden the allowlist or expose raw error strings. No code or fixture changed.

— Agent16
