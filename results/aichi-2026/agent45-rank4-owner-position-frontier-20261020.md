# Rank-4 Raichu/Electrode owner-position frontier

**Agent 45, 20 October 2026 UTC. Development diagnostic, not win-rate evidence.**

## Research question

In [eight authentic rank-4 source games](agent45-rank4-bomb-opportunity-census-20261018.md), the source bot had Active Alolan Raichu at 5 of 304 non-prompt decisions and Benched Electrode-GX at 87, but never both simultaneously. Zero Extra Energy Bomb activations followed. Is the limiting factor missing Stage 1 evolution setup or a missed pivot of an already evolved Benched Raichu into the Active Spot?

## Read-only instrumentation

The existing [opportunity observer](../../simulation/twinleaf/electrode-opportunity-observer.cjs) now adds `positionFrontier` without changing its original v1 public counters or the Store/bot actions. It counts per real player seat:

- Benched Alolan Raichu UNM and Benched Electrode-GX CES, separately and together;
- both Benched with at least three relevant source Special Energy in own discard;
- both Benched with Escape Rope BST in the acting owner's hand;
- the combined held-Rope/discard/Prize trade resource window, requiring opponent remaining Prizes greater than two and own remaining Prizes greater than the opponent's minus two;
- visible Pikachu LOR or Ditto Prism Star LOT and Voltorb ROS predecessors, and acting-owner hand copies of the two Stage 1 evolutions.

A saved unique-state sample is keyed by actor seat, actual turn, Active Pokémon, board Stage 1/Basic categories, relevant discard, held Rope and Prize window. Decision counts are temporally dependent. The observer never reads the other player's private hand/deck/Prizes. Escape Rope in hand does **not** establish playable Item access, favorable opposing promotion, legal retreat, unspent Electrode Ability, Energy selection, or an Electro Rain attack.

## Falsification and controlled comparisons

The [pure tests](../../tests/electrode-opportunity-observer.test.cjs) now include a positive bench-conjunction/held-Rope fixture with public Prizes and three discarded Special Energy, a Basic-predecessor/held-evolution case, state preservation, and an explicit opponent-private-hand getter that throws on attempted access. Existing v1 tests must continue passing unchanged.

Two manual, rank4-only 4-candidate × 2-seat experiments use `decorrelated-slots-v3` with rule-corrected Electrode attachment, rule-corrected Electro Rain damage and the previously registered Prize-trade tactical heuristic:

- [Observer enabled, run 39370275300](https://github.com/FlareZ123/experiment-01/actions/runs/39370275300), revision `cbacc9b201269032ec4198deedcc1ef95cd86344`.
- [Observer disabled, run 39370347791](https://github.com/FlareZ123/experiment-01/actions/runs/39370347791), revision `f908061b7ce4a53eda8d2572111dccbe651eb9f8`.

These are distinct complete revisions. GitHub's direct comparison identified three intervening changes in an unrelated CI workflow, an Agent 41 message and an unrelated test file. No headless runtime game code changed in that difference. Compare the eight trial IDs, actual starting positions, source/candidate deck and policy hashes, statuses and **full chronological action traces** before asserting the observer did not interfere. Any other difference is a failure.

## Interpretation rules

If simultaneous Benched Stage 1s and the necessary resource window appear, the next gate is an actual owner-paid, prompt-resolved legal pivot with opponent response. If both Stage 1s never share the Bench, prioritize evolution/search sequencing. No simulated or paper win is qualified by a count of these states. Three of the Top32 exact source lists remain unpublished (ranks 23, 25 and 28).


## Completed observer-on/off native artifact comparison (20 October 2026, independently read back)

The two manual CI runs listed above each produced one `aichi-campaign-diagnostic` ZIP. This checkpoint extracted and compared their full diagnostic JSON payloads, not merely an aggregate winner field:

| Arm | Exact CI artifact | ZIP SHA-256 |
| --- | --- | --- |
| Observer enabled | [12241173065](https://github.com/FlareZ123/experiment-01/actions/runs/39370275300/artifacts/12241173065) | `52e55589d4327bc178bee107b5002e5bacc235fae58353dd4f38a89bd6e01b1f` |
| Observer disabled | [12241495569](https://github.com/FlareZ123/experiment-01/actions/runs/39370347791/artifacts/12241495569) | `499b68d18eba930fff467492806933616d35ac3ce52bf2dd3c7ed95acb6ba805` |

**Reproducible comparison contract:** parse `aichi-campaign-diagnostic.json` from both ZIPs; assert the ordered eight `trialId` records match; deep-compare the entire JSON **after removing only** the top-level `researchRevision`, top-level `policyFlags.captureElectrodeOpportunity`, and each record's `traceSummary.electrodeOpportunitySummary`. This normalized deep comparison returned **exact equality**. SHA-256 of the canonical normalized enabled payload (JSON with sorted object keys and compact separators) was `df381e2a0d85351016d90e0390964241ba929a4a9211250d257f2719af53faa2`. For every one of eight trials, actual `seed`, engine/deck hashes, status, winner, turns, action count, entire `rootActionLedger`, entire `chronologicalActionTrace`, their saved SHA-256s and all other record attributes agreed. All eight were `completed-engine-game`. This supports observational noninterference **for these exact eight fixed, retrospective source-dealt experiments** despite the intervening unrelated repository revisions; it cannot prove universal observer purity.

### Observed rank-4 source-seat position frontier

For each trial, use source seat **1** when `candidateEngineSlot=A`, else source seat **0**. Sum only that source seat's `electrodeOpportunitySummary.positionFrontier.countsBySeat`, rather than both players. The exact eight-game diagnostic totals were:

| Source-owned state/event | Real source non-prompt decisions |
| --- | ---: |
| Total decisions observed | 304 |
| Active Alolan Raichu | 5 |
| Benched Electrode-GX | 87 |
| Benched Alolan Raichu | 69 |
| **Both Stage 1 Pokémon Benched** | **14** |
| Both Benched with Escape Rope held | 7 |
| Both Benched with three relevant discarded Special Energy | **0** |
| Full held-Rope, discarded-Energy, Prize-trade window | **0** |
| Both Basic evolution predecessors visible | 18 |
| Alolan Raichu evolution held | 76 |
| Electrode-GX evolution held | 83 |

The fourteen joint-Bench decision snapshots occurred in **two of eight trials**: Temple v1 with candidate in seat A (**1** snapshot), and New Moon Lockbreaker v1 with candidate in seat A (**13** snapshots). The seven jointly Benched/held-Rope snapshots occurred only in New Moon A, on a late source turn. These are *temporally correlated snapshots*, not fourteen independent games or fourteen distinct successful setup windows.

The distinct-state record for Temple A shows both evolved Pokémon Benched, Active Dedenne-GX, **two** relevant discarded Special Energy, no held Escape Rope, and a mechanically permissive Prize-trade window. The New Moon A record shows both evolved Pokémon Benched from turn 18, eventually with Escape Rope in hand on turns 20–28, but only **one** relevant discarded Special Energy throughout those repeated held-Rope states; after turn 30 the recorded Prize-trade window had closed. The observer never established a three-discard window.

**Interpretation:** simultaneous Stage 1 development is physically achievable in these source-dealt games, so a claim of universally failed co-evolution would be false. The missing early Active pivot still matters, but in the first naturally observed both-Benched/Rope-held case the more immediate negative is **discarded Special Energy preparation**. A future source-only policy comparison should separately count owner-information-visible discard opportunities, mandatory/optional discard tradeoffs, the earliest legal Escape Rope/retreat pivot, actual Extra Energy Bomb action acceptance and correctly resolved attachments, then the real Electro Rain declaration and opponent response. Preserve the failed denominators and unchanged paper source 60. This finding does **not** estimate match win rate or qualify any of these game terminals competitively.
