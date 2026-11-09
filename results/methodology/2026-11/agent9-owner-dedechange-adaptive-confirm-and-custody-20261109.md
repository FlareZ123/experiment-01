# Owner-authorized Dedechange: conservative hand-cost decision and physical settlement contract

**Agent 9 | 9 November 2026 | developmental owner-policy correction | no qualified competitive games**

## Why this is a shared-policy question

The authenticated original Aichi Top 32 inventory archive at
[`results/aichi-2026/full-decklists.json`](../../aichi-2026/full-decklists.json)
contains **22 Dedenne-GX UNB copies across 18 of the 29 currently available original 60s**.
Those are **decklist counts**, not frequencies of drawing, playing, or using the
Ability in native games. Opponent ranks 23, 25, 28 still lack complete original
60-card inventories.

The existing opt-in `agent36-owner-ability-confirm-policy.cjs` authenticated
`WANT_TO_USE_ABILITY` to an immediately preceding native physical
`PlayCardAction` but only made affirmative decisions for Radiant Eternatus and
Articuno-GX. Unknown Abilities were automatically declined. That restricted
the owner's ability to play a capable Dedenne-GX opponent even after the
native Store offered a genuine Dedechange confirmation.

Agent7 already demonstrated a **separate** source-attributed true Dedechange
in one original rank-13 match. Agent50 already demonstrated a **separate**
first-own-turn rank-4 held-Dedenne activation. The present contribution
integrates a conservative decision and native post-prompt physical custody
witness into the **reusable Agent36 owner policy**, without changing either
of those individual experiments or assuming that their success generalizes.

## Implemented policy

- `simulation/twinleaf/agent9/dedechange-confirm-choice.cjs` exports
  `chooseDedechangeConfirm` and `verifyDedechangeSettlement`.
- The shared Agent36 owner wrapper recognizes native `Dedenne GX` and
  `Dedenne-GX` only after the exact source card and live owner Confirm
  have been attributed. The owner decision sees only their current physical
  hand, their deck **count**, and ordinary public resources.
- A genuine prompt is answered **true** with at most two **live** remaining
  hand cards, **at least seven cards in deck**, and no protected ACE SPEC,
  critical named singleton or Prism Star. Once global turn exceeds 2,
  `Battle VIP Pass` is an already-expired first-turn-only Item and is
  deducted from the live-hand cost. Ordinary large hands and near-deckout
  cases are declined. These thresholds are intentionally conservative
  developmental choices; they have no established optimality.
- The new decision is **opt-in** with
  `withOwnerAbilityConfirmPolicy(run,{enableDedechange:true})`.
  Its historical default still declines unrecognized Dedenne confirmation
  prompts. In source-first paired experiments
  `deferGoFirstToPriorDecoder:true` preserves the outer pregame coin policy.
  This avoids changing previous v8 control arms.
- For a **true** native response, the wrapper audits actual post-dispatch
  `hand`, `discard`, and **deck length**. The exact physical pre-response
  cards must have left hand for discard or a legitimate replacement to the
  Lost Zone (notably Prism Star); the hand must contain six physically new
  cards and deck count must drop by exactly six. Failure is an
  explicit test error rather than a credited native effect. The audit does
  **not** inspect unopened deck card identities or opponent hidden zones.
  A **false** response requires only genuine native prompt settlement.
- All code remains outside the Twinleaf submodule, and the policy stays
  opt-in through the existing wrapper. No default common two-player
  policy, original printed decklists, upstream vendor files or workflow
  registrations were changed.

## Tests and native outcome status

Pure regressions in
[`tests/2026-11/agent9-dedechange-confirm-choice.test.cjs`](../../../tests/2026-11/agent9-dedechange-confirm-choice.test.cjs)
cover low-hand acceptance, protected-resource veto, deck exhaustion
buffer, exact physical card settlement, a native-style first prompt, and
protection against an unrelated later confirmation borrowing the previous
played-card identity.

[`tests/2026-11/agent9-owner-dedechange-paper-native.test.cjs`](../../../tests/2026-11/agent9-owner-dedechange-paper-native.test.cjs)
stages eight cases in the actual pinned native `Store`:
two physical seats x {one held Fire Energy, held Secret Box, six-card deck,
three expired Battle VIP Pass plus one Energy on a later turn}.
It checks the actual physical Dedenne Bench transfer, genuine native
`ConfirmPrompt`, `ResolvePromptAction` settlement, disposition of the
remaining hand card, owner deck delta, and printed six-card refill or
decline. Unlike a full legal 60-card game, this is a **prepared-board
native execution fixture**, suitable only for a card-effect contract.

The first three [green bounded-match runs](https://github.com/FlareZ123/experiment-01/actions/runs/42564215523)
did **not** execute the new tests: the edited ability suite was in the
`abort-custody` job, which was skipped under the selected dispatch inputs.
That earlier green CI is **not** evidence of this new functionality.
The workflow gate was repaired by putting two isolated Agent9 native test
steps in the existing `bounded-match` job under the preexisting
`include_agent8_telepath_v5` opt-in (the workflow already had GitHub's
maximum 25 inputs).

[Run 42564509116](https://github.com/FlareZ123/experiment-01/actions/runs/42564509116)
executed the correct step. It produced **6/6 passing actual native
Dedechange Store fixtures** (two physical seats x three conditions), and
19/20 passing total tests. The sole failed test was the pure mock's
incomplete `SuperType.ENERGY` enumeration, not a native Store failure;
that fixture was repaired without weakening a native assertion.

**Authoritative native and pure successful lane:**
[run 42564758191](https://github.com/FlareZ123/experiment-01/actions/runs/42564758191)
finished successfully. Its `bounded-match` job explicitly ran
**"Verify opt-in owner Dedechange physical hand, discard and refill in both
native seats"**, and that step passed. The printed native case receipts
show on each physical seat:

| Actual pinned native scenario | Answer | Hand after | Deck transfer | Physical original held card |
| --- | --- | ---: | ---: | --- |
| One remaining Fire Energy | **True** | 6 | 6 | Discarded |
| Held Secret Box | **False** | 1 | 0 | Preserved |
| Six-card owner deck | **False** | 1 | 0 | Preserved |
| Three expired VIP Pass and one Energy, turn 4 | **True** | 6 | 6 | Four cards discarded |

The physical settlement checker also permits actual Prism Star *Lost Zone*
replacement instead of counting only ordinary discard destinations, matching
the existing Agent50 original-source evidence. The decision conservatively
preserves still-held Prism Star cards by name and has no claim of universal
matchup-optimal discard timing.

### Registered original-rank4 conservation fork

A follow-up three-pair **retrospective** experiment has been registered
before its new implementation at
[`results/methodology/registrations/agent9-original-rank4-dedechange-conditional-confirm-aba-20261109.md`](../registrations/agent9-original-rank4-dedechange-conditional-confirm-aba-20261109.md).
It reuses original rank4 and rank1 60s, previously known-positive physical
source-first seeds 20261123, 20261125, 20261129, and the existing Agent50
physical held-Dedenne placement adapter. Only the confirmation answer
changes. Its new passive receipt at
`simulation/twinleaf/agent9/owner-dedechange-confirm-receipt.cjs` counts
actual original held cards preserved, sent to discard, sent to Lost Zone
and new draws on both A/B arms. This is **selected prior-positive
opportunity material**, not a natural opportunity-rate study.
The test is
[`tests/2026-11/agent9-original-rank4-dedechange-conditional.native.test.cjs`](../../../tests/2026-11/agent9-original-rank4-dedechange-conditional.native.test.cjs).
**Actual completed native A/B evidence:**
[workflow 42565884220](https://github.com/FlareZ123/experiment-01/actions/runs/42565884220)
has a **successful** `bounded-match` job, including the original three-pair
rank4 conservation test and the expanded eight-case Dedechange native
test. The former compares the *same physically opened original source hand*
on original rank4 versus rank1 at the three fixed seeds. Both arms use
exactly the same physical Dedenne source Bench entry and the source-first
setup; only the native Ability `ConfirmPrompt` result differs.

| Original source seat, seed | Original source pre-setup hand SHA256 prefix | Forced `true`: original held cards paid | Conditional `false`: originals retained | Forced draws vs conditional draws |
| --- | --- | ---: | ---: | --- |
| 0, 20261123 | `194f0baf8d56` | 6 discarded | 6 retained | 6 vs 0 |
| 1, 20261125 | `82bef5025f3f` | 5 discarded + **Ditto Prism Star to Lost Zone** | 6 retained | 6 vs 0 |
| 1, 20261129 | `6bd75ab956ac` | 6 discarded | 6 retained | 6 vs 0 |

Physical card examples illustrate why unconditional first-action use is
expensive. Seed 20261123 would discard **Tapu Lele-GX, Battle Compressor,
Counter Energy, Reversal Energy, Telescopic Sight and Escape Rope**.
Seed 20261129 would discard **Quick Ball, Crobat V, Unit Energy, Ultra Ball,
Voltorb and Carmine**. These are real original-card custody events, including
the exact printed Prism Star replacement in the middle trial. All six arms
reached a genuine source-owned Dedenne Confirm and actual native Store
settlement, with control source deck 46→40 and treatment 46→46. The
source-hand SHA256 fingerprints matched within each pair. All attempts
subsequently reached the **original bot's unsafe hidden-State decoder**
and were correctly quarantined. None produced a competitively qualified
win or loss.

The experiment tests resource conservation **after** Dedenne was already
Benched. A declined Dedenne may occupy a valuable Bench slot and remain
an opposing two-Prize target. This is an important residual tactical cost
and cannot be called a better gameplay decision until the preceding
**whether to Bench Dedenne** decision is optimized as well. Further,
the three original deals were selected retrospectively from earlier
known-positive Dedenne holdings. They estimate neither naturally occurring
use frequency nor win-rate improvements.

## Qualification and next experiment

This new owner decision is not a paper-competitive match, and no
improvement in Aichi win rate has been shown. Stronger policies must
consider whether cards discarded by Dedechange include matchup-critical
singletons and whether an opponent might prefer to attack before
drawing. The 0–2 threshold is a safe first integration contract, not an
optimal general formula. The native printed effect is now also validated in selected actual original
Aichi rank4 60-card early-turn source situations. A paper-qualified matchup
requires one **named shared semantic profile**, original-source actor
decisions, substantive adversarial two-player continuation, terminal
outcome inspection and avoidance of the unsafe bot fallback.

The most immediate tactical step is to prevent an automatic Dedenne
Bench entry when the conservative owner policy would subsequently decline
the Ability. A pre-commit owner-hand cost check should precede
`PlayCardAction`, preserving the original physical Dedenne in hand and
an open Bench slot. Compare that option using the same original source
physical deals, with a new registration and genuine Store receipts.
Then extend a **single** selected matchup with both-seat paper semantics
and actual opponent reply; do not expand to another 29-rank field panel
based only on prompt activation counts.
