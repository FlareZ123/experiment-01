# Agent30: public Prize prerequisite vetoes for three original-field Trainers

**3 November 2026 | paper-card-source and 29 authenticated original 60s | exact negative certificate, no new game wins.**

## Decision question

The generic owner-turn Trainer frontier currently distinguishes held copies and native enumerator offers from paper legality, but native offers and generic public lock screens can include Trainers whose **printed public Prize condition fails**. This adds an independent, exact-print, owner-visible **necessary-condition screen** that marks such actions paper-ineligible. A passing threshold is deliberately **UNKNOWN**, because payment, public locks, target legality, Supporter contention, and strategic benefit still require separate evidence. Nothing here changes a bot policy or selects a candidate 60.

## Original 29-source printed census

The exact original roster is [`full-decklists.json`](../full-decklists.json), preserving 29 authenticated full 60s and leaving ranks **23, 25, and 28** unavailable. Every source copy below uses the listed English print proxy, not a generic family-name match.

| Original exact print | Card source ID | Original ranks (copy counts) | Total copies | Printed necessary public Prize condition |
| --- | --- | --- | ---: | --- |
| Counter Catcher PAR 160 | `sv4-160` | 3 (2), 7 (3), 12 (1), 14 (1), 21 (1), 26 (1), 32 (1) | **10** | Owner has **more** remaining Prize cards than opponent |
| Roxanne ASR 150 | `swsh10-150` | 8 (1), 22 (1) | **2** | Opponent has **three or fewer** remaining Prizes |
| Special Red Card CRI 82 | `me4-82` | 5 (2), 26 (1) | **3** | Opponent has **three or fewer** remaining Prizes |

The 15 physical printed Trainer copies occur across **10 distinct authenticated original ranks**: 3, 5, 7, 8, 12, 14, 21, 22, 26, 32. With both players at six remaining Prizes, **all 15** fail the relevant printed prerequisite. This is a card inventory finding, not 15 independent decision opportunities, and it makes no assumption that any copy has actually been drawn or offered in a native game. A 6–6 beginning alone does not establish how often a source bot would attempt these actions.

The source text was checked against `resources/cards/en/sv4.json`, `swsh10.json`, and `me4.json` and the supplied complete English card pool, with legalities tagged Expanded legal. Japanese event-specific printing and errata matching remain a separate source-fidelity question.

## Implementation and local custody

- [Pure code](../../../simulation/evaluation/agent30-public-prize-trainer-necessary.cjs) exposes `publicPrizeTrainerPrerequisite(view,row)` and `screenOwnerTrainerPrizePrerequisites(view,rows)`. Its only decision inputs are the authentic detached actor's own exact-printing hand, the public Prize counts for both players, and the verified card-print type. It rejects forged hand index/printing and non-owner-root calls.
- The output distinguishes **proven prerequisite failure** (`blocked:true`, `paperPlayable:false`) from **satisfied necessary condition** (`blocked:false`, `paperPlayable:null`) and from **unmodeled card print**. A null does not certify a legal Item or Supporter use. Owner-private data must never be sent to an opposing decision policy.
- [Six standalone tests](../../../tests/agent30-public-prize-trainer-necessary.test.cjs) check equality boundaries, source-print specificity, all 29 original rosters and exact source text, unsupported printings, duplicated hand indices, and concealed-opponent-data independence. Added to existing **manual-only** [global field gate](../../../.github/workflows/aichi-global-field-gate.yml) with no new on-push workflow.
- **Verification:** compiled-free [GitHub Actions run 41653604651](https://github.com/FlareZ123/experiment-01/actions/runs/41653604651) concluded **SUCCESS** on main `26a0d828326c67659906a400422085a6a4efd2be`, after source, tests, and workflow commits. This is pure fixture and source math verification, not a native Store payment or a paper-qualified game.

## Integration significance and pending validation

The existing [Agent5 generic frontier](../../../simulation/twinleaf/agent5-generic-owner-trainer-opportunity.cjs) and [Agent4 paper necessary-condition screen](../../../simulation/twinleaf/agent4-owner-paper-trainer-necessary-screen.cjs) already separate paper **NO** from **UNKNOWN**, including first-owner-turn expiration and mandatory discard affordability. This Prize screen can be composed as an additional independent negative certificate on their exact owner-root Trainer rows. **Do not promote a native enumerator suggestion to paper-legal solely because all these screens return UNKNOWN.** A positive paper verdict still needs exact target, actual cost, game-zone settlement and turn effects. Native policy selection remains unchanged here.

Prospective regression should take a real original rank5 or rank11 owner root, archive actual physical Prize counts and held printings, then compare enumerator offers and post-screen eligible sets against actual native dispatches and the owner’s other affordable plays. Counter Catcher specifically requires the owner to be behind on remaining Prizes; Roxanne and Special Red Card require late opponent Prize progress, and all three can become tactically useful later. Rejecting them globally rather than **state-dependently** would be wrong.

**External decision status remains unchanged:** 29/32 authenticated source sixties, original ranks 23/25/28 absent, zero competitively qualified games, no selected fixed 60, no demonstration of 99.5% field win rate.
