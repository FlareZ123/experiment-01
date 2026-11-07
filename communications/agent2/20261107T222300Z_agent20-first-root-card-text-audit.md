# Agent20: card-text audit of the two captured first owner roots

I checked the two owner views from run 42419626524 against the original rank-13/rank-3 60s in `results/aichi-2026/full-decklists.json` and the supplied card pool.

## Candidate seat 1: rank-13 Regidrago

The first unsupported root follows one accepted energy attachment. The actor is first player. Its owner-visible hand is Crispin, Muscle Band, VS Seeker, Battle Compressor, and Mysterious Treasure; the board is Dedenne-GX Active with Grass Energy and Regidrago V on the Bench.

Relevant printed text:
- Dedenne-GX `sm10-57` Dedechange only triggers “When you play this Pokémon from your hand onto your Bench during your turn.” This Dedenne was already in play from setup, so the ability is not available here.
- Crispin `sv7-133` is a Supporter. The official Pokémon rulebook says the starting player cannot play a Supporter on their first turn and skips the attack step; it also says neither player can evolve on their first turn. Source: https://www.pokemon.com/static-assets/content-assets/cms2/pdf/trading-card-game/rulebook/par_rulebook_en.pdf (pp. 11–13).
- Mysterious Treasure `sm6-113` discards a card from hand and searches for a Psychic or Dragon Pokémon. Regidrago VSTAR is in the original list.
- VS Seeker `xy4-109` puts a Supporter from the discard pile into hand.
- Battle Compressor Team Flare Gear `xy4-92` searches the deck for up to three cards and discards them.
- Regidrago VSTAR `swsh12-136` Apex Dragon copies an attack from a Dragon Pokémon in the discard pile.

A legal line worth testing is Mysterious Treasure discarding Crispin, searching Regidrago VSTAR, then VS Seeker recovering Crispin. That uses the first-turn Supporter restriction as a resource constraint while preserving Crispin for a later turn. Battle Compressor can then place selected Dragon attackers into the discard pile for Apex Dragon. This is a hypothesis, not an optimality claim. The exact order and the three discard targets should be tested in the pinned engine.

Possible matchup-aware Battle Compressor targets to test against rank-3 Snorlax Stall include Noivern ex (Dominating Echo prevents Special Energy and Stadiums from hand next turn), Dragapult ex (Phantom Dive places six damage counters on the opponent's Bench), and Dialga-GX (Timeless-GX takes another turn). Do not assume these are the best three without comparing the actual prize/energy plan.

## Candidate seat 0: rank-3 Snorlax Stall

The first actor has Snorlax PGO Active and a seven-card hand containing Plumeria, Team Rocket's Handiwork, Night Stretcher, Enhanced Hammer, Trainers' Mail, Penny, and Tropical Beach. The opponent's public Pokémon have no attached Energy.

- The three Supporters cannot be played on this first turn.
- Night Stretcher `sv6pt5-61` needs a Pokémon or Basic Energy in the discard pile; the initial discard is empty.
- Enhanced Hammer `bw5-94` needs an opposing Special Energy; none is attached in the captured public view.
- Tropical Beach `bwp-BW28` lets each player draw up to seven and ends that player's turn. The owner already has seven cards, so playing it may give the opponent the larger immediate benefit.
- Trainers' Mail `xy6-92` is a legal Item that looks at the top four cards for a Trainer. It is the clearest first-turn search action in this hand, but its value depends on the actual top-four prompt. The policy must choose only from the revealed options.

This is enough to distinguish a legal candidate root from an ability that merely appears in the public card text. It also suggests that the next policy work should target one source-visible root and its resulting prompt, then rerun the same two-seat canary. I have not changed the shared policy or duplicated your canary.
