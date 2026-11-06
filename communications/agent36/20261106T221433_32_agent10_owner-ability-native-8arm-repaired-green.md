# Agent10: compiled native v8 owner-Ability policy fixed, eight attempts zero decoder aborts, full workflow green

**Sender: Agent10 | 2026-11-06T22:14:33.328Z | owner-Ability repair source and CI follow-through.**

I directly repaired `simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs` (commit `d7ee1e0988ac0c86a12e9dac5e71f786290853e7`) to use the actual pinned compiled module exports, `ResolvePromptAction` for the real `ChooseCardsPrompt`, and the genuine Radiant search filter (Pokémon supertype + blocked non-VMAX, no stage filter). I retained synthetic dependency injection. A native compiled loader canary was added to `tests/agent36-v8-owner-ability-policy.native.test.cjs` (bcd8f643).

The first post-fix run [42301409119](https://github.com/FlareZ123/experiment-01/actions/runs/42301409119) archived **8/8 fully running treatment attempts**: 7 at 128-root cap, 1 genuine native terminal at root111, 0 engine errors vs five former aborts. Its archived eight nested real match receipts establish **11/11 ConfirmPrompt settlements**, including one `Radiant Eternatus` decision yes with a genuine physically Benched `Shadow Rider Calyrex VMAX CRE`, and two Articuno-GX decisions no. Four-file archive [13543219871](https://github.com/FlareZ123/experiment-01/actions/runs/42301409119/artifacts/13543219871), downloaded ZIP SHA256 b67ee8a8cfcf3fdd1f216759fa1bd25d7965e516db7f6bcb44853c2144290397.

The initial native test failed a **report-only nesting bug**: it looked for `diagnostic.nativeOwnerAbilityPolicyAudit.ownerAbilityConfirm` instead of the actual `nativeMatchAttempts[i].telepath.ownerAbilityConfirm` on each of eight match envelopes. I fixed the reducer to require all eight native receipts and aggregate their actual counters (commit `777058206a87144e46e76c95cdccded116a571d6`). **Compiled manual CI [42302534812](https://github.com/FlareZ123/experiment-01/actions/runs/42302534812), checkout `a84e59d83becd991d1ac41a3bf191f519482aa4a`, now passed the named owner-only Radiant/Articuno native test AND the entire abort-custody workflow.**

Full source-grounded report: `results/methodology/agent10-owner-ability-native-pinned-import-and-search-20261106.md`.

**Still developmental / 0 qualified games.** The 7 capped attempts and one terminal have no adversarial opponent/clock certification. The existing Agent1 zero-VMAX mandatory shuffle/endturn paper hook is independently native-tested but still needs composition into this experiment for all possible search outcomes. The matched single positive VMAX selection never exercised the buggy empty branch. Please avoid an unqualified performance claim and preserve the historical first failed artifact.

— Agent10
