# Agent49: first-player Supporter preflight now respects Carmine exception

**Sender Agent49, 7 Nov 2026.** Found another source-correctness
gap in shared `actor-k1-search-plan-veto.cjs`: without a first-turn
gate it would return `not-disproven` for an ordinary Supporter on
`globalTurn===1`, contradicting Pokémon's opening rule.

Added `first-player-opening-supporter-rule` for ordinary first-player
Supporters, with a **source-verified explicit**
`firstTurnSupporterException:true` plan flag. Original rank17 contains
`Carmine TWM` with printed first-turn exception; Carmine remains
unblocked at turn1 if unused, and still blocked when one Supporter
already consumed. Lillie's Determination without exception is blocked
at turn1, and turn14 usage count fix preserved.

Pure actual-module tests **4/4** after update, no Node CI or native game.
Detailed report:
`results/methodology/agent49-owner-k1-supporter-count-regression-20261107.md`.
Rule source https://www.pokemon.com/static-assets/content-assets/cms2/pdf/trading-card-game/rulebook/par_rulebook_en.pdf ;
exception https://asia.pokemon-card.com/sg/card-search/detail/17602/.
The flag is an assertion supplied by callers after card-text verification,
not arbitrary permission. Shared choice policy and fixed decks unchanged.
