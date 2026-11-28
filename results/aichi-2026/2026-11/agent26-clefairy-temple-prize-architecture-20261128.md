# Agent26 — controlled Temple / Clefairy architecture comparison and exact Prize exposure

**2026-11-28; analytic comparison, not game performance.** Existing complete legal fixed-60 source files: [Hood Shield Shadow Rider v1](../../decks/hood-shield-shadow-rider-v1-expanded-legal-60.md) and [Lockbridge Shadow Rider v1](../../decks/lockbridge-shadow-rider-v1-expanded-legal-60.md). Both contain exactly 60 cards (18 Pokémon, 31 Trainers, 11 Energy) and 1 **Hisuian Heavy Ball ASR**. Their strategic slot differences include:

| Card | Hood Shield v1 | Lockbridge v1 | Function |
| --- | ---: | ---: | --- |
| Lillie's Clefairy ex JTG 56 | **2** | **1** | `Fairy Zone` makes opposing Dragon Pokémon Psychic-weak, enabling Shadow Rider Psychic attacks to exploit ×2 Weakness |
| Wobbuffet PHF | 0 | **1** | Active-dependent non-Psychic Ability suppression; competing for the Active position with Girafarig, Shadow Rider and other Active-based plans |
| Temple of Sinnoh ASR | 0 | **1** | Stadium makes Special Energy supply Colorless and removes other Special Energy effects, including Double Dragon Energy's multi-color supply |
| Pokémon Ranger | **1** | 0 | Conditional removal of effects of attacks affecting Pokémon or players |

These are **multiple jointly coupled slots**, so the raw performance difference cannot be assigned to Temple, Wobbuffet or Clefairy from two decklists alone. A clean, legal, fixed-60 *research control* is instead **Hood–Temple**: take the complete Hood Shield source 60 **unchanged except** replace its singleton Pokémon Ranger Supporter with one Temple of Sinnoh Stadium. Hood–Temple and Lockbridge then share the same Temple/no-Ranger structure, and differ only by **second Lillie's Clefairy ex versus Wobbuffet PHF**. This is a proposed *controlled paired experiment*, **not a new nominated best deck or a tested win rate**.

## Exact starting-six-Prize combinatorics (not estimated from a game simulator)

For a specified set of `k` distinct physical cards in a 60-card deck, the probability **all k** are in the initially selected six Prize cards is

\[
P(k\text{ specified cards all Prized}) =
\frac{\binom{60-k}{6-k}}{\binom{60}{6}}
= \prod_{i=0}^{k-1}\frac{6-i}{60-i}.
\]

This treats the deck as uniformly shuffled when setting initial Prizes. It is exact for the **Prize-placement event** and does not imply a game loss, that the card cannot be drawn from later Prizes, or that an Item-search chain is always available.

| Exact initial Prize event | Probability |
| --- | ---: |
| All copies of Lillie's Clefairy ex when running **1** | **10.0000%** |
| Both copies when running **2** | **0.84746%** |
| Single Clefairy ex **and** singleton Hisuian Heavy Ball both Prized | **0.84746%** |
| Both Clefairy ex copies **and** singleton Hisuian Heavy Ball all Prized | **0.05845%** |
| Singleton Temple of Sinnoh Prized | **10.0000%** |
| Both Temple and single Clefairy ex **unprized** (Lockbridge two named singletons) | **80.84746%** |

The second Clefairy reduces *all-Clefairy-in-Prizes* odds by exactly **11.8×** (10% versus 0.84746%). Since Hisuian Heavy Ball can exchange a Prized Basic Pokémon for itself, when that Item is actually accessible and playable it can sometimes rescue a Prized Clefairy; the more stringent *all-Clefairy-plus-Ball Prized* event is **0.84746%** for one Clefairy versus **0.05845%** for two. This is *not* the probability Clefairy is unavailable in a game: Item lock, Supporter contention, searching for Heavy Ball, board slots, opponent gust/KO, K0/K1 Prize awareness and later Prize draws all matter.

Crucially, Heavy Ball **does not recover the Temple Stadium**. The one-Temple Lockbridge or Hood–Temple branch begins **10%** of games with its Temple in Prizes, absent other early Prize-recovery effects. Two Temples would reduce both-Prized probability to 0.84746%, but replacing a productive card with a second Stadium has a real opportunity cost and **cannot be recommended from Prize odds alone**.

## Why this is strategically worth an actual paired study

The published Aichi source corpus contains **nine Regidrago lists** among the 29 acquired Top32 source lists. Fairy Zone changes the relevant Dragon-type damage geometry for Shadow Rider attacks; the 2→1 Clefairy reduction also loses a backup if the first is Knocked Out or stranded. Temple, by contrast, constrains opposing Double Dragon Energy and can enable the source-dependent Girafarig Get Lost Megaton Blower+Crispin line examined in [the separate decision-policy study](agent26-two-profile-temple-getlost-funding-pair-20261128.md). Wobbuffet adds a third lock dimension but requires Active-position commitment.

A paired test should therefore compare **the same 60-card list across all opponents** for each candidate, *not* swap cards by matchup. Use three arms if native games become eligible: Hood Shield original, Lockbridge original, and **Hood–Temple** (single explicit Ranger→Temple substitution from Hood). Retain the same opponent source inventories, seeds/starting-seat allocation, verified legality, policy version, engine version, and record individual matchup outcomes. The primary hypothesis is that **Hood–Temple may preserve more reliable Psychic Weakness coverage against Dragon-heavy source opponents than Lockbridge**, at the cost of Wobbuffet's Active Ability suppression. The Prize computation is merely a reproducible structural prior; it cannot settle that matchup tradeoff or endorse a new strongest 60.

**Reproduction:** Python standard library `math.comb`: for `k=1,2,3`, evaluate `comb(60-k,6-k)/comb(60,6)`; both named singleton cards unprized is `comb(58,6)/comb(60,6)`. Numeric calculations above were executed in the local runtime on 28 November 2026. No native game or CI was dispatched; there are still **0/32 qualified Aichi matchup samples**, no warranted 99.5% claim.
