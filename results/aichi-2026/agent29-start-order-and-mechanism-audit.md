# Agent 29: verified starting-order and intended-mechanism exposure diagnostics

**17 October 2026.** Research artifact and evaluator change. Objective remains one unchanged legal 60-card paper Expanded deck against all Aichi 2026 Top 32 opponents. Evidence class here is source inspection, deterministic synthetic tests and a previously archived actual-engine first-turn seed audit. **There is no qualified game win-rate evidence.**

## Failure mode

A full physical-slot A/B campaign may accidentally evaluate only one *actual starting order*. An observed action count of zero may also be mislabeled as a confirmed absence when its chronological trace was incomplete. These errors can make a failed strategic-mechanism test appear to falsify a candidate before the mechanism was ever exercised.

The concrete motivating case is the separately archived New Moon source/challenger diagnostic against ranks 6 and 8. Its four source/candidate deal pairs used two candidate physical seats but all eight reported candidate-going-first. It recorded zero `Perfection` Ability uses, zero candidate native attacks, zero counter Item plays and 176 candidate passes; its source runner captured relevant action channels. These observations characterize the generic policy and seed slice, not the proposed going-second opening's performance. See [Agent 13 source exposure gate](../als/new-moon-lockbreak-policy-exposure-gate.md) and [counter hand exposures](../als/new-moon-counter-hand-exposure-v3.md).

## Quality screen implementation

[Evaluator](../../scripts/aichi-campaign-quality-screen.cjs) now computes `actualTurn` only when `turnEvidence.verifiedByDrawLog === true` and `firstTurnSlot` is exactly 0 or 1. If the draw log is not verified, the slot's claimed starting order is `unverified` and cannot contribute to observed first/second coverage.

Each rank/candidate `coverage` record carries:
- `observedFirst` and `observedSecond` from those verified attributions;
- `missingActualTurnStrata`, such as `['second']` despite both physical slots being represented;
- `actualTurnCoverageComplete`;
- `mechanismExposure` for any explicitly declared mechanisms.

The report root carries `missingActualTurnCoverage` and `mechanismExpectationStatus`; undeclared mechanisms receive `not-declared` rather than a manufactured zero.

Optional `archive.mechanismChecks` must be explicit and candidate-specific, with fields `id`, `candidateId`, optional `rank`, `action` and `detail`. Supported action names are `PlayCardAction` (matching `trace.card`), `UseAbilityAction` (matching `trace.ability`) and `AttackAction` (matching `trace.attack`). The expected action is counted only for the candidate physical seat and only when the saved chronological trace passes its SHA-256 equality check. A positive occurrence is `observed`. A zero becomes `verified-no-exposure` only if **every** relevant record has a valid hash and claims complete action and prompt coverage. Otherwise zero is labeled `unknown-incomplete-traces`, preserving uncertainty.

A digest is an integrity check on saved bytes, while `coversAllActionsAndPromptResolutions` is still a producer claim. Neither is an independent state-reducer replay, legal-action check, policy qualification or paper-rule verification. A `verified-no-exposure` diagnostic remains subject to that limitation.

## Regression and validation status

Four [new Node test cases](../../tests/aichi-campaign-quality-screen.test.cjs) exercise all-first under physically balanced seats, one invalid first-draw proof, a declared mechanism appearing in the candidate action trace versus complete and incomplete silences, and malformed or duplicate declarations. [Manual CI 39028671191](https://github.com/FlareZ123/experiment-01/actions/runs/39028671191) at head `86e9deced811f308f006dadd5a2f520cd9b3f404` completed **160/161** tests, with one test-only synthetic alias error. The invalid-draw proof case mutated a shared nested `turnEvidence` referenced by two synthetic fixture records. The correct result then omitted *both* start strata while the test expected only the first. The required test-only correction is documented in [Agent 29's broadcast](../../communications/broadcast/20261017T1127Z_agent29_start-order-mechanism-screen-red.md). A follow-up GitHub update was blocked by a tool safety gate and was not bypassed. **This CI is red; the new code cannot be called fully verified until an authorized maintainer reruns it after the fixture correction.**

## Independent actual-engine start-order evidence

The already passing [New Moon manual CI 39025661269](https://github.com/FlareZ123/experiment-01/actions/runs/39025661269) compiled the pinned engine and completed 16 90-action **source-dealt starting-order probes** across opponent ranks 6 and 8, candidate physical A/B and v3 repeat 0–3. Every first turn was verified against the engine's first draw log. It recorded **12 candidate-first and 4 candidate-second**. All four observed candidate-second seeds came from physical A, repeats 2/3:

| Opponent | Physical candidate seat | Repeat | Engine seed | Engine first slot |
| --- | --- | --- | --- | --- |
| Rank 6 Iron Thorns | A | 2 | 1037949953 | B |
| Rank 6 Iron Thorns | A | 3 | 1310766055 | B |
| Rank 8 Absol Garbodor | A | 2 | 3643660616 | B |
| Rank 8 Absol Garbodor | A | 3 | 2504965350 | B |

All eight physical-B starts in this 16-cell source seed grid were candidate-first. The limited grid is insufficient to conclude a simulator bias or randomization defect. The 90-action cap deliberately makes these **turn-order probes, not completed competitive games**.

## Next evidence closure

Re-execute a New Moon 350-action authentic source and unchanged challenger pair using an actually candidate-second seed above and reverify the first draw, both card digests, independent source-state nonmutation, subsequent candidate Ability/attack/Item affordances and legal opposing responses. Ensure the copied-attack prompt pathway is observable as well as the printed `AttackAction` pathway. Add actual-first and actual-second coverage for each opponent rather than assuming physical-seating balance. The rank-10 mechanistic replay and the 29/32 field provenance gaps remain separate unsolved requirements.

There is no deck promotion or demonstrated 99.5% target from the preceding diagnostics.

## 18 October 2026: complete engine first-turn proof is mandatory

The earlier quality screen trusted `turnEvidence.verifiedByDrawLog === true` and an integer `firstTurnSlot` when attributing a trial's actual first player. This permitted an internally contradictory or truncated archived draw-log proof to populate the first/second denominator even though the campaign execution producer's `observedFirstTurn` function had recorded **four** corroborating fields. This was an evidence-intake gap, not a demonstrated engine randomization defect.

The screen at [`scripts/aichi-campaign-quality-screen.cjs`](../../scripts/aichi-campaign-quality-screen.cjs) now requires all of:

- `verifiedByDrawLog === true` and `firstTurnSlot` exactly 0 or 1;
- `firstTurnPlayerId === 101` for slot A or `202` for slot B;
- `firstTurnPlayerName` and `firstDrawLogName` both equal the corresponding `research-A` or `research-B` engine actor name.

One contradiction or absent field sets `actualTurn:'unverified'`, keeps the affected stratum absent, and marks paired-source order evidence unverified. This preserves physically distinct seat identity and retains unverified trials in the campaign denominator. The strict schema mirrors the producer's existing source rules; no game, deck, random seed, simulator or bot policy was altered.

The [manual-only benchmark CI run 39153390189](https://github.com/FlareZ123/experiment-01/actions/runs/39153390189) **passed** at research commit `404808ced8c6d547b49f68d510685363b6707e76`. New adversarial tests cover missing player ID, wrong ID, wrong player name and wrong first-draw-log name, while verifying that a single corrupt comparison arm does not invalidate unrelated first/second observations. A fixture whose proof is valid across all fields preserves the original start-order counts. The previously red shallow-alias fixture is also now repaired by Agent 20's copy-on-write change, independently covered in this successful workflow.

**Boundary:** all proof fields still originate from the runtime/record producer and may be forged together. This change establishes internal consistency and rejects accidental evidence corruption. It is not independent Store replay, a source-of-randomness certification or win-rate evidence. Missing original rank 23/25/28 lists and competitively qualified games remain unresolved.
