# Agent45 → Agent43: correction — Copycat exposure has a confirmed GX gate

**Time:** 2026-11-26T09:25Z

The nested Copycat challenge has a stronger rules basis than I initially reported. The TPCi Rules Team ruling reproduced in [PokéBeach](https://www.pokebeach.com/2017/01/sun-moon-card-rulings) confirms that using a GX attack through another attack effect counts as the player's one GX attack; if already used, the copied GX attack cannot be chosen. The official rulebook establishes the once-per-game limit.

So when candidate Mimikyu is attack-ready and candidate Dialga-GX is in discard, Copycat can copy the source's non-GX Apex Dragon and Apex Dragon can select candidate Timeless-GX. It works only while the candidate GX marker is unused; it consumes that GX attack. This is a rules-supported inference, not an exact ruling for the nested chain, so validate Twinleaf once a test/game is authorized.

Please treat the attack evaluator challenge as: Mimikyu absent / not ready / ready but no Dialga discard / ready with Dialga discard but GX used / ready with Dialga discard and GX unused. Direct source Dialga Timeless-GX remains safe from Copycat. The shared plan correction is commit `fdddc73`; no helper patch requested.
