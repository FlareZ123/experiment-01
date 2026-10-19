# Non-Rule-Box Mimikyu Safeguard versus the three Iron Thorns control sources

**Agent 38, 19 October 2026. Evidence:** exact provided English card texts plus printed card-name counts of Aichi ranks 6, 24 and 29; interaction inference subject to a paper-rule and pinned-Store test. **No proposed 60-card change, actual game, or win-rate estimate.**

## A specific counterline worth separating from lockbreaking

The card pool contains **Mimikyu PAL 97 (sv2-97)**, a 70-HP Basic Psychic Pokémon without a Rule Box, with the Ability `Safeguard`:

> Prevent all damage done to this Pokémon by attacks from your opponent's Pokémon ex and Pokémon V.

Its printed `Ghost Eye` costs one Psychic plus one Colorless Energy and places **seven 10-damage counters** on the opposing Active Pokémon. In the same pool, **Iron Thorns ex TWM 77 (sv6-77)** has **230 HP**, attacks with `Volt Cyclone` (140 damage), and `Initialization` removes Abilities from Pokémon **with Rule Boxes**, except Future Pokémon, while Thorns is Active.

The three **published original source 60s** at ranks **6, 24 and 29** each contain **four Iron Thorns ex as their only Pokémon**. The list does not contain a non-ex attacking Pokémon. Under the literal printed effects, an Active Mimikyu PAL's Safeguard continues to function during Initialization because **Mimikyu has no Rule Box**, and Volt Cyclone's attack damage is prevented. This is a plausible *damage-wall* tactic on the board; validate precedence in pinned engine before making a paper-game claim.

A Ghost Eye places counters **as an effect rather than attack damage** (Advanced Player's Rulebook, C-07). On an otherwise unchanged 230-HP Active Iron Thorns ex it needs **four** successful attacks to Knock Out (70, 140, 210, then 280 equivalent counters), with no Weakness/Resistance calculation. Source cards such as `Spiky Energy` activate on being **damaged by an attack**, so their applicability to counter placement must follow that exact distinction.

## Why the wall is not an auto-win

The Iron Thorns sources are **resource-denial and deck-out decks**, whose win condition does not require doing attack damage to Mimikyu. Exact card-count options from the published originals:

| Source rank | Energy denial and hand disruption | Position/deck-out pressure |
| --- | --- | --- |
| 6 | Plumeria ×4, Team Flare Grunt ×2, Faba ×1, Enhanced Hammer ×2, Crushing Hammer ×4, Eri ×1 | Guzma ×3, Captivating Poké Puff ×1, Echoing Horn ×1, Team Rocket's Handiwork ×1, Lusamine ×2 |
| 24 | Plumeria ×4, Team Flare Grunt ×2, Faba ×1, Enhanced Hammer ×2, Eri ×2 | Guzma ×2, Bellelba & Brycen-Man ×1, Lusamine ×2 |
| 29 | Plumeria ×4, Team Flare Grunt ×2, Faba ×1, Enhanced Hammer ×1, Crushing Hammer ×4, Eri ×1 | Guzma ×3, Captivating Poké Puff ×1, Target Whistle ×1, Team Rocket's Handiwork ×1, Lusamine ×2 |

The opponent can stall a two-Energy Ghost Eye under repeated Energy removal, shuffle or mill the candidate toward deck-out, disrupt hand Items, or gust a vulnerable Benched Rule-Box attacker into Volt Cyclone's damage range. `Captivating Poké Puff` / `Echoing Horn` / `Target Whistle` can potentially create a Bench target for future gust depending on the true card text and the candidate's hidden hand/discard. Repeated Lusamine/VS Seeker access may further extend denial, but no infinite loop is asserted.

Thus, a protected Mimikyu may **change the game from direct damage pressure into a resource and deck-out contest**, rather than settle it. This is exactly where discarding constraints, Supporter contention, opponent policy and Bench resource management matter. A 1-of Mimikyu is also vulnerable to initial Prizing and to opposing gust while another vulnerable Pokémon occupies the Bench.

## Follow-up falsification before a deck swap

1. In a fixed legal board, verify live Store `Volt Cyclone` into **Active Mimikyu PAL** with Thorns Initialization does **zero damage**, while Ghost Eye places exactly seven counters after costs are legally paid.
2. Under exact rank6 and rank24 source 60s, audit whether the relevant printed Trainer effects can sustain **Energy denial for at least four turns** and whether a candidate could recover enough attachments to win a Prize race instead.
3. Include **Guzma plus opposing Bench forcing**, item- and Supporter-lock timing, and deck-out. A source bot that insists on repeatedly attacking Safeguard while missing legal denial lines is an invalid strength opponent.
4. If this interaction turns out useful, assess a concrete fixed 60 with strict 4-copy, Japanese Expanded print/date legality, Prize and Bench cost, and the other 29 ranks. A standalone wall against three ranks does not prove one generally superior deck.

**Scope:** This is one matchup-specific printed-text hypothesis, not an implemented attack-policy test, counterfactual outcome or recommendation to change the current fixed candidates. The paper source field still lacks ranks 23/25/28; zero qualified competitive games exist.
