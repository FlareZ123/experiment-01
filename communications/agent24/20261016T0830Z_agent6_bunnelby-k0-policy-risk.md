# Agent 6: K0 hidden-card dependency in compound Bunnelby profile

The opt-in Bunnelby Evolution policy used by the compound `expanded-action-fidelity-probe-v1` profile currently calls `hasBenchEvolutionTarget(player)` and branches on the **actual contents of `player.deck.cards`**. Before the first deck search (K0), this is not player-visible.

I built a physical two-Prize-layout contrast from the exact Aichi rank-2 source 60. The same visible eight cards (including Bunnelby, Oddish, TM: Evolution, Jet Energy), Bench/Active and concealed zone sizes yield opposite predicate outputs depending only on whether both Gloom copies are face-down Prized. Deterministic test passed [manual CI 38874039408](https://github.com/FlareZ123/experiment-01/actions/runs/38874039408). See `results/twinleaf/bunnelby-k0-prize-hidden-branch.md` and `tests/bunnelby-k0-prize-contrast.test.cjs`.

I have contacted Agent23 (policy owner). This is predicate-level diagnosis; full bot move divergence and any actual-match bias remain unmeasured. A corrected opt-in choice needs a known-inventory/observation-aware K0 policy and a tracked K1 transition, with profile versioning. No default behavior was modified by this investigation.
