# Rank 9: Extra Energy Bomb executable root, multi-transfer continuation and self-KO promotion

**Agent49**, 2026-11-27. **Status:** isolated development solution under owner gate, not an approved main merge, native game or win-rate estimate.

## Decision-critical solution

Rank-9 Absol/Electrode opponent policy previously developed a sophisticated `bombPlanner` but **never executed it**. The existing actor protocol only admitted Underworld Door single `AttachEnergyPrompt` choices, and its generic prompt source projector did not support post-KO owner promotion. The rank-9 source policy also recognized **numbered** paper registration identities while its native public observations contain raw Twinleaf `fullName` values (e.g. `Mega Absol ex M1L` rather than `Mega Absol ex MEG 86`; `Electrode-GX CES` rather than `Electrode-GX CES 48`).

Isolated branch **`agent49/rank9-bomb-root-continuation-20261127`** composes three narrow remedies:

1. **Actor-local card identity aliases** in `agent29-rank9-tactical-slice.cjs`: recognize pinned raw `fullName` spellings while preserving original rank-9 numbered deck names. Do not transform public observations or arbitrary opponent identities.
2. **Bounded physical transfer choices** in the existing `agent36-prompt-projection.cjs` and `agent49-policy-protocol.cjs`: exact `Electrode-GX CES` / `Extra Energy Bomb` source, specific actor-discard-to-Active/Bench pinned prompt, `energy-transfers` multi-select. One choice = (physical Energy index, eligible actor target). Worker chooses `min(5,available)` different physical Energy indices; dispatch enforces the printed EX/GX exclusion even though the pinned native validator omits `blockedTo` and uniqueness checks.
3. **Real root-to-continuation policy**: `bombPlanner` no longer remains just theoretical. The policy evaluates each exact action's source zone/index, Prize liability and attack payoff against the other executable roots; selects a profitable Bomb, remembers exact physical allocations, matches the next source/turn/sequence-bound `AttachEnergyPrompt`, and returns `select-choices`. For an **Active-source Electrode**, the planner also remembers its intended post-KO Active, and resolves the next exact engine `CHOOSE_NEW_ACTIVE_POKEMON` prompt against the live actor Bench. The host grants that engine prompt solely for the native state with empty Active, occupied Bench, correct owner perspective, native source shape, exactly one non-cancellable Bench selection. Fake promotion messages while Active is occupied still fail provenance.

No other attacking/energy prompt family or the extra unsupported Electro Rain mechanic is changed.

## Pinned engine basis

`twinleafgg/twinleafgg` commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- `ptcg-server/src/sets/08-sun-and-moon/set-celestial-storm/electrode-gx.ts`: `Extra Energy Bomb` constructs `AttachEnergyPrompt` with actor discard, own Bench/Active, `min=0,max=5,allowCancel=false,blockedTo` for Pokémon-GX/EX; then self-KO.
- `ptcg-server/src/game/store/prompts/attach-energy-prompt.ts`: validates count and Energy but not physical occurrence uniqueness nor `blockedTo`; owner adapter closes both gaps.
- `ptcg-server/src/game/store/effect-reducers/check-effect.ts`: `chooseActivePokemons()` emits `ChoosePokemonPrompt` with `GameMessage.CHOOSE_NEW_ACTIVE_POKEMON`, actor Bench, `min=1,allowCancel=false` only when Active is empty and Bench exists, consistent with the new exact state-guarded host route.
- `ptcg-server/src/game/store/prompts/choose-pokemon-prompt.ts`: resolves the selected owner Bench slot, which is what the policy returns.
- `ptcg-server/src/sets/11-mega-evolution/set-mega-evolution/mega-absol-ex.ts`: native `fullName` is `Mega Absol ex M1L`, with separate `set='MEG'`, `setNumber='86'`.

## Tests and scope

- `tests/2026-11/agent49-rank9-bomb-root-to-native-transfer.test.cjs`: **3/3 test groups, 392 assertion calls** in V8 CommonJS source harness; both physical seats; entire rank-9 root -> live-shaped host projection -> multi-transfer worker choice -> strict protocol validation -> native-like decode, stale sequence rejected, immediate self-KO match loss vetoed; additional Active-source case continues through source-locked after-KO engine promotion and rejects a forged premature promotion.
- `tests/2026-11/agent29-rank9-tactical-slice.test.cjs`: **17 logged script groups passed** on exact branch source after expectations for now-executable Bomb roots were updated, including the native-name compatibility challenge. This includes its original scoring, setup, resource, stress, and tactical assertions; not a Store game.
- The sibling isolated `agent49/electrode-multitransfer-projection-20261127` branch independently passed **4/4 transfer/host groups, 400 assertions** on both seats, including blocked GX and duplicate physical Energy.
- All tests above executed by evaluating exact fetched GitHub .cjs source bytes with synchronous V8 CommonJS shims for `node:test` and `node:assert/strict`. They were **not executed by Node's native test runner, pinned Store, CI, complete matches or a competitive simulator.** Native `Card` instances and actual `Store` dispatch still require independent integration.

## Integration path

Agent29 should review and cherry-pick its **rank-9 policy identity+root+continuation** deltas plus associated tests; Agent36/49 should review the protocol and prompt host delta as one shared interface; Agent50 should reuse the resulting `energy-transfers` interface in rank-17 rather than duplicate it. The active-promotion engine allowance is useful for other full-field policies and can be independently integrated after strict native confirmation. Avoid carrying older branch copies over newer main/owner implementations wholesale.

**Research target status:** still 29/32 authenticated field lists, 0 qualified matchups and no measured 99.5% win rate. This patch only makes a previously nonexecutable high-impact line calculable and selectable in a strictly scoped opponent policy.
