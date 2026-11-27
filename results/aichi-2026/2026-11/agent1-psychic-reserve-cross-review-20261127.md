# Cross-review of Psychic Reserve v3e: rank-15 dual Vileplume exposes a Basic-only recovery bottleneck

**Agent 1 · 27 November 2026**  
**Reviewed architecture:** Agent13's legal English Psychic Reserve v3e (4 Iron Thorns ex / 1 Mimikyu; 5 Basics total).  
**Decision:** agree with parking v3e from the next cross-architecture policy slot. Preserve it as an Iron-Thorns-family refinement candidate.

This is the adversarial response requested by the 19:40Z Critic. It does not claim v3e is a weak deck. It identifies one state where the architecture's recovery set is materially narrower than New Moon's.

## Exact adversarial source state: rank 15 dual Vileplume

Published rank 15 contains both:

- **Vileplume AOR 3 — Irritating Pollen:** each player cannot play Item cards from hand;
- **Vileplume BUS 6 — Disgusting Pollen:** while this Vileplume is Active, the opponent's **Basic Pokémon cannot attack**.

Psychic Reserve v3e contains only five Pokémon:

- 4 Iron Thorns ex — Basic;
- 1 Mimikyu PAL 97 — Basic.

It has **no Evolution attacker**.

Therefore an established board of:

`AOR Vileplume in play + BUS Vileplume Active`

removes both of v3e's main action classes simultaneously:

1. Items are shut off;
2. every Pokémon in the deck is Basic, so every attack is shut off while BUS Vileplume remains Active.

Iron Thorns Initialization does not solve this. It suppresses Abilities of Pokémon with Rule Boxes (except Future Pokémon); both Vileplume are ordinary non-Rule-Box Stage 2 Pokémon.

Mimikyu Safeguard does not solve this. It prevents attack damage from ex/V; it does not remove Disgusting Pollen, and Mimikyu itself is Basic and cannot attack.

## The practical escape collapses to direct Supporter access

V3e has three Guzma.

A **Guzma already accessible as the turn's Supporter** can switch BUS Vileplume off the Active Spot and restore Basic attacks for that turn.

But AOR Vileplume means the deck's Item-based connector network is unavailable:

- VS Seeker cannot retrieve Guzma;
- Trainers' Mail cannot find Guzma;
- Tag Call cannot establish a Guzma & Hala line;
- Rotom Bike cannot draw toward Guzma;
- Crushing/Enhanced Hammer and other Item denial cannot buy tempo.

If no direct Guzma is available, v3e can use a Supporter such as Lillie's Determination / Cynthia & Caitlin / Lusamine to improve or recover the hand, but that **uses the one Supporter for the turn**. It cannot then play Guzma that same turn, so the Basic-attack lock persists through at least that turn unless another board action removes BUS Vileplume.

This is not a claim that Guzma is rare enough to lose the matchup. It is the architectural bottleneck:

> under simultaneous rank-15 Item lock + Basic-attack lock, v3e has no Stage-1/non-Basic attacker, no Canceling Cologne and no Ability-suppression route for the non-Rule-Box BUS Vileplume. Its immediate attack recovery is concentrated in the direct Supporter channel.

## Why New Moon is structurally different

New Moon also uses many Basic attackers and can suffer the same BUS Vileplume lock.

But its fixed 60 has:

- Duskull -> **Dusclops Stage 1**;
- Dusclops Cursed Blast as an Ability-based damage channel;
- Canceling Cologne for Active Ability removal when Items are still available before/after the AOR window;
- Horror House sequencing before the lock is fully assembled;
- a broader Stadium / Tool / Energy setup package for surviving the lock.

The important distinction is not that New Moon automatically wins. It is that it has a **non-Basic attack/effect recovery axis** that v3e does not possess.

That makes the two architectures genuinely different under the exact opponent state Critic asked us to use for selection.

## Hardest own setup failure remains independent and additive

The legal v3e English repair keeps the same five-Basic shell, so the exact opening screen remains:

- 47.4562% initial-seven Basic-valid rate before redraw;
- 79.0861% of valid openings contain exactly one Basic;
- 15.8172% of valid openings are Mimikyu-only with no Iron Thorns;
- only 3.2913% of valid openings are Mimikyu-only plus Capture Energy already in the opening hand.

Low Basic count is **not** a disqualifier—rank 6's actual four-Basic Iron Thorns source finished sixth.

But it matters to this adversarial case because a one-Basic opening has less board redundancy when the deck's only attack class is already vulnerable to a Basic-attack lock.

The structural taxes therefore compound:

`five-Basic / often-one-Basic start + all-Basic attacker roster + Item-heavy connector graph`.

That is a more specific reason to park this cross-architecture slot than “mulligans are bad.”

## Counterexample: rank 2 is not the same failure

Do not overgeneralize this critique to every Vileplume control deck.

Rank 2 uses AOR Vileplume + Active Stoutland Supporter lock, **not** BUS Vileplume Basic-attack lock.

Iron Thorns ex's Volt Cyclone does 140, exactly enough to KO 140-HP Stoutland once funded. Even under Item+Supporter lock, v3e can still play Energy, Stadiums and Tools. Thunder Mountain Prism Star can also reduce a Lightning Pokémon's attack cost.

So v3e has a real direct-attacker recovery against rank 2. The rank-15 failure is specific to **Basic attacks being forbidden**, not generic “control beats Thorns.”

## Allocation recommendation

Agree with the existing non-Shadow-Rider allocation:

- **retain unchanged New Moon Lockbreaker v1** for the next cross-architecture policy-investment slot;
- **park Psychic Reserve v3e** as a within-Iron-Thorns refinement.

Reopen v3e for cross-architecture promotion if a material redesign adds a non-Basic/Ability-independent escape from rank-15-style Basic attack denial **without** destroying the denial shell, or if evidence shows the direct-Guzma recovery is sufficiently robust that this bottleneck is strategically negligible.

This cross-review adds no game, win rate or final-deck claim.
