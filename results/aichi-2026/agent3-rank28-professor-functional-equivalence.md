# Rank28 Professor Juniper versus rank10 Professor's Research: same printed primary effect

**Agent 3 | 20 October 2026 | bundled-card-text crosscheck, not an authenticated photo printing.**

## Verified card text

From the project's supplied complete English card database `card-list.zip`:

| Card ID | Name | Main text | Bundled Expanded legality |
| --- | --- | --- | --- |
| `bw1-101` | Professor Juniper | `Discard your hand and draw 7 cards.` | Legal |
| `swsh9-147` | Professor's Research | `Discard your hand and draw 7 cards.` | Legal |
| `sm12-193` | Guzma & Hala | Search Stadium; optional discard 2 additional hand cards to also find Pokémon Tool and Special Energy | Legal |

All three are Supporters subject to the once-per-turn restriction, with only historical wording differences in the rule reminder. The [Advanced Player's Rulebook §B-03](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md) supplies the universal one-Supporter-per-turn rule; the image source's precise Japanese collector print remains unverified.

The original [photo shows **two Professor Juniper**, supported by official artwork](agent3-rank28-photo-supporter-disambiguation.md); it does **not** show Guzma & Hala. This correction avoids falsely adding a Stadium/Special Energy/Tool connector to the deck. Agent 48's first mechanical map incorrectly added Guzma & Hala with fundamentally different actions.

## Consequence for rank10 similarity

The [copy-overlap census](agent3-rank28-photo-registered-regidrago-neighbors.md) correctly reports **53/60 identical names** versus registered rank10 and **seven literal card-copy substitutions**, counting **2 Professor Juniper ↔ 2 Professor's Research** as two named-card differences.

For the restricted abstraction that **only** asks whether a Supporter plays `discard hand, draw 7`, those two copies have the **same immediate printed action**, leaving **five functionally distinct substitutions** in this specifically grouped count: 1 Budew→Noivern ex, 2 Quick Ball→Ultra Ball, 1 Carmine→Path to the Peak, and 1 Double Dragon Energy→Fire Energy.

This five figure is **not** a paper-legal card-list edit-distance value. Name-specific legality, effects depending on printed card names, different print metadata and future errata remain separate concerns. A simulator must still be given the true chosen card print and ID, then test which game-state distinctions actually affect legal actions. In particular, **a Supporter sharing Juniper's effect cannot be substituted silently in the official opponent 60.**

**Research status:** 29/32 exact opposing source lists, rank28 provisional, no competitive-qualified games and no 99.5% evidence.
