# Agent 6: independent owner-public removal-target eligibility evidence for generic Trainer planning

**3 November 2026 | Reproducible pure paper-necessary-condition screen | No selected game policy, no qualified games**

## What was missing

The latest authenticated original Source rank-30 native [Field Blower response](agent6-rank30-fieldblower-paid-jammer-native-paired-four-20261103.md) demonstrated a real Store `PlayCardAction('Field Blower GRI')` removing an opposing paid Tool Jammer, which then allowed Float Stone retreat and a two-Prize Clefairy attack in matched synthetic cases. The [shared source-only paper Trainer frontier](../../../simulation/twinleaf/agent4-owner-paper-trainer-necessary-screen.cjs) correctly treats almost all apparently playable cards as `UNKNOWN` until their printed target, payment and custody have been certified. Its `exactTargetEligibility` was universally `unverified`.

Moreover, the existing [shared candidate Field Blower selector](../../../simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs) `blowerOpportunity` and `chooseGarbotoxinTargets` recognize only Tool-equipped `Garbodor BKP/LTR/DRX/PLF` as public opposing targets. The current common wrapper opts `automaticFieldBlower:true,allowAnyActiveBlower:true`; the latter relaxes only the *owner Active* requirement. **It does not select an opposing Active Iron Thorns ex with Tool Jammer**. This is a source-inspected limitation, not evidence that the naturally dealt rank-30 response is available or optimal. A direct integration message was sent to Agent41.

## General, actor-information-limited certificate

Added [the exact-printing, public-target classifier](../../../simulation/twinleaf/agent6-public-removal-target-certificate.cjs) in commit [`3c5a258`](https://github.com/FlareZ123/experiment-01/commit/3c5a2588728c2106af169e4629f30bb3726ccd44), hardened with physical index-to-printing correspondence in [`66392f6`](https://github.com/FlareZ123/experiment-01/commit/66392f653af8fdb403b56f024062fd4372b8d9de).

The supported fixed source printings are tied to supplied English card-database IDs:

| Native exact printing | Source card ID | Public target category | Other hand cards physically required | Destination |
| --- | --- | --- | ---: | --- |
| Field Blower GRI | `sm2-125` | Up to 2 Tools/Stadium cards | 0 | Discard |
| Lost Vacuum LOR | `swsh11-162` | Exactly 1 Tool or Stadium | 1 | Lost Zone |
| Tool Scrapper RCL | `swsh2-168` | Up to 2 Pokémon Tools | 0 | Discard |
| Tool Scrapper DRX | `bw6-116` | Up to 2 Pokémon Tools | 0 | Discard |

The certifier reads only an authenticated, detached `actorObservation` owner-root snapshot: the owner's physical hand printings, both face-up public Active/Bench Tool attachments, both public Stadium zones, and the owner's public Item-lock flag. It reports exact public target identities, separate mandatory hand-card count, Item-lock and no-target blockers. Multiple simultaneous Stadium zones trigger a fail-closed public-board consistency blocker. It never examines opposing concealed hand, deck or Prize identities; it does not consult the native `ActionEnumerator` or assume a proposed action passes the real Store. Additional nonlisted printings return explicit `unmodeled-exact-printing`, never silently match by name.

The optional pure `withPublicRemovalTargetEvidence(view,census)` overlays Agent4's already-negative-only paper census **without mutating its original data or changing the native policy**. Printed target or physical payment failures set `paperPlayable:false`; surviving cases remain `paperPlayable:null`. The previously unverified target marker becomes either `public-target-present` or `proven-no-public-target`. This is an upper-bound denominator refinement, not a positive certification. It explicitly leaves the role of other lock effects, actual target and prompt acceptance, discard-cost strategic desirability, effects on Tools, payment custody, settlement and attack payoff unresolved.

The actor-visible `Tool Jammer BST` attached to an opposing Iron Thorns is included as a viable *target category* for Field Blower, unlike the Garbodor-only current common candidate selector. This certifies no ability to draw or retain Field Blower in a real game.

## Original 29-field relevance

Parsing the repository's [29 published exact opponent decks](../full-decklists.json) gives **11 Field Blower GRI125 copies across nine printed source ranks**: 1,5,7,8,19,22,29,30,31. Rank 30 has three copies. Rank 5 additionally has **one Lost Vacuum LOR162**. Neither Tool Scrapper printing appears in the known 29. These are printed copies, not owner opportunities or native plays. Other unseen ranks 23,25,28 remain uncounted. The certificate's four-family support is therefore relevant to **12 observed removal-Item copies in nine known original source lists**.

## Test execution and CI disposition

Added [13 pure source- and owner-scope unit tests](../../../tests/agent6-public-removal-target-certificate.test.cjs), latest commit [`5d920ea`](https://github.com/FlareZ123/experiment-01/commit/5d920ea9c7545a11f20cb86745f3a72d1827f7a8). They cover exact source print IDs, the physically paid opposing Tool Jammer target, own Tools, Stadium-only options, Tool Scrapper excluding Stadiums, Lost Vacuum required *other* hand card, public Item lock, unmodeled printings, impossible two-Stadium state, identical output despite hypothetical concealed-opponent mutations, no mutation/false-positive paper promotion in the census overlay, no-target impossibility, physical hand-index errors and mismatched source printing.

Reused the **existing** manually dispatched [Aichi card-coverage audit](../../../.github/workflows/aichi-card-audit.yml), inserting a separately named pure target step, kept runnable with `if: always() && !cancelled()` in the presence of earlier unrelated failures. **[CI run 41660926400](https://github.com/FlareZ123/experiment-01/actions/runs/41660926400), head `5d920ea9c7545a11f20cb86745f3a72d1827f7a8`: that specific step succeeded.** The overall job still failed a separate older Agent27 owner-hand Trainer discard contention step. That same unrelated step also failed in the archived 13:01 [run 41640587396](https://github.com/FlareZ123/experiment-01/actions/runs/41640587396) before this module existed. Do not report overall CI as green or attribute the historical failure to this code.

## Next admission gate

Add this independent public-target evidence *as an opt-in source-owned field of the existing bilateral owner Trainer audit*, then identify a **real**, naturally dealt original opponent/seat root that has printed target, affordable owner payment, no Item lock and a genuine Store-accepted selected action. Compare playing the removal Item against other owner-valid options and Pass, and trace its full effects and opposing response. The Stage-2 evidence should validate the exact live prompt and physical discard/Lost Zone custody before anyone labels a paper-playable turn. This module deliberately avoids modifying the released common policy, creating a specialized workflow, adding decklist slots or claiming any win-rate evidence.

**External benchmark status unchanged:** 29/32 authenticated original 60s, missing ranks 23/25/28, zero competitive game qualifications, no nominated strongest fixed 60 and no demonstrated 99.5% field win rate.
