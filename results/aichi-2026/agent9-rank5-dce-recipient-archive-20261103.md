# Original rank-5 Mew Genesect DCE recipients: 32 witnessed attachments, one second-Mew opportunity

**Agent 9 | 3 November 2026 | retrospective read-only genuine pinned Store audit | 0 competitively qualified games**

## Why this audit matters

The source original rank-5 Yamato Nakano Mew Genesect printed 60 uses **4 Double Colorless Energy SUM** and no other Energy. Its Mew VMAX Cross Fusion Strike costs two Colorless and can copy an eligible Benched Fusion Strike Pokémon's attack, including Genesect V's Techno Blast. The original Dedenne-GX, Crobat V and Genesect V have colored attack costs, so a single Double Colorless does not by itself pay their printed attack costs. DCE on those Pokémon can still contribute to retreat or future lines. Therefore, **a non-Mew attachment is a measurable allocation choice, not by itself a proven misplay**.

This work extends [Agent9's four-scope same-physical-deal Quick Ball experiment](agent9-rank5-quickball-four-scope-native-causal-20261102.md) and [Agent41's independent native census](agent41-quickball-four-scope-independent-census-20261102.md) by examining the actual recipient and physical Energy increments rather than counting DCE root declarations. It complements [Agent26's owner-visible Mew DCE recipient proposal](../methodology/agent26-rank5-mew-dce-benched-recipient-20261102.md), which remains inactive by default.

## Exact archived evidence

- Source [GitHub Actions 41424333037](https://github.com/FlareZ123/experiment-01/actions/runs/41424333037), archived ZIP [artifact 13131282058](https://github.com/FlareZ123/experiment-01/actions/runs/41424333037/artifacts/13131282058), ZIP SHA256 `454f89593f1d89d9c4bb3c2169f75258c8fb0b270caf04639c10d837d59ba7df`; JSON SHA256 `45ac157da09cc54d5fdf546f2e9bcafe07fb11b80938622789473635c33aeab0`.
- The clean rerun [41425063525](https://github.com/FlareZ123/experiment-01/actions/runs/41425063525) has byte-identical decompressed JSON. No new native games were run for this audit.
- Unchanged original rank-5 60 SHA256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`; pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Archive has **32 actual Store game attempts** across two named historical policies, four fixed original physical trials and four Quick Ball on/off scopes. The two policies produced **16/16 identical source-deal, complete physical-deal and native-root-ledger pairs**. They are repeated observations of the same source choices, not independent samples.

The independent audit [script](../../scripts/agent9-rank5-dce-recipient-archive-audit.cjs) joins every original-source `Double Colorless Energy SUM` accepted `PlayCardAction` in `nativeAcceptedTargetSidecar.events` to an actual source `rootActionLedger` DCE play. It requires a **public board-zone transition adding exactly one physical DCE to exactly one source Pokémon**. Proposed target metadata alone does not pass. It uses the original source actor's real seat, including seat 0 in B trials. Eleven pure positive and negative tests in [the test file](../../tests/agent9-rank5-dce-recipient-archive-audit.test.cjs) passed locally with Node 22. The 73 MB decompressed archive was also audited locally, with all 32 physical DCE placements passing the root-to-recipient join.

## Actual original-source DCE placements

One historical mode (`integratedV3Control`) contains **16 scope-by-trial trajectories**, reusing the same four initial physical deals for every scope:

| Quick Ball scope | DCE to Mew V / VMAX | DCE to Genesect V | DCE to Dedenne-GX | DCE to Crobat V | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Both players OFF | 4 | 2 | 3 | 1 | 10 |
| Source-only ON | 0 | 2 | 0 | 3 | 5 |
| Candidate-only ON | 4 | 2 | 3 | 1 | 10 |
| Both players ON | 0 | 2 | 1 | 4 | 7 |
| **Observed attachment events** | **8** | **8** | **7** | **9** | **32** |

Thus **24/32 observed attachments** in one mode were to non-Mew recipients. The second mode reproduces those same 32 events and native ledgers. **Do not double the denominator to 64 independent events.** Furthermore, all 32 events share four physical opening trials through different counterfactual policies, so 24/32 is a descriptive archive allocation count and cannot estimate a population misplay rate, win rate or Energy recipient improvement.

For source-only Quick Ball scope, the original source made five total DCE attachments in the four trials, **all to support Pokémon**. For OFF and candidate-only, Mew received four of ten attachments and the source executed six total Cross Fusion Strike roots across the four trials. Source-only and both-on produced zero source copied-attack roots in these same trials. This is an association under the fixed native policy, with search, discard, future draws and game horizons all changing. It does not imply recipient selection alone caused the attack difference.

## Concrete second-Mew opportunity, exact original Store receipts

The strongest new chained witness is `integratedV3Control / OFF / 5:0:A:champion-reference`, original source **seat 1**:

1. **Global turn 40, source native root 168:** source plays Mew V FST onto previously empty **Bench index 1**, with zero Energy. The physical target sidecar confirms the zone transition.
2. **Same turn, source root 169:** source plays Double Colorless Energy SUM onto **Dedenne-GX UNB, Bench index 0**, changing its Energy list from empty to one DCE. The separate zero-Energy Benched Mew V was already in play. Source passes on root 170; Active Mew VMAX held its own DCE.
3. **Global turn 42, root 178:** the source evolves the same Bench-index-1 Mew V into Mew VMAX. Its before/after source zone transition shows **zero Energy before and after evolution**. That turn the already funded Active Mew VMAX uses Cross Fusion Strike (root 179), with actual `ChooseAttackPrompt` choosing Benched Genesect V's **Techno Blast**.
4. **Global turn 44, root 191:** the source passes with the funded Active Mew VMAX and another Mew VMAX on Bench. The source's captured post-pass public board confirms the two Mew VMAX placements. Native roots 197 and 211 show further Cross Fusion Strike uses on turns 46 and 50, with Passes at turns 44 and 48.

The candidate-only Quick Ball branch of the **same original physical deal** reproduces the same qualitative chain shifted earlier: source Benched Mew V root 164, DCE to Dedenne-GX root 165 at turn 38, zero-Energy Mew VMAX evolution root 173 and Techno Blast copy root 174 at turn 40, source Pass root 188 at turn 42. These are **two policy trajectories of one underlying initial deal**, not a second independent randomized witness. Both historical named modes independently label the same native root ledgers and do not add further independent observations.

A hypothetical alternative allocation of that DCE to the Benched Mew V could have left a second Mew VMAX with sufficient Colorless Energy after evolution. It might enable a retreat-and-copy attack on the intervening skipped turn, conditional on the opponent's position, relevant Benched donor, no active locks, legal retreat, source attack restrictions and full Store adjudication. **That alternative attack was not executed. No improvement or forced extra Prize is claimed.** The printed rules allow a regular retreat once per turn; an evolved Pokémon retains attached Energy. Native policy might still prefer a different tactical use of the DCE or the original Dedenne attachment for mobility.

## Integration handoff and methodological veto

The `secondMewDiversionWitnesses` helper in the read-only script requires all of the following real source-native stages in one chain: zero-Energy Benched Mew V played before the non-Mew DCE attachment, later zero-Energy Mew VMAX evolution on that very Bench index, real Genesect Techno Blast copied through Cross Fusion Strike, and a subsequent source Pass. It found exactly the two described OFF and candidate-only trajectories in one historical mode. It found no such chain in the other 14 scope-by-trial trajectories. The same two appear in the repeated historical mode. Pure tests explicitly reject a different copied attack and an already funded second Mew.

**Next prospective test:** under the one genuinely selected *symmetric two-seat common policy*, pair the frozen normal DCE intent against Agent26's owner-visible Mew-recipient proposal with exactly the same initial physical source deal, all costs/targets paid in the actual Store, and all opponent responses preserved. The helper's existing active-immediate-attack and Temple-of-Sinnoh guards are relevant; evaluate them at the real owner root. Record source DCE target, original Mew evolution, DCE on second Mew, copied attack, cooldown handling, retreat/promotion, damage/Prizes and post-attack reply. Run cheap native provenance/permission tests before any costly 16-arm integration. This result is a **policy design witness**, not a declaration to turn the proposal on universally.

All 29 authenticated originals remain without competitively qualified games; ranks 23, 25 and 28 remain missing; no fixed 60 is selected and no 99.5% field win-rate claim is supported.