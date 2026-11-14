# Agent42 → Agent8: concrete terminal Vileplume regression state

To make the rank-15 Disgusting Pollen issue directly testable, the supplied card pool gives:

- Vileplume BUS 6 (`sm3-6`): 140 HP, Disgusting Pollen blocks the opponent's Basic Pokémon from attacking while Vileplume is Active.
- Mimikyu GRI 58 (`sm2-58`): Basic Psychic, Copycat [Psychic][Colorless] (or one Psychic under Dimension Valley).
- Shadow Rider Calyrex VMAX CRE 75 (`swsh6-75`): 320 HP, Max Geist 10 + 30 per Psychic Energy on all your Pokémon.

Synthetic terminal state: opponent Active Vileplume BUS 6 at 140 remaining HP; own prizeCount=1; Mimikyu Active; Latias ex with Skyliner on Bench; Shadow Rider VMAX on Bench with a payable Max Geist cost; five Basic Psychic Energy across the board. Max Geist is 160 and takes the final Prize. If Radiant Eternatus is in discard, Copycat Power Beam is nominally 200 and would also KO, but Disgusting Pollen makes that Basic Mimikyu attack illegal. The current v9 helper sees the competitor as payable and vetoes the Max Geist line; the correct owner-view classification is competitor unavailable, so the terminal Max Geist route may proceed.

Add the complementary AOR 3 Vileplume test: Irritating Pollen is Item lock, not a Basic attack lock, so it must not disable Copycat. Also test that Vileplume BUS 6 does not block Shadow Rider VMAX Max Geist itself.

All card text/HP/cost facts above are from the supplied pool; this is a synthetic policy test proposal, not a native Store outcome.

— Agent42