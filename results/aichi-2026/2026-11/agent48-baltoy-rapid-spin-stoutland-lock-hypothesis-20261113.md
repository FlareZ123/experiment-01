# Baltoy Rapid Spin as a targeted Stoutland-lock breaker

**Author:** Agent48  
**Date:** 13 November 2026  
**Status:** untested strategic hypothesis; Agent50/Agent5 asked to evaluate

## Question

Can the Hood Shield Shadow Rider candidate create a Supporter window against the Aichi rank-2 Vileplume Control list, which includes Stoutland's active-only Supporter lock, without relying on Items or Supporters to move Stoutland?

## Candidate card

**Baltoy — Obsidian Flames SV3 94**

- Basic Psychic Pokémon, 70 HP.
- Card-pool legality: Expanded = Legal.
- Attack: **Rapid Spin**, cost `[Psychic]`, 10 damage.
- Text: switch this Pokémon with one of your Benched Pokémon; if successful, switch the opponent's Active Pokémon to the Bench, with the opponent choosing the replacement.

This is unusually compatible with Shadow Rider:
- Underworld Door can accelerate a Psychic Energy to a Benched Psychic Pokémon, so it can power Baltoy without a non-Psychic Energy package.
- Mysterious Treasure can search for a Psychic Pokémon.
- Rapid Spin moves Baltoy itself to the Bench while forcing the opponent's Active Pokémon off the Active spot, so it can pivot directly into a Shadow Rider attacker.

## Exact Aichi target

The authenticated rank-2 list (Takahiro Ando, Vileplume Control) contains:
- 1 Stoutland BCR 122 — Sentinel prevents the opponent from playing Supporters while Stoutland is Active.
- 2 Vileplume AOR 3 — Irritating Pollen prevents both players from playing Items while Vileplume is in play.
- 1 Vileplume-GX CEC 4 — Fragrant Flower Garden heals 30 damage from each of its controller's Pokémon once per turn; it is not an Item lock.

Rank 15 (Ryotaro Nozawa, Lopunny Vileplume) contains two Vileplume AOR 3 (Irritating Pollen) and one Vileplume BUS 6 (Disgusting Pollen prevents the opponent's Basic Pokémon from attacking while this Vileplume is Active), but no Stoutland. This is therefore a specific rank-2 counterplay hypothesis, not a general Vileplume answer.

## Hypothesis

If Stoutland is Active and the opponent has at least one other Pokémon on the Bench, a powered Baltoy can use Rapid Spin to bench Stoutland. Since the rank-2 source list has one Stoutland, the opponent cannot select a second Stoutland as the replacement. **The Supporter window is on the candidate's following turn, not the turn Rapid Spin is used**, because attacking ends the turn. The opponent gets a response turn and may use Guzma or a mobility effect to restore Stoutland Active before the candidate can play a Supporter. If Stoutland remains benched, the candidate may use Guzma to target a Vileplume or another threat.

The Vileplume Item lock remains active while Vileplume is in play. Rapid Spin does not remove Vileplume, does not unlock Items, and does not prevent the opponent from later bringing Stoutland Active again. It creates a potential Supporter window, not a complete lock solution.

## Why this is worth testing

This is not a generic one-card swap: it is a Basic Psychic with a one-Psychic attack, so it can use the deck's existing Psychic acceleration and search infrastructure. The effect bypasses the Item/Supporter lock to move the active Pokémon because it is an attack, not an Item or Supporter.

Other low-cost Expanded-legal attack-based switch candidates exist (e.g. Squawkabilly SV10 160, Lechonk SV1 154, Rookidee SV2 164, Whismur SV4 148, Fletchling SV7 121). Baltoy is the most naturally aligned with Shadow Rider's Psychic-only acceleration among the candidates found in the supplied card pool.

## Required experiment

Compare the exact unchanged 60 against a one-slot Baltoy variant under the same opponent policy, game seeds, seat order, and diagnostic field:

1. Focus rank 2 first; do not infer rank-15 Vileplume performance from this test.
2. Measure the frequency Baltoy is found, benched, powered, and able to attack before the lock makes the setup inaccessible.
3. Measure how often Rapid Spin benches Stoutland, whether a Supporter is then played on the next turn, and whether Guzma can target Vileplume or another relevant Pokémon.
4. Record whether the opponent can restore Stoutland Active and how often the Baltoy line is stranded or too slow.
5. Measure the opportunity cost to Shadow Rider setup, opening consistency, prize mapping, and win rate. Use paired seeds and report sample size and uncertainty.
6. Test the opponent's best replacement choice; Rapid Spin gives the opponent control of the new Active Pokémon.

Agent50 was asked to assess the deck slot and Agent5 was asked whether the MCTS runner can test it against the 24-rank diagnostic manifest.

## Evidence boundary

Card text and Expanded legality are taken from the supplied card pool. The rank-2 and rank-15 card counts are from the authenticated `full-decklists.json`. No game has yet tested this hypothesis. Do not include it in a nominated deck, matchup claim, or win-rate projection until a controlled experiment supports it.