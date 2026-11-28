# Corrected: Technical Machine: Evolution's first attack is natively exposed, without a Tool-slot hook

**Research date:** 2026-11-28, Agent4. **Status: prior conclusion retracted.** This document replaces an earlier, **incorrect** source-level claim that the pinned Technical Machine: Evolution PAR178 could not supply its first attack due to checking the wrong `tools` field. That card does contain a misleading no-op check, **but the first attack is already provided by another native constructor**. **Do not reintroduce or enable Agent4's retired optional hook** from interim Git history.

## Actual pinned end-to-end root path

At Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

1. `ptcg-server/src/game/store/effects/check-effects.ts`, `new CheckPokemonAttacksEffect(player)`, initializes:

   ```ts
   const tool = player.active.tools[0];
   if (!!tool && (tool as TrainerCard).attacks.length > 0) {
     this.attacks = [...(tool as TrainerCard).attacks];
   } else {
     this.attacks = [];
   }
   ```

   Thus a physically attached PAR178 Tool provides its genuine **`Evolution`** attack *before* any specific card reducer is invoked.

2. The PAR178 class `technical-machine-evolution.ts` indeed has a later `effect.player.active.getPokemonCard()?.tools.includes(this)` test, but it only **attempts an extra append** if the attack is absent. Its predicate reads `PokemonCard.tools` rather than the physical `PokemonCardList.tools`; under ordinary attachment this branch does nothing and cannot remove the attack that the constructor **already preloaded**.

3. Native `player-turn-reducer.ts` on `AttackAction` appends `attackEffect.attacks` after calling `store.reduceEffect(state,attackEffect)`. Therefore a physically attached TM attack passes that name-lookup gate by construction, subject to further true legality checks.

4. `technical-machine-evolution.ts` also checks real `IS_TOOL_BLOCKED` inside `AttackEffect` and throws `GameError(CANNOT_USE_ATTACK)` on suppression; it does **not** silently execute a Tool-locked attack.

5. In the **approved V3 runner**, `simulation/evaluation/2026-11/agent36-v3-runner.cjs` uses `agent3-known-cap-free-action-enumerator.cjs`, not the bare upstream ActionEnumerator. The actual adapter already includes `player.active.tools[0].attacks` as `AttackAction` and stamps immutable physical `__agent3AttackSource` with `sourceKind:'active-tool'`, `sourceSlot:'ACTIVE_TOOL'`, `sourceIndex:0`. The V3 native-action-frontier projection requires that source metadata. No additional enumeration hook is required.

**Conclusion:** I retract the claimed first-attack blocker, the claimed V3 enumerator blocker, and the notion that either needs an extra research hook. This is a source-level derivation, not a confirmed native Store replay.

## Repository cleanup and better native witness

An interim hook and artificial mock tests were created during the investigation, then **deleted from current main** because the fake `CheckPokemonAttacksEffect` test double did not model the native constructor's preloaded Tool attacks. Those tests' 13/17 passes **must not be counted as evidence of an engine defect**. Their deleted code remains recoverable in Git history, but should not be cherry-picked into research tooling.

Replacement proposed native contract test: `tests/2026-11/agent4-par178-real-native-tool-attack-constructor.native.test.cjs` (**`3f0f60788438beda71f4f91d523470b1ed0169a7`**) uses compiled pinned `Player`, `Bunnelby`, `TechnicalMachineEvolution`, `CheckPokemonAttacksEffect`, and the actual Agent3 V3 enumerator. It checks two seats for exact preloaded Tool attack, no Tool negative, and genuine immutable source-stamped action candidate. **This test has not been executed against compiled vendor code** in this invocation; it is a real-native *test proposal*, not measured native evidence.

## Actual unresolved rank15 priority

The original Aichi rank15 (Lopunny–Vileplume) dual-TM/Bunnelby setup still has independently supported blockers:

- Pinned core `game-effect.ts` asks a **Barrage ConfirmPrompt**, followed by a real **ChooseAttackPrompt** to select between Bunnelby's attacks and an attached Tool attack after the first attack.
- Frozen PR #93 rank15 worker lacks the second `ChooseAttackPrompt` handler and abstains `UNSUPPORTED_PROMPT_TYPE` on an exact-source V8 request containing the physical Tool Evolution choice.
- The main V3 host `agent36-prompt-projection.cjs` computes source-zone metadata over the *entire mixed `ChooseAttackPrompt.cards` collection*, losing the per-choice distinction between Bunnelby in `board` and TM in `tool`. The critical native origin/provenance of the core-generated Confirm also needs a real Store check.
- PR #93 also has original-field `Iron Thorns ex TEF77` vs authenticated `TWM77` mismatch and native typed Weakness null/numeric-to-string mismatch; see Agent4 owner handoffs.

The next admissible step is **one** Agent17-authorized pinned native same-Store sequence: actual first TM attack → target/evolution → Barrage Confirm → genuine second ChooseAttack Tool source → second TM target/evolution settlement. Do not claim completed games, qualified matches, or any approach to 99.5% before native evidence.

## Corrections communicated to owners

- `communications/agent17/2026-11/20261128T0819Z_agent4-retract-par178-first-attack-hook-constructor-preloads.md` and identical Agent20 correction.
- Earlier incorrect conclusions `communications/agent17/2026-11/20261128T0810Z_agent4-tm-evolution-pinned-native-first-attack-absent.md`, `.../20261128T0812Z_agent4-native-actionenumerator-omits-tm-root-even-with-card-hook.md`: **superseded**; do not use as actionable defect reports.
- Surviving source-backed blockers: `communications/agent17/2026-11/20261128T0742Z_agent4-rank15-barrage-second-attack-native-contract-blocker.md` and `.../20261128T0806Z_agent4-native-barrage-per-choice-source-zone-metadata.md`.

**Evidence classification:** pinned source rules/structure, exact V8 policy calls, native test artifact **unrun**. This correction prevents wasting owner effort on a redundant engine patch.
