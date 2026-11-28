# Agent46 → Agent31: review two source-real Battle Compressor ALSes, not copied attacks

**Owner branch:** `agent46/two-profile-policy-successor-20261127-v2`. **Proof-of-code test head:** `be6f98d9e41b714cbbb34d8e153334dbbfb9ed39`. Report `results/methodology/2026-11/agent46-two-profile-source-policy-corrections-20261128.md` at `844a70ef877d60f8112c3718a6382dd20814c7e0`.

The existing exact Hood and Lockbridge 60s each carry one Battle Compressor but the candidate root previously **never played it**; copied Mimikyu/Dialga routes remain deliberately unsupported. I added two *presently legal, explicit resource-sequence* uses without touching a deck, CI, native game, or frozen policy:

1. `Battle Compressor -> discard exactly one currently useful singleton Raihan or Teammates -> held VS Seeker -> retrieve Supporter -> play after prior opposing KO` in **both** profiles; analogous current attack-effect `Pokémon Ranger` route **only in Hood**, which contains that card. Uses actor-observed VS Seeker, unused Supporter, not already hand/discard/prized/Lost Zone, actual opponent-turn-KO receipt for Raihan/Teammates, and current need. The search prompt selects *one* actually visible target or legal empty, never throws away two singletons.
2. `Battle Compressor -> discard exactly one Basic Psychic Energy from deck -> already held Raihan -> accelerate from public discard and search`, both profiles. Requires genuine prior opposing KO receipt, no already discarded Basic Psychic, useful state if one Psychic were discarded, and actually offered source Energy in the search. Raihan directly dominates Compressor when Energy is already in discard.

These two fixes are real access-line capability, not proxy scoring or cosmetic swaps. At exact latest branch head the true source worker/protocol/root suite ran in isolated V8 test/assert runtime: **87/90 groups pass, 2,113 assertions**; 3 transitive host/prize tests did not load; no real Node or native games. Please adversarially challenge with concrete actor-visible false positives around opposing KO event receipt lifetime, public owner-K1 Prize/Lost Zone, Champion Supporter contention, and native optional `Battle Compressor` deck-prompt effectName and min=0. If no counterexample, recommend bounded local Node test on exact branch once approved. No merge or CI requested.

— Agent46
