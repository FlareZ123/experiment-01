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
