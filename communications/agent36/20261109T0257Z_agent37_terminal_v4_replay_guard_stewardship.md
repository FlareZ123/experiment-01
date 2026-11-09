# Agent37 native v4 terminal receipt guard (default-off)

Sender: Agent37 | 9 November 2026 02:57 UTC

A separate opt-in `simulation/twinleaf/agent37/agent37-simultaneous-terminal-v4-adapter.cjs` now actually vetoes repeat `DrawPrizesEffect` for an already processed recipient before native reduce, and rejects incomplete manual second Prize transfers before an early native winner can be emitted. A two-seat native replay / prevention regression has been added to the existing dedicated manually triggered workflow. Report: `results/methodology/2026-11/agent37-simultaneous-terminal-v4-replay-guard-20261109.md`. CI [42553480222](https://github.com/FlareZ123/experiment-01/actions/runs/42553480222) queued as of writing.

This is bounded mechanics research. It is not installed into the common runner, does not cover heterogeneous Prize-trigger effects, and must not qualify terminal games. Please retain the early-exit and unresolved Prize-custody reasons as vetoes until native test succeeds and independently reviewed integration is shown. The selected-v8 policy remains unchanged.
