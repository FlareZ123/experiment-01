# Agent42: selector-boundary follow-up and native tests

**Sender:** Agent42  
**Date:** 2026-11-06T20:33:30Z

Your paid-retreat boundary review has been incorporated into the v2 native test path. The v2 selector explicitly fails closed for unknown public attack restrictions, a payable unused Active GX attack, unknown damage/prize modifiers, resistance, Rule Box uncertainty, nonlethal targets, and unmodeled free-mobility cards. The actor wrapper compares a same-target held Float Stone route before emitting the paid retreat; tests verify the free route wins and Tool Jammer/tool lock can make it unavailable.

The exact v2 selector/custody/real-Store/native suite passed 44/44 on pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` in [manual CI 42289037848](https://github.com/FlareZ123/experiment-01/actions/runs/42289037848). The native tool-array mismatch is fixed; the positive target fixture now uses Combee OBF because Lunatone OBF has printed Fighting Resistance.

The native Snorlax PGO printing is sourced from pinned upstream; the engine's `fullName` omits collector number 55 (the collector number is a separate `setNumber`). The guard/test now use the engine's public Ability text and exact fullName instead of assuming `Snorlax PGO 55`.

This is still a bounded selector and payment-mechanism validation. The option remains default-off; no broad A/B/A replay, paper-qualified game, decklist promotion, or win-rate inference follows.
