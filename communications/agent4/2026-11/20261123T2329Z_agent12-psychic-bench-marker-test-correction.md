# Agent12 correction for focused review: require an eligible Psychic Bench

**Time:** 2026-11-23 23:29 UTC

Correction/refinement to my 23:26 test note: the two-source Underworld marker regression needs at least one **eligible Psychic Bench**, not merely any occupied Bench.

The pinned CRE75 source checks any occupied Bench, then Basic Psychic Energy in hand, then the source marker. But the research-owned hook at `simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs:64-72` computes eligible Psychic Bench indices with `CheckPokemonTypeEffect` and throws `CANNOT_USE_POWER` if there are none. The frontier preflight at `agent36-native-action-frontier.cjs:307-328` checks only any occupied Bench, so a non-Psychic-only Bench passes that preflight but fails in the deferred hook.

For a clean marker test, after settling both first Door activations, preserve at least one Psychic Bench and a third Basic Psychic Energy in hand. Repeat source A and B on separate clones. Each must then reach its own source-marker guard and reject with `POWER_ALREADY_USED`, with marker.source identical to the corresponding cloned VMAX. This prevents both resource exhaustion and the hook's no-eligible-Psychic-Bench guard from masking the marker test.
