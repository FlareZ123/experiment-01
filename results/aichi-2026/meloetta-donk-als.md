# Aichi rank 26: Meloetta ex first-turn donk and lone-Active exposure

## Evidence provenance

Aichi Top 32 rank 26 **Hibiki Yamada** registered the [published 60-card Meloetta Donk list](full-decklists.json). The player personally documented his sequence and Aichi experience in his Japanese-language [13 May 2026 tournament report, “CL Aichi May Expanded retrospective: Meloetta one-turn KO”](https://note.com/hibi2571/n/n9f4c7d7568b8). In the report he says his Swiss record was 7-1, his Top 32 match was lost, and the seven wins were successful first-turn KOs. This is a first-person historical account, **not a controlled simulator estimate**. Every combo effect below was separately cross-checked against exact card text from `resources/cards/en/`; the English database may not prove Japan-region print legality.

## Core archetype-specific line

The objective is to make the opponent take **five Prize cards from the Meloetta player's own Pokémon Knock Outs**, leaving the opponent with exactly one Prize card. Then Meloetta ex uses **Technical Machine: Crisis Punch** for **280 damage**, which is normally permitted only when the opponent has one Prize card left. Meloetta's **Debut Performance** Ability makes that attack usable even on the first turn when Meloetta goes first.

A rules-aware reconstruction of the player's published explanation:

1. Play **Risky Ruins**. During the turn, every Basic non-Darkness Pokémon played onto the Bench receives 2 damage counters (20 damage). Bench two **30 HP Exeggcute** and a third non-Darkness Basic to hold additional counters. The two Exeggcute each remain at 10 HP.
2. Play **Damage Pump**, moving one damage counter from the third Pokémon to each Exeggcute. Both are now Knocked Out, giving the opponent **two Prize cards**, while freeing those Bench slots.
3. Retrieve the Exeggcute from the discard pile with **Propagation**, Bench them again under Risky Ruins, and repeat. The player describes **three Damage Pump cycles** with self-KO counts of **2 + 2 + 1 = five**. Propagation permits a Pokémon returning to the discard pile to be activated again if its use condition is satisfied; this needs a regression test in any simulator.
4. Put **Tapu Koko ◇** on the Bench and use **Dance of the Ancients** to attach Lightning Energy from the discard pile to Meloetta ex and another Benched Pokémon. Attach **Double Colorless Energy** to Meloetta ex as the manual Energy attachment, and give it **TM: Crisis Punch**, supplying its three Colorless attack requirements.
5. Move Meloetta ex into the Active Spot as necessary. Attack for **280**, provided the opponent has exactly one Prize card remaining and Meloetta's Ability remains available. If the opponent began with a single Active Pokémon, it is now Knocked Out, and no defending Pokémon remains in play, that opponent loses the game.

The physical sequence requires a suitable supply of damaged counter-donor Pokémon, Bench space, copies of Damage Pump, accessible Risky Ruins, Exeggcute, discard-pile Lightning Energy, Tapu Koko ◇, Double Colorless Energy, TM: Crisis Punch, and a switch/retreat route where needed. Most of these demands were abstracted away from the player's high-level explanation. **Do not promote this prose line into an always-successful simulator macro.**

Important card text details:

- `bw9-4` Exeggcute: 30 HP; Propagation retrieves it from discard.
- `me1-127` Risky Ruins: puts **20 damage** on each non-Darkness Basic that enters the Bench **during a player's turn**. Cards initially set on the Bench before play starts are unaffected by the Stadium.
- `swsh11-156` Damage Pump: moves up to two 10-damage counters from one of your Pokémon to others.
- `sv4pt5-90` TM: Crisis Punch: [CCC], 280 damage, opponent must have exactly one Prize card remaining.
- `zsv10pt5-44` Meloetta ex: Debut Performance allows attacking on first turn going first.
- `sm9-51` Tapu Koko ◇: Dance of the Ancients attaches one Lightning Energy from the discard pile to each of two Benched Pokémon, then sends Tapu Koko ◇ to the Lost Zone. A Lightning may be attached to Tapu Koko itself as a second Benched Pokémon, subject to its text.
- `xy7-30` Unown: Farewell Letter discards itself from the Bench for a draw, explicitly **without counting as a Knock Out**; these cycles do not grant Prize cards.
- `swsh10-136` Canceling Cologne: opponent's Active has no Abilities for the turn; the rank-26 list includes one. An opponent's Active **Iron Thorns ex** would otherwise threaten to suppress Meloetta's Debut Performance through Initialization, subject to the active Ability-lock state.

## Exact structural exposure of defending decks

Winning immediately by only Knocking Out the defender's Active Pokémon requires **no opposing Bench Pokémon** to remain. This is influenced by the starting seven-card hand and the optional bonus cards drawn after the attacker mulligans. Meloetta Donk has **12 Basic Pokémon** in its published list.

The model implemented in [`scripts/aichi_solo_start.cjs`](../../scripts/aichi_solo_start.cjs), with [tests](../../tests/aichi_solo_start.test.cjs), calculates the probability that a defending deck has **exactly one Basic Pokémon after opening**, conditioned on a valid initial seven. It then allows every offered opponent-mulligan bonus card to be drawn and Benches any extra Basics available. Simultaneous mulligans award no additional cards. Six unknown Prize cards are marginalized.

For a defending deck with `b` Basics, write `p(b) = C(60-b,7)/C(60,7)` and `q=p(12)` for the 12-Basic Meloetta player's mulligan rate. Then:

- `P(one Basic | valid seven) = b*C(60-b,6)/[C(60,7)-C(60-b,7)]`
- `P(at least k bonus draws from Meloetta) = (1-p(b))*q^k/[1-p(b)*q]`
- Given one Basic in seven, the chance that `k` bonus cards bring **no additional Basic** is `C(54-b,k)/C(53,k)`. Average this event over the exact joint-mulligan distribution, capping physical bonus draws at 47 cards.

The shared joint-mulligan distribution itself comes from [`scripts/aichi_bonus_draws.cjs`](../../scripts/aichi_bonus_draws.cjs). The [`aichi_solo_start.cjs` audit](../../scripts/aichi_solo_start.cjs) outputs every published defender's exposure.

| Defending list | Basics | Only one Basic after valid seven | Only one Basic after accepting all offered bonuses |
| --- | ---: | ---: | ---: |
| Rank 1 Shadow Rider Calyrex | 14 | 39.418% | **37.507%** |
| Rank 5 Mew Genesect | 11 | 51.222% | **49.446%** |
| Rank 6 / 24 / 29 Iron Thorns | 4 | 84.175% | **83.674%** |
| Rank 8 Absol Garbodor | 10 | 55.499% | **53.829%** |
| Rank 10 Regidrago | 15 | 35.847% | **33.946%** |

These numbers are **structural opening exposure**, and are at most an upper bound on winning by the *particular* lone-Active first-turn Crisis Punch route under this model. They omit first-player choice, successful five-KO setup, attack completion, the defender's Active HP, damage mitigation, Psychic Ability lock, effects on Trainers, and counterplay. They are **not estimates of Meloetta's game win rate**.

## Strategic consequences and tests

If the defending player recognizes this matchup and can Bench a second Basic during setup, that directly prevents the specified lone-Active instant win. Bonus-draw cards offered following the Meloetta player's mulligans can help. However, protecting against the donk by adding Basic Pokémon to a deck must be evaluated against all other matchups and the strategic value of the replaced cards.

A **280-HP-or-higher?** health threshold must be resolved carefully: an undamaged Active with **more than 280 HP** survives unmodified Crisis Punch. Exactly **280 HP is Knocked Out** if no prevention or reduction applies. Multi-Pokémon starting boards survive the loss of one Active, unless other effects also remove all remaining in-play Pokémon. An Active Ability lock can stop Debut Performance, although the rank-26 Canceling Cologne supplies a potential answer.

**Priority simulator acceptance tests** should include (a) five opponent Prize cards awarded for 2+2+1 self-KOs, (b) Exeggcute Propagation recurring after re-entering discard, (c) Risky Ruins not damaging setup-stage Benching, (d) Meloetta using a Tool-provided attack when going first, (e) first-turn Ability-lock and Canceling Cologne interaction, and (f) damage reduction or Bench survival correctly preventing a lone-Active instant win.

**Status:** qualitative line grounded in source testimony and card texts, plus exact setup mathematics. No complete game simulation, opponent-specific success estimate, or 99.5% win evidence.
