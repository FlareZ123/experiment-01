# Authentic A/B/A: owner-paid-retreat planner has zero selected moves in registered source-first cases

**Agent 41 | 29 October 2026 | original pinned Twinleaf Store | 12/12 attempted retrospective cases | 0 competitively qualified games.**

## Outcome and scope

The existing funded-Bench-attacker `AGENT6_PAID_RETREAT_ROOT_DEV` planner was **actually enabled** in the B arms but selected **zero** native paid-retreat intents in the four predeclared, same-original-60 and same-physical-deal source-first cases. The resulting physical accepted-action target traces and their typed native Energy-prompt effect receipts did **not change**, and all original engine outcomes remained identical. Four A/A-repeat controls reproduced their physical receipts and action/terminal sequences. This is a **negative-exposure finding** in these chosen states, with no evidence that the planner's retreat action itself is weak. The existing higher-priority actor actions and strict planner eligibility can both produce a no-selection outcome; the experiment does not distinguish those mechanisms.

The research objective remains the single legal fixed 60 versus all 32 Aichi May Expanded Top32 decks. This experiment supplies no win-rate evidence.

## Original precommit and implementation

- [Predeclared experiment design](registrations/agent41-paid-retreat-sourcefirst-20261029.md), committed before the first native run.
- Original runner [`simulation/evaluation/agent41-native-recipient-aba.cjs`](../../simulation/evaluation/agent41-native-recipient-aba.cjs) invoked with `--paid-retreat`; only `AGENT6_PAID_RETREAT_ROOT_DEV` toggled `false -> true -> false`. `AGENT44_ACTOR_ENERGY_RECIPIENT_DEV` stayed disabled. Actor source 60s, candidate 60s, setup seeds, engine, all other roots, source seat and candidate seat remained frozen.
- Four original-case A/B/A groups at source-first actual original seed 407516727 (rank6 IronThorns) and 482443328 (rank11 Mega Absol/Garbodor), each with original rank1 Shadow Rider champion and New Moon Lockbreaker candidate print sixties; source seat0, candidate seat1.
- Both player initial physical deal/permutation SHA, printed deck fingerprints, source-only deal SHA, verified first player, and engine pin were used as hard comparability gates. Native observer records the root-ordinal-linked accepted `PlayCardAction` / `RetreatAction` targets, plus genuine accepted `AttachEnergyPrompt` immediately public deltas.
- Original Twinleaf pinned submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, with research-owned reversible hooks only. No vendor edits.

## Evidence

- [Actual original-Store CI 40892372121](https://github.com/FlareZ123/experiment-01/actions/runs/40892372121), source `858bd1c0c011156fea14f4a5bb7272975b522b85`, **SUCCESS**. It compiled the original pinned engine, ran the legacy four-case same-target correction/observer-disabled control, the previous Energy A/B/A, and this paid-retreat A/B/A. Complete 12-arm raw output is in [artifact 12905716588](https://github.com/FlareZ123/experiment-01/actions/runs/40892372121/artifacts/12905716588), archive SHA256 `d45e3dcebf907a8c370ea29aa64bf58b3a5adfdbb78c1464d7b06923a96fe759`.
- [Replayed instrumented CI 40893381396](https://github.com/FlareZ123/experiment-01/actions/runs/40893381396), **SUCCESS**. Genuine Store B policy recorded no `paid-retreat` typed selections or physically confirmed paid retreats; all 4 original B policy root audits report `paidRetreatRootOptIn:true`. The first printing of the summary incorrectly returned `trialsWithPaidRetreatAudit=0` by treating an empty observed `typedIntentCounts={}` as missing; the native root evidence actually exists. This summary bug has been fixed to distinguish zero from absent and regression-tested in a subsequent source commit. Do not treat the obsolete computed zero-audit line as evidence that the Store audit was missing.
- A third read-only [sourcefirst CI 40893787492](https://github.com/FlareZ123/experiment-01/actions/runs/40893787492), **SUCCESS**, ran the same four historical cases, with the stage-specific Aichi paper-clock unit test included in the existing manual workflow.
- **Final paid-retreat audit verified:** [CI 40894547490](https://github.com/FlareZ123/experiment-01/actions/runs/40894547490) SUCCESS at source `4cdd0584`. All 12 genuine Store arms completed execution with 4/4 same-start comparisons, 4/4 identical control repeats, 0 paid-retreat intents selected, and all 4 present typed root audits (corrected from the earlier zero-versus-missing summary). Accepted physical root and typed Energy-prompt deltas were unchanged for all 4 A/B pairs. [Full experiment artifact](https://github.com/FlareZ123/experiment-01/actions/runs/40894547490/artifacts/12906896600), SHA256 `08082efc59e4e1a5df87c14d88c84a9bf01e3e903242adf941a2e48278971cc6`.

### Per-case scoreboard

| Source original rank | Candidate printed 60 | Genuine A/B accepted target change | Selected paid retreats | A, B, A-repeat actual native outcome |
| --- | --- | --- | --- | --- |
| 6 Iron Thorns | rank1 Shadow Rider champion | none in captured root/typed prompt scope | 0 | candidate wins all 3 |
| 6 Iron Thorns | New Moon Lockbreaker | none in captured root/typed prompt scope | 0 | 260-accepted-root cap all 3 |
| 11 Absol/Garbodor | rank1 Shadow Rider champion | none in captured root/typed prompt scope | 0 | candidate wins all 3 |
| 11 Absol/Garbodor | New Moon Lockbreaker | none in captured root/typed prompt scope | 0 | source wins all 3 |

**Mechanistic A/B:** 4/4 identical original both-seat physical starting deals and fixed printed 60s; **0/4** new native accepted target deltas; **0/4** typed immediate Energy-prompt deltas; **0/4** engine outcome changes. **A/A-repeat:** 4/4 native physical receipts, legacy root labels, original full deal and game outcomes reproduced. 12 original attempts retained, 3/12 cases hit the computational 260-root cap, zero qualified games.

## Implication

The paid-retreat feature being enabled provides **no intervention exposure** in these specific source-first histories; do not estimate its efficacy by comparing the unchanged win/loss outcomes. The next viable test must expose an eligible exact native board (Active retreat cost payable, sufficiently funded attacking Bench Pokémon, absence of dominating earlier root action, no lock), force a policy opportunity as a predeclared independent state without inventing cards, and verify actual accepted RetreatAction followed by a payable attack and opponent response. Preserve all failures and prevent accidental tests conditioned on success.

The [original official 2026 Aichi Open timed end rules](official-2026-open-clock-swiss-vs-top32-20261029.md) also mean that native root caps cannot be converted into actual tournament outcomes. Existing bot policy, full-field completeness (29/32 original 60s), paper-clock execution and causal game evidence remain incomplete. This is a capability-boundary result and a model improvement.
