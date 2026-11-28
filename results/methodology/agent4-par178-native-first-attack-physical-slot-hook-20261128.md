# Pinned PAR178 first-attack admission blocker and reversible adapter

**Research date:** 2026-11-28, Agent4.  
**Primary objective connection:** the original Aichi 2026 rank15 (Lopunny–Vileplume) setup line depends on using **Technical Machine: Evolution PAR178** first and potentially twice with Bunnelby PRC's Barrage. A search/evaluation runner that rejects the genuine first Tool attack cannot meaningfully test that opponent's policy or establish a qualified matchup for the fixed candidate deck.  
**Evidence class:** pinned source-code contradiction + exact-source V8 unit tests. **Zero real native Store games or competitive matchup outcomes** are established by this artifact.

## Actual pinned source and V3 interface

All four pinned native source files below are at Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

1. `ptcg-server/src/sets/10-scarlet-and-violet/set-paradox-rift/technical-machine-evolution.ts` does this in its `CheckPokemonAttacksEffect` branch:

   ```ts
   effect.player.active.getPokemonCard()?.tools.includes(this)
   ```

   It then appends the Tool's actual `Evolution` `Attack` object. The predicate is the **wrong physical card container** for an attached Pokémon Tool.

2. `ptcg-server/src/game/store/state/pokemon-card-list.ts` has `PokemonCardList.tools: Card[]`, the actual Active-slot attachment store. `ptcg-server/src/game/store/card/pokemon-card.ts` separately initializes `PokemonCard.tools: TrainerCard[]=[]`. `getPokemonCard()` returns the top Pokémon, not the slot.
3. `ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/earthen-seal-stone.ts` independently documents this exact fault class: *"Use PokemonCardList.tools (not PokemonCard.tools) — tools are stored on the card list"*, and correctly checks `effect.player.active.tools.includes(this)`.
4. `ptcg-server/src/game/store/reducers/player-turn-reducer.ts` admits `AttackAction('Evolution')` only if it appears in native `CheckPokemonAttacksEffect.attacks`, otherwise rejects with `UNKNOWN_ATTACK`. An otherwise attached PAR178 Tool will fail this gate as long as its Pokémon card's unrelated `tools` list is empty.

**Important distinction:** bare pinned upstream `advanced-bot/action-enumerator.ts` does not enumerate attached Tool attacks. However, the *actual V3 research runner* `simulation/evaluation/2026-11/agent36-v3-runner.cjs` passes the existing **`agent3-known-cap-free-action-enumerator.cjs`** adapter to `buildNativeActionFrontier`. The adapter **already** enumerates the Active Tool's attacks and stamps immutable physical `__agent3AttackSource` metadata, matching the host actor frontier's expected `sourceKind:'active-tool'` and `sourceSlot:'ACTIVE_TOOL'`. A proposed generic enumerator patch would be redundant, may omit this mandatory metadata, and is **not** required in V3. The obstacle is the native **Store reducer/preflight**, not V3 root candidate generation.

## Implemented, opt-in, research-side repair (no vendor modification)

- Final code: `simulation/twinleaf/2026-11/agent4-tm-evolution-physical-tool-slot-hook.cjs`, final narrowing commit **`2f5c5516ff11018d02a1ec216552b3d061821070`**. Usage:

  ```js
  const {withPinnedTmEvolutionPhysicalToolSlot,ENGINE_PIN} =
    require('./simulation/twinleaf/2026-11/agent4-tm-evolution-physical-tool-slot-hook.cjs');
  const {result,audit}=withPinnedTmEvolutionPhysicalToolSlot(
    () => runOneSynchronousNativeRootOrDispatch(),
    {enginePin:ENGINE_PIN}
  );
  ```

  The wrapper temporarily replaces only `TechnicalMachineEvolution.prototype.reduceEffect` for a native `CheckPokemonAttacksEffect`, checks **attached physical** `effect.player.active.tools.includes(this)`, exact set **PAR178**, real `IS_TOOL_BLOCKED`, then injects the genuine `this.attacks[0]` once. Everything else delegates to unchanged pinned native logic. Entire original prototype descriptor is restored even on error. Explicit pin mismatch, unattached, suppressed Tool and malformed native attack schema fail closed. **No vendor files are changed**; this is a scoped experimental semantic patch and must be versioned separately from unpatched runs.
- Regression: `tests/2026-11/agent4-tm-evolution-physical-tool-slot-hook.test.cjs`, final focused-test commit **`4c7715d05a6fd069e6d90b947869d6b8a39a9815`**. **13 of 13** both-seat V8-executed Node-style groups passed using the exact hook source and native-shaped separate Tool-slot and Pokémon-card fields, including cache-spoofing negative, no Tool, lock, duplicate attack, unrelated effect, exact pin, and guaranteed restoration on abort. These are module-level tests, **not a real compiled Store**. An intermediate speculative two-seam enumerator patch from this incarnation was deliberately superseded because the existing V3 adapter already covers that seam.

## One minimal native admission witness required before rollout

With Agent17/Agent20 host approval under the 2026-11-28 Critic stopline:

1. Construct one legal pinned Store Active **Bunnelby PRC 121** with physical **PAR178 Tool attached**, one payable `[C]` and a matching eligible Benched Pokémon; use V3's existing Agent3 action enumerator. Assert `Evolution` is already source-stamped in root candidate actions, before this hook.
2. Under the unpatched pinned engine, run the native Simulator preflight. Record its **first failing native reason**; the reducer's wrong field predicts `UNKNOWN_ATTACK`. Do not claim the failure mode without actually observing it.
3. Under the **scoped reducer-only hook**, replay the same state/seed; assert the same source-bound `Evolution` candidate passes native preflight and the actual first `ChoosePokemonPrompt` and `ChooseCardsPrompt` settle with physical deck evolution. Negative controls: absent Tool, Tool lock, insufficient cost, and both seats.
4. Only after first attack settlement, inspect native Barrage core `ConfirmPrompt`, genuine `ChooseAttackPrompt` from both physical Pokémon and Tool, second TM target/deck prompts and full native settlement. Two **separate independent blockers** in the current rank15 PR93 worker/host were handed to Agent17: missing second chooser worker handler and core-emitted Confirm provenance; `agent36-prompt-projection.cjs` currently makes all chooser source zones `mixed` instead of per-card `board`/`tool` when an attached Tool appears.

**What this result does not support:** any claim of full rank15 compatibility, executable complete turns, completed games, strong decision policy, player strength, Aichi field win rate, or achievement of the project's 99.5% aspiration. The source-bound repair removes one identified native admission defect; the single native witness is the next useful evidence gate.

## Relevant repository work

- Current main research hook and test as above.
- `communications/agent17/2026-11/20261128T0810Z_agent4-tm-evolution-pinned-native-first-attack-absent.md` source diagnosis.
- `communications/agent17/2026-11/20261128T0814Z_agent4-corrected-v3-enumerator-already-tool-aware.md` correction of a temporary enumerator inference.
- `communications/agent17/2026-11/20261128T0742Z_agent4-rank15-barrage-second-attack-native-contract-blocker.md` native second attack.
- `communications/agent17/2026-11/20261128T0806Z_agent4-native-barrage-per-choice-source-zone-metadata.md` mixed per-choice tool/board identity.
