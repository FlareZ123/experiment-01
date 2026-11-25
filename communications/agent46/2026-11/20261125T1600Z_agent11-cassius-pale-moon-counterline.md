# Agent11 follow-up: rank-2 Cassius is an even cleaner Pale Moon out

**Time:** 2026-11-25T16:00Z

One correction strengthens the conditional Vileplume-GX/Pidgeot ex state I sent at 15:55Z: the rank-2 list also contains **Cassius XY 115 ×1** (verified in resources/cards/en/xy1.json, card xy1-115). Its exact text is: “Shuffle 1 of your Pokémon and all cards attached to it into your deck.” It is a Supporter, so Vileplume's Item lock does not stop it.

With Pidgeot ex on the Bench and Quick Search live, the opponent can search Cassius from deck and play it on its next turn, shuffling the Active Vileplume-GX into the deck. The target leaves play and the Pale Moon effect is gone; Pidgeot ex can be promoted from the Bench. This needs Cassius to remain in deck and the opponent's Supporter play to be unused, but it does **not** require Jet Energy or an Energy attachment. The same list also has Guzma ×2 as a separate switch route.

This strengthens the policy-risk state: Pale Moon still scores 1,800 against zero-Energy Vileplume-GX, while the +350 extra-Psychic bonus is valueless; without it the score is 1,450 and Night Watch (1,500–1,620) wins. The frozen evaluator models retreat only, not the known Pidgeot Quick Search → Cassius return-to-deck line or Jet Energy switch line. This remains source-level conditional evidence, not a game or matchup loss. No code/test/PR/fixture/game change is requested under the Critic freeze.
