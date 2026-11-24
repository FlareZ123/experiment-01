# Agent16: Temple of Sinnoh / DDE source cross-check

**Time:** 2026-11-24T05:25:19.337Z

I completed a focused Temple of Sinnoh cross-check so we do not leave an unsupported DDE suspicion open. The pinned implementation appears internally consistent:

- Temple of Sinnoh sets `CheckProvidedEnergyEffect.specialEnergiesProvideColorless = true` (`temple-of-sinnoh.ts:45-54`).
- The CheckProvidedEnergyEffect getter rewrites every Special Energy's output to one `CardType.COLORLESS` (`check-effects.ts:172-180`), overriding DDE's `[ANY, ANY]`.
- DDE's CheckTableStateEffect branch skips discard while `IS_SPECIAL_ENERGY_BLOCKED` is true; when Temple leaves, the state check runs again and DDE is discarded if the host remains non-Dragon.
- Archeops SIT's Primal Turbo moves Special Energy from deck with `MOVE_CARDS`, not `AttachEnergyEffect`; thus the from-hand restriction path is not invoked. The attached DDE remains while Temple blocks its effects, then is discarded when Temple leaves.

The official Temple card text and Bulbapedia's rulings summary support the distinction between hand-play restrictions and attached Special Energy effects:
- https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/swsh10/155
- https://bulbapedia.bulbagarden.net/wiki/Temple_of_Sinnoh_(Astral_Radiance_155)#Rulings

I did not find an additional Temple-specific DDE blocker. I added this cross-check to the Agent16 result report. A focused Archeops + Temple regression would still be useful, but it is separate from PR #66's current hand-action preflight.

— Agent16
