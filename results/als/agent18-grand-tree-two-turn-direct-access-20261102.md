# Grand Tree second-own-turn direct access: corrected two-draw model

**Agent 18 | 2 November 2026 | corrected after self-audit | no competitive-qualified games**

## Mandatory correction, 06:11 UTC

An earlier version of this report erroneously counted only **one** natural card draw for the player going first by their **second** own turn. The player going first draws a card at the start of **each** of their turns. The [official Pokémon TCG rules](https://www.pokemon.com/static-assets/content-assets/cms2/pdf/trading-card-game/rulebook/par_rulebook_en.pdf) and [official Asia rules Q&A](https://asia.pokemon-card.com/hk-en/rules/search/?pageNo=11) confirm this. The published **0.4750% original / 0.8463% challenger going-first estimates were invalid**, and have been **retired**. Do not cite them. The corrected two-draw event has the same card-access probability for both physical starting seats under this model. This correction is deliberate, preserving the finding's provenance and withdrawing the false seat comparison.

## Frozen original and challenger

The [original Aichi rank-2 Stoutland/Vileplume printed 60](../aichi-2026/full-decklists.json) contains two Lillipup CEC174, two Herdier SUM104, one Stoutland BCR122, one Grand Tree SCR136 and two Jet Energy PAL190. [Exeggutor/Vileplume v2](agent18-exeggutor-vileplume-native-v2.json) replaces the five Stoutland-chain cards with two Exeggcute, two Exeggutor PLF5 and a third Jet Energy. Both have 14 Basic Pokémon.

Grand Tree SCR136 **cannot** evolve a Basic Pokémon during its player's first turn or the turn that Basic was put into play. Consider the player's **second** own turn, regardless of whether they started first or second. Both players have drawn seven at setup, then one card on each of their first two turns. Require an eligible target Basic in their first eight seen cards, allowing it to enter play during their first turn. Require Grand Tree and Jet among their first nine seen cards, with the evolution stages still **searchable inside the deck** after those seen cards and the six random hidden Prizes.

Stoutland needs at least one Herdier **and** at least one Stoutland in deck for the Grand Tree double evolution. Exeggutor needs at least one Exeggutor stage remaining in deck. Extra card search, abilities, opponent actions and natural evolution are outside this exact event.

## Corrected exact result

| Fixed 60 | Either starting seat, Basic-valid initial seven |
| --- | ---: |
| Original Stoutland 2/2/1, 2 Jet | **7444820561/1112696076800 = 0.669079429%** |
| Exeggutor v2 2/2, 3 Jet | **3016209569/249788915200 = 1.207503370%** |

The challenger has a **+0.538423941 percentage-point** higher probability of this **strictly defined natural direct resource opportunity**, under the card-count model. Its extra Jet and simpler one-stage search both contribute; this does not isolate their independent causal effects. Both starting seats share the same strict physical probability because the owner has made two natural draws in either case. Matchup opportunity windows, Supporter eligibility, the opponent's actions and ability interactions still differ by seat, and are absent from this calculation.

### Reproduction and scope

The corrected [BigInt model](../../scripts/agent18-grand-tree-turn2-window.cjs) explicitly requires **two** owner natural draws by their second turn, rejects one-draw attempts, and accounts for card-group multiplicities, opening Basic validity, first-turn target-Basic availability and Stage(s) remaining in deck under random six Prizes. The corrected [independent exhaustive toy-deal tests](../../tests/agent18-grand-tree-turn2-window.test.cjs) exercise the two-draw physical order and both Stage1 and Stage2 targets. The exact fractions were independently reproduced with Python math.comb/Fraction. All code is in the existing manual benchmark stats workflow and should be read with the test-run SHA.

These are **untutored physical-card conjunction probabilities**. They are not game-winning rates, not true setup rates, and not evidence that a hostile original-source opponent would allow the line. The printed Grand Tree restriction also explains why Agent40's [native Bunnelby/TM two-turn Blockade witness](agent40-exeggutor-blockade-two-turn-native-and-direct-access-20261102.md) necessarily gives the opponent an unblocked turn before the attack-based Supporter lock in that particular sequence. The separate [Wally first-turn-going-second sensitivity](agent18-wally-first-turn-exeggutor-direct-window-20261102.md) remains a different, hypothetical first-turn evolution channel.

## Next decision

A controlled original Stoutland versus Exeggutor v2 comparison against original rank6 Iron Thorns and rank11 Absol/Garbodor under source-owned two-seat policies remains required. Track actual initial setup, payoff, the first turn Supporter lock becomes enforceable and failure-inclusive opponent replies. The corrected card-access contrast is a weak supporting data point, without authority to promote the proposed 60.

**Competitively qualified matches: zero. No validated 99.5% benchmark win rate.**
