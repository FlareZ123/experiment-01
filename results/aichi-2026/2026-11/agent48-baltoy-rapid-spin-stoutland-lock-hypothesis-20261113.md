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

## Follow-up: exact Pidgeot/Guzma response and Max Geist damage threshold

A source-level check of the complete rank-2 list and the relevant card text sharpens the counterplay:

- The [Limitless rank-2 decklist](https://limitlesstcg.com/decks/list/26808) contains **2 Pidgey, 2 Pidgeotto, 2 Pidgeot ex, 1 Stoutland, 2 Guzma, 1 Lusamine and 1 Team Yell's Cheer**, in addition to the two Vileplume AOR 3. Pidgeot ex's [Quick Search](https://limitlesstcg.com/cards/OBF/164) searches any card from the deck once per turn. If Stoutland is benched by Rapid Spin and Pidgeot ex is established, the opponent can search one of the two Guzma and restore Stoutland on the response turn. The two Guzma are finite, but the list also has Supporter recovery.
- Stoutland's [Sentinel](https://limitlesstcg.com/cards/BCR/122) is explicitly Active-dependent. Vileplume AOR 3's [Irritating Pollen](https://limitlesstcg.com/cards/AOR/3) has no Active requirement: it continues to prevent Item plays while Vileplume is anywhere in play, including on the Bench. Rapid Spin therefore removes only the Supporter lock for the opponent's response turn; it does not create an Item window.
- The candidate's current [Hood Shield Shadow Rider 60](../../decks/hood-shield-shadow-rider-v1-expanded-legal-60.md) has one Float Stone, one Guzma and two VS Seeker, but no Switch/Escape Rope. The Item lock makes VS Seeker and an unplayed Float Stone inaccessible while Vileplume is in play. Baltoy must already be found, powered and made Active through a pre-established retreat line or a temporary Supporter window.
- There is one promising damage interaction, still untested: Rapid Spin puts 10 damage on Stoutland. Shadow Rider VMAX's Max Geist does 10 + 30 per Psychic Energy attached across the candidate's Pokémon, so **four** Psychic Energy produce 130; with Rapid Spin's 10 damage, that reaches Stoutland's 140 HP. This can turn a four-energy Max Geist into a Stoutland KO if the opponent restores it Active and the candidate can keep/promote Shadow Rider as its attacker. However, the opponent's Guzma also chooses the candidate's replacement Active, so the KO line is not guaranteed.
- Revised assessment: Baltoy is **not a reliable lock breaker**. At best it is a conditional one-turn Supporter window, a finite-Guzma tax, or a 10-damage setup for a four-energy Max Geist KO. Pidgeot ex makes restoration much more credible; Vileplume's Item lock persists throughout. Keep the card out of the nominated 60 until a paired MCTS experiment shows net benefit against the exact rank-2 list, including Pidgeot ex established/not established, both Guzma available/expended, and candidate Float Stone/attacker positioning.

This is a card-text/decklist derivation, not a measured matchup result. Sources are the Limitless rank-2 list and the three linked card texts above; the candidate 60 is the repository list linked above.
