# Source Card mutation persists beyond an entire natural bot decision

**Agent 49, 17 October 2026.** Evidence: manually dispatched [pinned Twinleaf CI run 39025640549](https://github.com/FlareZ123/experiment-01/actions/runs/39025640549), step **Verify read-only bot decision boundary observer** succeeded and step **Count source Card changes surviving each full bot decision** succeeded. The workflow as a whole **failed later** in an older, separate Bunnelby prompt fixture (details below).

## Question and precise claim

Previously, speculation-level observation showed original `Card` mutation during `Simulator.dispatch` but could not establish that any mutation survived until a natural `SimpleTacticsAi.decodeNextAction(state)` returned its next real action. This experiment snapshots each original live Card's own primitive and flat primitive-array properties at the **entrance and exit of a complete bot decision**.

**Result:** under the pinned, Card-aliased original Simulator, 34 of 189 bot decisions left one or more changed Card fields in the live State. There were 68 changed field occurrences, including 13 changes to `damageTakenLastTurn`. Under the opt-in post-super v2 source-graph reconciliation profile, zero changed Card fields were observed at all 178 decision boundaries reached in its separately evolving game. The baseline source game's control summary was identical with and without this observational instrumentation.

## Executable method

- Source decks: exact paper Aichi 2026 **rank 1 Shadow Rider Calyrex** (seat A) and **rank 10 Regidrago** (seat B), resolved from `results/aichi-2026/full-decklists.json` to their 60 source printing IDs; deck hashes and first-turn slot were compared across profiles.
- Twinleaf submodule revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Research seed: `20261049`, action cap 350. Experimental flags `strictPromptValidation`, `forestSealSearchCorrection`, `supporterDecisionCorrection`, `doubleDragonRecovery`, and `isolatePolicyRandomness` enabled. All are unchanged across three runs.
- Three sequential single-process matches: stock original without observer, stock original with read-only decision observer, then opt-in `installPostSuperAliasRepairHook()` with the same observer.
- Observer: [`simulation/twinleaf/bot-decision-card-boundary-observer.cjs`](../../simulation/twinleaf/bot-decision-card-boundary-observer.cjs). Wraps actual `SimpleTacticsAi.prototype.decodeNextAction` synchronously, snapshots original-zone physical Card objects using the existing broad scalar observer, compares in `finally`, and restores the original own/inherited method descriptor. It never modifies the action, any card, the Store, or the PRNG stream.
- Runner: [`simulation/twinleaf/natural-bot-decision-card-boundary-audit.cjs`](../../simulation/twinleaf/natural-bot-decision-card-boundary-audit.cjs). Compares `selectTrajectory(runMatch(request))` between stock no-observer and stock observer using `assert.deepEqual`; checks equal source hashes and first-turn seat across alternate clone profile. Pure tests: [`tests/bot-decision-card-boundary-observer.test.cjs`](../../tests/bot-decision-card-boundary-observer.test.cjs).
- CI workflow is **manual-only**: [`.github/workflows/twinleaf-simulator-card-audit.yml`](../../.github/workflows/twinleaf-simulator-card-audit.yml).

## Executed measurements

| Metric | Original aliased Simulator | Opt-in post-super v2 clone |
| --- | ---: | ---: |
| Natural `decodeNextAction` calls | 189 | 178 |
| Decision calls with surviving original Card changes | **34** | **0** |
| Distinct card-property changes counted per decision | **68** | **0** |
| `movedToActiveThisTurn` changed | 19 | 0 |
| `damageTakenLastTurn` changed | **13** | 0 |
| `cannotUseAttackUntilLeavesPlay` changed | 18 | 0 |
| `whileInPlayOpponentWeakness` changed | 18 | 0 |
| Real game actions before completion | 203 | 192 |
| Engine-reported game winner seat | 0 (rank 1) | 1 (rank 10) |
| Independently competitively qualified games | **0** | **0** |

The source baseline's `selectTrajectory` digest with and without the observer matched exactly:
`3e8c594d9ec5b02dd92926a3d1d2b3e1885aa1f2a8c633ae8d3cb7df9809687a`.
This is **bounded summary-level observer noninterference**, not a complete byte-by-byte Store/reducer state comparison.

Examples seen at the end of actual decisions include:
- source **Koraidon ex TEF** `damageTakenLastTurn` **0→10** at decision 20 / turn 2, when the chosen real action was `AttackAction`;
- the same property **0→130** at decisions 50 / turn 6 and 70 / turn 8;
- **Trevenant & Dusknoir-GX SMP** `damageTakenLastTurn` **0→130** at decision 84 / turn 9;
- **Dialga-GX UPR** `damageTakenLastTurn` **0→30** at that same decision.

Some changes arise from previously absent properties becoming own properties with `undefined` values, and others change a flag from false to true. They are mechanically distinct from a changed numeric damage-history value. Counts are **field-decision occurrences**, never independent games, physical unique-card counts, or proven erroneous future actions.

## Interpretation and limitations

This closes the particular timing ambiguity between **within-speculation write** and **write persisting after the natural bot has selected a real action**. It confirms that the live State visible to the subsequent real reducer may differ from what it was at the start of policy computation. The prior separate conditioned Counter attack regression demonstrates one actual reducer consequence from speculative `damageTakenLastTurn` corruption, but this run does **not** demonstrate which, if any, later action in this exact source-ranked match was caused by any of the thirteen observed changes. The source's bot code itself and any additional synchronous effect remain possible contributors; the observation/clone contrast is supporting mechanism evidence, not a per-decision causal isolation.

The stock and repaired profiles proceed along **different** games after choices diverge: comparing 189 against 178 decisions is descriptive only. Similarly, the reported seat 0 versus seat 1 winner reversal is a weak-bot engine completion with an unqualified policy and simulator. It is not a win-rate observation, and it cannot support the 99.5% goal.

The current observable snapshot includes own scalar and flat primitive arrays only. Deep/nested reference mutation, inaccessible objects, and exact source event graph equivalence remain outside this diagnostic. `selectTrajectory` proves summary-level noninterference over attacks and counts, not every decision's complete action transcript. The logger's `actor` field is null because it does not currently decode the bot's player ID; decision index, turn, chosen action, and Card printing are available.

**Separate preexisting failure:** the full [CI 39025640549](https://github.com/FlareZ123/experiment-01/actions/runs/39025640549) concluded failure later at `simulation/twinleaf/detached-simulator-existing-fixtures.cjs` because `bunnelby-tm-policy-replay.cjs:125` asserted `No bot answer for prompt WaitPrompt`. Past runs of the same legacy step failed for TM Evolution target mismatch. The new, earlier unit and source-ranked decision-audit steps independently completed successfully. No claim that this entire workflow passed.

## Next falsifying controls

1. Add a small targeted **decision-specific** save/restore experiment: stop at one source-ranked observed `damageTakenLastTurn` corruption boundary, clone/hold the original Store, compare next real reducer action on untouched vs contaminated Card field with all else fixed, and capture prompt/reducer trace.
2. Test a mechanism-specific temporary Card-field restoration after speculation without changing clone class topology; compare to the v2 hook and identify first differing real action, avoiding conflating effects of changed source object identities.
3. Extend the observer to identify the actual player seat and record a stable **full meaningful action log fingerprint** across no-observer/observed runs, while preserving hidden-information safety and bounded log volume.
4. Ask rank-10 replay owners and simulator-clone investigators to integrate this **post-decision source State invariant** as a negative qualification gate; do not promote any deck winner before independent paper rules, opponent policy and clean replay checks.

This is **engine-fidelity research**, with zero qualified competitive games and no evidence of achieving the target win rate.
