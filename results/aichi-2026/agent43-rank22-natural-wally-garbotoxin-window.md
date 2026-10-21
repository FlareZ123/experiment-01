# Rank22 Wally: exact direct first-turn Tool-Garbotoxin window

**Agent 43, 21 October 2026. Source-locked combinatorial opportunity, not a simulated game or matchup win.**

## Registered source and mechanically legal line

The [published rank22 60](https://limitlesstcg.com/tournaments/566/decklists), preserved under rank22 of `full-decklists.json`, has 1 Wally, 2 Trubbish (two printings), 2 [Garbodor BKP 57](https://limitlesstcg.com/cards/bkp/57), and six Tools (4 Float Stone, 1 Forest Seal Stone, 1 Muscle Band). It has **12 Basic Pokémon** overall. The contemporary [participant account](https://pokekameshi.com/cl2026aichidec-extra/2/) reports Wally was mistakenly registered in place of an intended Hisuian Heavy Ball; see [provenance note](agent43-rank22-intent-registration-divergence-20261021.md).

If rank22 **goes second**, it can play a Trubbish on its first turn, attach a Tool, use [Wally's printed text](https://www.pokemon-card.com/card-search/details.php/card/30931) to evolve that Trubbish from the deck immediately, and activate Garbodor's **Garbotoxin** before the opposing second turn. Japanese official rules prohibit Supporters during the first turn **going first**, so the direct Wally line is first-turn-second only. The Tool is retained on evolution. This is a legal *possible line*, contingent on available resources, no obstructing effects and the chosen action sequence. Wally consumes the sole Supporter allowance and early Garbotoxin can also suppress rank22's own support Pokémon Abilities.

## Exact strictly natural resource window

Under uniform physical shuffling, a Basic-valid opening seven, six unknown Prizes, no opponent mulligan bonus, and one mandatory first-turn draw, require simultaneously:

1. Wally, at least one Trubbish and at least one Tool among those first eight cards;
2. at least one Garbodor remaining in the search-accessible deck after setting six Prizes.

Exact finite hypergeometric enumeration gives

**P(resource window | Basic-valid starting seven) = 1185038867 / 69079704408 = 1.715466036%.**

Basic-valid starting-seven probability before redeals is **394669 / 487635 = 80.935330729%**. The unconditioned joint event probability is **1.388418110%** per raw random shuffle.

[Reproducible BigInt enumerator](../../scripts/agent43-rank22-natural-wally-window.cjs) and [rank22 source-locked test](../../tests/agent43-rank22-natural-wally-window.test.cjs). An independent Python `fractions.Fraction` multivariate enumeration reproduced the reduced ratio; a separate local Node 22 miniature exhaustive permutation oracle agreed with the same combination method. The committed test has not yet been reported as a compiled CI pass.

**Limit:** This is a narrow *no-search* opportunity, **not** the frequency of actual Garbotoxin activation. Four Quick Ball and other connectors, draw Abilities, discarded-card recovery, actual choices, opponent pressure and source-vs-candidate policy may increase or suppress actionable access. No Wally in the intended Heavy Ball counterfactual means this specific line is unavailable, although other paths may establish Garbodor. No native Store or qualified game is claimed. **29/32** attributed opponents and **zero** competitively qualified games remain unchanged.

## Previous compiled baseline and marginal Tool access

Agent 8 already established and compiled this Wally early-evolution line in [its Float-Stone-only report](absol-garbotoxin-direct-wally-opener.md) (CI 39046678134). Its **four Float Stone** direct source window is **1.249588420%**. Expanding the eligible Tool set to **four Float Stone plus one Muscle Band** gives **1.494118601%**; including **one Forest Seal Stone** gives **1.715466036%**. The six-Tool figure is a permissive legal attachment opportunity: attaching Forest Seal Stone to Garbodor prevents using that copy for Star Alchemy on a Pokémon V, a potentially decisive resource loss. This is an exact Tool-space refinement of previous research, not a novel Wally interaction or demonstrated real-game lock frequency.
