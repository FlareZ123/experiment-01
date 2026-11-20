# New Moon Telepathic Psychic Energy: general first-turn board access

**Agent 35, 20 November 2026.** Evidence class: printed card text, repository card-pool identity, exact finite-population derivation. This is a setup-access and policy result, not a gameplay result.

## Decision

Keep the frozen New Moon Lockbreaker v1 at **three Telepathic Psychic Energy and three Basic Psychic Energy**. Treat Telepathic Psychic Energy as a general, lock-resilient two-Basic setup engine, not merely the narrow Klefki retreat bridge. Do not cut the third copy on the basis of the current Item-access models. This does not justify adding a fourth copy or changing the 60.

## Card text and rules boundary

The candidate's English proxy is **Telepathic Psychic Energy ME3 88** (Japanese source print M3 88). It provides Psychic Energy while attached. When attached from hand to a Psychic Pokémon, its printed effect searches the deck for up to **two Basic Psychic Pokémon** and puts them onto the Bench. The card is a Special Energy; the search is an Energy-attachment card effect, not a Pokémon Ability, Item or Supporter. The Advanced Player's Rulebook's Energy-card section and E-07 classify hand attachment and its triggered effects separately from Pokémon Abilities.

Consequently, this setup effect is available through the field's Item locks (Budew / Vileplume AOR3), Supporter lock (Stoutland), and Pokémon Ability locks (Garbodor / Iron Thorns), provided the player can make the Energy attachment and has a Psychic Pokémon to receive it. The attached Pokémon's own Ability may remain suppressed; that does not turn the Energy card's attachment effect into that Pokémon's Ability. This is a rules-derived conclusion from the printed card and lock scopes, not a direct publisher FAQ pairing for every lock.

Sources: [frozen New Moon 60](new-moon-lockbreak-60-candidate.md), [English-proxy manifest](new-moon-lockbreak-english-proxy-60.json), [repository card text](../../resources/cards/en/me3.json), [Advanced Player's Rulebook, Energy Cards and E-07](../../resources/manual/advanced-players-rulebook.md), and the existing [Klefki–Telepath bridge](new-moon-klefki-telepath-bridge.md).

## Exact composition of the frozen 60

The manifest and card database resolve to:

- 60 cards total; 19 Pokémon, 35 Trainers, six Energy.
- 17 Basic Pokémon, of which **15 are Basic Psychic Pokémon**.
- Three Telepathic Psychic Energy and three Basic Psychic Energy.
- The 15 Basic Psychic targets are Mewtwo & Mew-GX ×2, Gengar & Mimikyu-GX ×1, Trevenant & Dusknoir-GX ×1, Tapu Lele-GX ×1, Galarian Articuno V ×1, Lillie's Clefairy ex ×1, Unown AOR 30 ×3, Duskull VIV 69 ×2, Solrock CES 62 ×1, Lunatone OBF 92 ×1, and Klefki SVI 96 ×1.
- The other two Basic Pokémon are Latias ex and Squawkabilly ex; neither is a Psychic target. The two Dusclops are Stage 1 Pokémon.

The reproducible enumerator is [agent35-newmoon-telepathic-energy-general-setup.cjs](../../scripts/agent35-newmoon-telepathic-energy-general-setup.cjs). It derives the counts from the frozen manifest and the repository's English card database, checks the 60-card total and expected identities, and prints exact fractions.

## Exact first-turn access

A valid opening seven has at least one of the 17 Basic Pokémon. Its exact probability is **91.65625670%**. Conditional on a valid opening:

| Access event | Going first: opening seven | Going second: opening seven plus mandatory draw |
|---|---:|---:|
| At least one Telepathic Psychic Energy and at least one Basic Psychic Pokémon | **29.21604955%** | **33.39775566%** |

Unconditional over all random opening deals, the corresponding rates are **26.77833737%** going first and **30.61113266%** going second. Going first has no first-turn draw; going second includes exactly one mandatory draw. Opponent mulligan bonuses and all optional search/draw are excluded.

The two-target effect is guaranteed to have two legal Basic Psychic targets remaining whenever the first-turn trigger is available:

- Going first: the opening seven plus six Prizes remove 13 cards. One of those is the Telepathic Energy, so at most 12 of the 15 Psychic Basics can be outside the deck; at least **three** remain.
- Going second: the opening seven, six Prizes and first draw remove 14 cards. One is the Telepathic Energy, so at most 13 Psychic Basics can be outside the deck; at least **two** remain.

This is a deterministic pigeonhole bound, not a probabilistic estimate. It means the first-turn access event is also an access event for the full two-Pokémon search, before considering Bench space or later opponent effects.

### Copy-count sensitivity

The same exact access calculation, holding the 17 Basic Pokémon and 15 Psychic targets fixed, gives:

| Telepathic Energy copies | Going first, conditional on valid opening | Going second, conditional on valid opening |
|---:|---:|---:|
| 2 | 20.44656542% | 23.58124452% |
| **3 (frozen list)** | **29.21604955%** | **33.39775566%** |
| 4 | 37.11814183% | 42.06753149% |

These are copy-count sensitivities, not proposed alternative decklists. Cutting from three to two loses **8.77 / 9.82 percentage points** of this first-turn engine access. A fourth copy would add access, but the model does not price the card it would displace and therefore does not recommend a fourth.

## Whole-deck and sequencing implications

1. **This is not a Klefki-only line.** Any Psychic Pokémon in play can receive the attachment; a Psychic Basic in hand can be benched first. The prior Klefki–Telepath result's 3.49% conditional opening is the narrower Klefki-plus-Telepath bridge, not the frequency of the general Energy engine.
2. **Attach before filling the Bench.** If the Energy is in hand and two Basic Psychic targets are useful, attach it before Battle VIP Pass or other effects that consume Bench spaces. The effect can put up to two targets directly onto the Bench. Do not fill all five Bench spaces first and then treat the Energy as if it had two free slots.
3. **Choose targets by the actual line, not by a fixed priority list.** Depending on what is already in hand, play, discard and Prizes, the two targets may be Mewtwo & Mew-GX plus an attack donor, Duskull plus a donor, Tapu Lele-GX for a later Supporter window, or another Basic Psychic pair. Apply the deck's ALS, DCI, AMR and Bench constraints; fetching a Pokémon whose Ability is currently locked may be correct for later, but is not immediate Ability access.
4. **Do not treat Telepathic Energy as a Powerglass substitute.** Powerglass attaches a **Basic Energy** from the discard pile to its Active holder at end of turn. Telepathic Psychic Energy is Special Energy and cannot supply that Basic-Energy target. The frozen three Basic Psychic Energy therefore have a separate, non-substitutable role; see [the existing Powerglass energy gate](new-moon-powerglass-energy-gate.md).
5. **The engine builds the board; it does not break every lock.** Telepathic Energy can bench Pokémon while Items, Supporters or Pokémon Abilities are restricted, but it does not make Perfection usable under Garbotoxin, does not remove an opponent's Tool, and does not make Field Blower or Canceling Cologne playable through Item lock. It complements the four-card counter package rather than replacing it.

## Limits and next discriminating test

This calculation does not model target choice, Bench occupancy beyond preserving two slots, the order of other search effects, opponent mulligan bonuses, optional search/draw, Energy removal, attacks, opponent replies or game outcomes. The 2-copy and 4-copy rows do not specify a replacement card. No games were run and no win-rate inference is made.

After the existing first-trace and common-policy competence gates clear, the useful test is a single policy comparison on the unchanged New Moon 60: a state-aware general Telepathic attachment/target policy versus the existing narrow Klefki-bridge priority. Record whether the Energy is actually in hand, whether a Psychic recipient and two Bench slots exist, which two targets are selected, whether the intended attack line follows, and the opponent's next reply. Do not build another corpus or run this before the current stopline.

**Conclusion:** the frozen three-copy Telepathic Energy package provides a real first-turn, non-Item, non-Ability route to place two Basic Psychic Pokémon in roughly three out of ten legal openings. Preserve the three-copy engine and make its target selection an explicit whole-deck policy decision; do not confuse this setup rate with a matchup or win rate.