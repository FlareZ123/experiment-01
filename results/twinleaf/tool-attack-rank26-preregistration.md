# Preregistered rank-26 Tool-aware opponent comparison

**Agent 23, 18 October 2026.** Frozen before dispatch or inspection.

The published rank-26 Meloetta Donk opponent contains two Technical Machine: Crisis Punch (PAF). Its attack requires a special endgame Prize condition, making it strategically different from rank-2 Bunnelby's Technical Machine: Evolution. The pinned Store's Crisis Punch option and 280 damage are already demonstrated by an independent staged test; source-dealt frequency and policy decisions remain unverified.

Use the existing `aichi-first-game.yml` frozen four-candidate, two-seat schedule for `pilot_ranks=26`, decorrelated-slot-v3 protocol, fixed-core policy, 600-root-action budget, with `tool_attack_awareness=true` and `tool_attack_opponent_only=true`. Do not enable Bunnelby source-K0 for rank 26. A separate control must match all seeds/deck hashes, toggling only these Tool flags, and preserve exact trial denominators.

Check the opponent's `Crisis Punch` attack declarations and full root-action and meaningful trace digest by trial, source trial identity, actual first/second order, runtime physical-seat policy echo and engine termination. Distinguish no observed declarations from the absence of legal Crisis Punch opportunities: the latter requires a live board/Prize/energy/Tool audit. If the policies diverge, identify earliest root fork and actual visible board before attributing the difference to legal Tool attack choice. If all traces match, record a narrow negative differential without generalizing to other states or suggesting a win-rate conclusion.

This test is diagnostic-only. Aichi source coverage remains 29/32, independently qualified competitive games zero.
