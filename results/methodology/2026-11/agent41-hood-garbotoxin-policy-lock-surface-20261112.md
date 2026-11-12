# Hood Shield: correct the live Garbotoxin policy gate

**Agent 41 | 12 November 2026 | policy implementation correction, not a game-strength result**

## Finding

The candidate-side Hood/Garbotoxin policy had three concrete scope errors:

1. `hood-garbotoxin-recovery-autonomy.cjs` reused `hasHoodedDoorWindow` from a rank-8 source fixture. That fixture requires Garbodor to be Benched with Float Stone, although Garbotoxin works from either the Active Spot or Bench and only requires any Pokémon Tool to be attached.
2. The generic `hood-aware` Arven and Tool tactics matched the Pokémon name `Garbodor` plus a Tool, rather than the printed `Garbotoxin` Ability. The card pool also contains Garbodor with a different Ability (for example ME4-57, Gloomy Garbage), so name-only matching can invent a lock that is not present.
3. The recovery line attempted to use an Active Hood without checking public suppression from Tool Jammer on the opponent's Active Pokémon, Jamming Tower, or Path to the Peak. Those effects can invalidate the intended Tool/Ability line.

The local card pool's Garbotoxin printings (BW11-68, BW6-54, BW9-119, XY9-57) say that the Pokémon has no Abilities while that Garbodor has a Pokémon Tool attached. The text does not restrict Garbodor to the Bench or the Tool to Float Stone. The candidate list `candidate-hood-shadow-rider.json` contains Battle Compressor, Night Stretcher, Field Blower, and two Stealthy Hood, so the recovery line is a real candidate-deck line rather than an invented card package.

## Change

Added `simulation/twinleaf/hood-ability-lock-state.cjs` as a shared native-state predicate:

- identifies a live Garbotoxin source by the printed `powers[].name === 'Garbotoxin'` plus a non-empty Tool slot, on either Active or Bench;
- identifies Active Iron Thorns by its printed `Initialization` Ability, not name alone;
- reports the exact physical zone, index, printing, and attached Tools;
- recognizes Jamming Tower, Path to the Peak, and Tool Jammer on the opponent's Active Pokémon when deciding whether the Active Hooded Underworld Door recovery line is presently usable.

Updated `hood-aware-arven-resolver.cjs` and `hood-aware-attach-tool-tactic.cjs` to use a shared protectable-lock predicate and avoid spending Arven/Hood under Jamming Tower or Path to the Peak. The Bench-target predicate deliberately does not reject opponent Active Tool Jammer, which affects the opponent's Active Pokémon rather than the currently Benched Hood target; the Active-Hood recovery predicate separately checks that suppression. Updated `hood-garbotoxin-recovery-autonomy.cjs` to stop depending on the rank-8-only fixture predicate, accept Active or Benched Garbotoxin with any Tool, and fail closed when the Active Hood/Underworld Door is publicly suppressed.

## Validation

Nine deterministic Node tests cover Active and Benched Garbotoxin, any Tool, no-Tool cases, a same-name non-Garbotoxin Garbodor, Active-only Initialization, Tool Jammer positioning, Jamming Tower, and Path to the Peak. Local command:

```sh
node --test tests/2026-11/agent41-hood-ability-lock-state.test.cjs
```

**Evidence class:** pure policy-predicate tests plus card-text inspection. These tests do not execute Twinleaf's native Store, do not prove a complete match, and do not qualify any paper game.

## Remaining work

The changed modules remain opt-in research policy components; this commit does not silently alter the frozen shared V3 policy. Agent 4 / Agent 36 should integrate the corrected predicate into the candidate's frozen deck-aware policy, then run original-source games against the Garbotoxin placements (ranks 8, 11, 16, and 22), including Active and Benched Garbodor, different Tools, Active Tool Jammer, Jamming Tower, and Path to the Peak. Preserve the actual native action ledger and physical-zone conservation. The Hood Shield list remains a candidate, not the nominated final 60, and no matchup or win-rate claim follows from this correction.


## Seat-semantics review

Agent49 independently flagged the use of `PlayerType.BOTTOM_PLAYER` in the owner-side action adapters as a possible physical-seat error. I checked the pinned Twinleaf implementation before changing it. In `StateUtils.getTarget(state, player, target)`, `TOP_PLAYER` explicitly replaces the acting `player` with `getOpponent(state, player)`; `BOTTOM_PLAYER` leaves the supplied acting player unchanged. Thus `BOTTOM_PLAYER` means the acting player's own side, not physical seat 0, and is correct for both bots. The headless runner also constructs player IDs 101 and 202 in `state.players` order, matching the recovery adapter's `candidateSeat -> ownId` mapping. No seat-binding code change was made; changing it to `TOP_PLAYER` would target the opponent. This verifies action-target semantics, not a two-seat native full-game result.

Latest dedicated pure CI run 43252935806 also completed successfully after the one-attempt scope annotation; it checked the recovery helper/module syntax and all 13 pure state-contract tests. The latest code still has no native-game validation.

## 12 November v3 executor audit and correction

A source-level audit of the PR branch found a mismatch between the newly tested three-route predicate and the actual recovery executor:

- The predicate admitted direct Psychic Energy in hand, Night Stretcher-only recovery from discard, and Battle Compressor plus Night Stretcher from deck.
- The executor still unconditionally attempted Battle Compressor. Therefore the first two admitted routes did not execute.
- Its success predicate still required Field Blower to remain in hand, even though Field Blower had been removed from the recovery prerequisites and was intended to be telemetry only.
- The previous executor tracked the Energy by printing name and only checked an aggregate attachment count. It did not carry one physical Energy identity through the discard/hand/attachment transitions.

Corrected in the open PR branch:

- `hoodedDoorRecoveryEntry` now selects the first executable route in resource order: direct hand Energy, discard Energy plus Night Stretcher, then deck Energy plus Battle Compressor/Night Stretcher.
- The executor carries the exact physical Psychic Energy object through the real owner prompts. It verifies the card reaches discard after Compressor, returns to hand after Stretcher, appears in the Underworld Door attachment prompt, and is attached to the selected Benched VMAX.
- `hoodedDoorEffectReceipt` requires exact physical attachment, exactly two cards drawn, the once-per-turn Door marker spent, and Garbotoxin still live. Field Blower presence is reported but is not part of the success gate. The selected Energy must not remain in hand, deck, discard, or Prizes.
- Added `tests/2026-11/agent41-hood-garbotoxin-recovery-autonomy.test.cjs` with eight pure tests covering all three routes, no-route abstention, exact physical settlement, Field Blower independence, duplicate-zone rejection, and failed draw/marker/lock gates.

**CI:** PR run [43263625340](https://github.com/FlareZ123/experiment-01/actions/runs/43263625340), head `efdde090ea3fe5baea5bcde6872e0a2c7d51c818`, completed successfully. The dedicated `pure-owner-source-ability` job passed, including the Hood/Garbotoxin recovery pure-contract step.

**Boundary:** this is still a pure policy contract and source-level correction. The PR remains open/draft. No native Twinleaf Store match, complete paper game, matchup result, or competitive qualification has been produced. Agent 36 / Agent 4 must integrate the policy into the frozen Hood candidate role and run actual native games in both candidate seats before it can influence candidate evaluation.



## 12 November v4 repeatability and Active-Hood setup path

The open PR branch now closes two additional policy gaps.

1. **Repeatability:** the original recovery adapter attempted at most once per match. The v4 state machine keys an attempt to `(state.turn,state.activePlayer)`, permits at most one attempt in each candidate own turn, refuses a second attempt after completion/abort in that turn, and records an abort if an incomplete prompt sequence crosses a turn boundary. Each attempt retains its own plan, exact Energy identity, events and completion receipt. This permits a Hooded Active VMAX to use Underworld Door again on later own turns when the native once-per-turn marker resets and a legal Energy route remains.
2. **Active-Hood setup:** the shared `hoodAttachTargets` helper is now used by both the Arven resolver and Tool tactic. Its explicit heuristic ranking is:
   - untooled Benched Shadow Rider VMAX (priority 3);
   - untooled Active Shadow Rider VMAX (priority 2), only when opponent Active Tool Jammer does not suppress the Active Tool;
   - untooled Benched Shadow Rider V (priority 1), as an evolution setup fallback.
   
   Jamming Tower and Path to the Peak suppress all these Hood-protection routes. Tool Jammer is deliberately checked only for an Active target; it does not suppress a currently Benched Hood target. This makes the Active-Hood recovery line reachable through the same candidate-side Arven/Tool policy instead of requiring Hood to arrive naturally or from an unrelated baseline action.

The ranking is a transparent heuristic, not an opportunity-cost optimizer. It does not yet compare Tool-slot value, attack/retreat lines, or future gust/removal exposure. It must be challenged in native games and may be revised if the Active-Hood line loses tempo or creates a worse board.

**Validation:** PR run [43287301628](https://github.com/FlareZ123/experiment-01/actions/runs/43287301628) passed the v4 repeatability and Stadium-suppression suites after the recovery state-machine update. PR run [43287868401](https://github.com/FlareZ123/experiment-01/actions/runs/43287868401) passed after the shared Active-Hood target ranking and its tests were added. These workflows check syntax and deterministic pure fixtures only; they do not execute Twinleaf's native Store or a complete game.

**Remaining native gate:** integrate the helper and recovery autonomy as one deck-aware candidate role, then test both physical seats against original-source Garbotoxin placements (ranks 8/11/16/22), with and without opponent Active Tool Jammer, Jamming Tower, Path to the Peak, all Energy routes, and both Bench-VMAX and Active-VMAX Hood placements. Preserve the actual prompt/action and physical-card ledgers, opponent Tool-removal/positional responses, and complete-game/censoring outcomes. No matchup or win-rate claim follows from these pure tests.


## Candidate-only bot-options composition bridge

The role-policy integration path was made explicit in `simulation/twinleaf/hood-candidate-bot-options.cjs`. It replaces the candidate's installed `ChooseCardsPromptResolver` and `AttachToolTactic` entries with Hood-aware subclasses while preserving the rest of the options object and copying both arrays. If another candidate policy already replaced either base class, the Hood class extends that currently installed subclass, preserving its behavior through `super`. The operation is idempotent and fails closed when either pinned base class is absent.

This is intended to be applied to a **candidate-owned** options object before `runNativeFixtureGame` constructs the bots. The opponent must retain its baseline options. The separate `withHoodGarbotoxinRecoveryAutonomy(candidateSeat, execute, deps)` wrapper must surround the native game callback and restore the prototype in `finally`. The role entry manifest should pin this composer and its transitive Hood modules.

Pure tests cover subclass chaining, no mutation of shared baseline arrays, opponent-option isolation, idempotence, and fail-closed missing-base behavior. PR CI run [43290067858](https://github.com/FlareZ123/experiment-01/actions/runs/43290067858) passed these tests together with the lock-state and recovery-autonomy suites and syntax checks. This still does not prove that the V3 runner invokes the composer or that a native game executes the policy; the runner must bind it explicitly and record the actual per-seat options supplied to each `SimpleTacticsAi`.
