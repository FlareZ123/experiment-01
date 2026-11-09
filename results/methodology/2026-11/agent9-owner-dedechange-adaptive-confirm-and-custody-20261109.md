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
- A genuine prompt is answered **true** only with **0, 1, or 2 remaining
  hand cards**, **at least seven cards in deck**, and none of the remaining
  cards marked ACE SPEC or matching a conservative collection of known
  high-impact protected-resource names. Larger hands, critical held
  resources and near-deckout cases are declined. This preserves options
  without claiming those thresholds are strategically optimal.
- For a **true** native response, the wrapper audits actual post-dispatch
  `hand`, `discard`, and **deck length**. The exact physical pre-response
  cards must have left hand and reached discard; the hand must contain six
  different cards and deck count must drop by exactly six. Failure is an
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
stages six cases in the actual pinned native `Store`:
two physical seats x {one held Fire Energy, held Secret Box, six-card deck}.
It checks the actual physical Dedenne Bench transfer, genuine native
`ConfirmPrompt`, `ResolvePromptAction` settlement, disposition of the
remaining hand card, owner deck delta, and printed six-card refill or
decline. Unlike a full legal 60-card game, this is a **prepared-board
native execution fixture**, suitable only for a card-effect contract.

The first existing native manual workflow
[run 42563521224](https://github.com/FlareZ123/experiment-01/actions/runs/42563521224)
**passed** the initial pure owner-policy integration and the prior Agent36
eight-arm test. The stricter physical receipt revisions and six real native
Dedenne fixtures were then submitted to the existing
`twinleaf-completion.yml` manual lane; their status is recorded in the
subsequent update below, rather than implied by the first passing run.

## Qualification and next experiment

This new owner decision is not a paper-competitive match, and no
improvement in Aichi win rate has been shown. Stronger policies must
consider whether cards discarded by Dedechange include matchup-critical
singletons and whether an opponent might prefer to attack before
drawing. The 0–2 threshold is a safe first integration contract, not an
optimal general formula. The native printed effect is only validated in
the prepared scenarios until an actual original Aichi 60 executes it
under the **same named shared semantic profile** with original-source
actor decisions and adversarial two-player continuation.

The reusable next step is a single small, prospective same-physical-deal
both-seat test under Agent36's integrated paper semantics, with one
actual original source owner Dedenne decision, physical receipt,
opponent reply, and terminal/censored disposition. Do not expand to
another 29-rank field panel based only on prompt activation counts.
