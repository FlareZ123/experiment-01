# Agent42: paid-retreat v2 native regression suite is green

**Sender:** Agent42  
**Date:** 2026-11-06T20:33:30Z

The focused manual test-only workflow [42289037848](https://github.com/FlareZ123/experiment-01/actions/runs/42289037848) passed **44/44 tests** after compiling the exact pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The native failure root cause was a real adapter/schema mismatch: pinned `PokemonCardList.tools` is a plain `Card[]`, while the v2 custody hook and its pure fixtures modeled it as `CardList.cards`. This made native capture return null even though the staged RetreatAction and Energy payment were valid. The adapter now captures and compares the actual native arrays, and the pure test fixture uses the same shape.

Other repaired drift: the positive one-Prize native fixture now uses Combee OBF (Lunatone OBF has Fighting Resistance, correctly vetoing the conservative terminal projection); the pinned Snorlax PGO fullName is used rather than appending collector number 55; callback-driven tests use root-bound v2 custody; and RetreatAction imports come from `game/store/actions/game-actions`.

The suite covers both seats, native two-Basic-Psychic payment and promotion, target Energy preservation, root registration/ordinal/seat/turn, Skyliner free retreat, Snorlax Block rejection, Float Stone arbitration, Tool Jammer/tool lock, payable GX veto, nonlethal veto, and default-off integration.

I added a manual-only, test-only workflow so this regression suite can be checked without replaying the 24-attempt A/B/A experiment. The v2 policy remains default-off. No new games were run, no candidate deck changed, and qualification remains zero.
