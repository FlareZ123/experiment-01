# Rank31 Fog Crystal: Basic occupancy excludes most direct Chimecho Energy rescues

**Agent 5, 18 October 2026. Evidence class: exact card-zone resource probability, source-policy review, reversible alternative.** The frozen opponent is the published 60-card rank31 Dusknoir/Chimecho list. This study does **not** measure attack success or competitive game outcomes.

## Policy defect worth a controlled test

The existing [rank31 Fog Energy search policy](../../simulation/twinleaf/rank31-fog-energy-prompt-policy.cjs) only selects searchable Basic Psychic Energy when the actual Active is Chimecho CIN, its attachment is missing, and a genuine owner-visible Fog Crystal deck-search prompt is open. It also refuses if **any additional Basic Pokémon is held or on the Bench**. This Basic occupancy exclusion is unusually severe for the resource event quantified in [the original exact Fog bridge](chimecho-fog-energy-direct-route.md).

An additional Basic in hand or on the Bench does not itself prevent attaching a newly searched Basic Psychic Energy to Active Chimecho. The narrow veto has useful strategic conservatism, since the same Fog search could obtain a different Basic Pokémon, but it suppresses an otherwise available Bell Energy choice. Whether taking that Energy is actually better depends on matchup and downstream actions. It must be tested as a distinct policy version.

The [new opt-in alternate mode](../../simulation/twinleaf/headless.cjs) is `rank31FogEnergyBroaderSeat`. It calls the same owner-only selector with `allowOtherBasics:true`. Original `rank31FogEnergySeat` behavior remains unchanged. Both modes continue to reject states with Energy already in hand or on Active Chimecho, an already-used turn attachment, an invalid owner deck prompt, an unlawful target, disabled Energy attachments or an ineligible Active. Opponent hidden cards and unrevealed own Prizes are never read.

## Exact resource-coverage comparison, before card actions

The registered rank31 60 contains one Chimecho, **14 other Basics**, **four Fog Crystal**, **two Basic Psychic Energy**, **three Telepathic Psychic Energy** and 36 others. Let `H` be seven opening cards, `P` six Prizes, and `T` the first normal draw. Define `B`, the existing direct Fog bridge, as: Chimecho is in `H`; none of the five Psychic-producing Energy cards is in `H∪T`; at least one Fog Crystal is in `H∪T`; and at least one Basic Psychic Energy is available in the remaining deck after `P` and `T`.

With `C(n,k)` denoting binomial coefficients, the original exact bridge is

```text
P(B) = (7/60) * [C(54,7) - C(50,7)] / C(59,7)
                   * [1 - 30/(52*51)]
     = 51799174 / 1984053357
     = 2.610775250436% of all shuffled deals
```

A **necessary opening-only condition** for the conservative policy to permit this bridge, without previously removing additional Basics via another action, is that the six other initial hand slots and first draw contain **no other Basic Pokémon**. Its exact intersection `S` with `B` is:

```text
P(S) = (7/60) * [C(40,7) - C(36,7)] / C(59,7)
                   * [1 - 30/(52*51)]
     = 812567 / 233418042
     = 0.348116620737% of all shuffled deals

P(S | B) = 1751 / 13132 = 13.3338409990862%
P(B excluding S) = 89784709 / 3968106714
                 = 2.262658629699% of all deals
P(B excluding S | B) = 11381 / 13132
                      = 86.666159000914%
```

The derivation uses 59 cards after Chimecho, with five Energy, four Fog, 14 other Basics, and 36 other cards. The `P` survival factor is unchanged because both searchable Basic Psychic Energy cards are absent from `H∪T`, and six Prize positions uniformly sample the remaining 52. Each defined resource event entails a Basic-valid initial hand. For comparison, dividing by the exact valid-opener probability `1 - C(45,7)/C(60,7)` gives **2.95838822%** of valid original sevens for `B`, **0.39446678%** for `S`, and **2.56392144 percentage points** of additional possible visibility when ignoring other Basics.

**Interpretation boundary:** the 86.666% fraction is the portion of restricted Fog bridge deals with an extra Basic among the first eight observed cards, *before any actions remove cards*. In a real turn, those Basics might be discarded, moved elsewhere, or prevented from being played by locks, changing whether the original selector's occupancy test succeeds at the prompt. Bench placement and search timing depend on decisions. The broader policy also needs the generic bot to actually play Fog, choose the selected Energy, attach it, retreat if needed and announce Bell. Neither probability is a lower bound on attack frequency, and the broader selection has **no proven win-rate advantage**.

## Reproducibility and next falsification

- Exact portable [BigInt calculator](../../scripts/rank31-fog-breadth-exact.cjs) and [rational regression](../../tests/rank31-fog-breadth-exact.test.cjs) preserve the exact fractions.
- [Pure policy contrast](../../tests/rank31-fog-energy-broad.test.cjs) checks that an otherwise legal owner Fog prompt with another Basic in hand **and** a populated Bench is rejected in original strict mode and selects Psychic Energy in the new broader mode. Negative controls cover spent attachment, wrong Active, Energy already held, wrong prompt owner/source and invalid search target.
- The shared manual-only `aichi-lock-board-tests.yml` now includes both pure tests, without adding a per-commit CI trigger. At this writing, **compiled verification for this change and any broadened source-dealt Bell attack remain outstanding**. Subsequent CI evidence should be added as a dated addendum.
- The existing [two original rank31 source deals](../../simulation/twinleaf/rank31-fog-energy-source-pair.cjs) are a starting benchmark for strict policy. A proper broad-vs-strict comparison must preserve original hands, Prizes, source rank1 cards, and all negative/no-Fog exposures; select independent test seeds **before inspecting their results**. Test root PlayCardAction, search target, manual attachment, actual Bell attack and opponent reply. Never treat two branches of one shuffled deal as independent games.

**Global gate unchanged:** only 29/32 exact Aichi opponent lists are published; no full game with both competitively qualified policies has been certified; a fixed 99.5%-win deck remains unproven.
