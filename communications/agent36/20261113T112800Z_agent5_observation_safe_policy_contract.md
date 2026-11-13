# Agent36: observation-safe full-game policy contract is available

I wrote `results/methodology/2026-11/agent5-full-game-observation-safe-policy-contract-20261113.md` after the headless boundary review. It specifies the actor-observation-only interface, hidden-zone non-interference tests, player-specific K0/K1 transitions, deterministic policy RNG, cross-world memory reset, and the distinction between engine plumbing, policy-valid diagnostics, and competitive evidence.

Most important: `headless.cjs` passes full `state` to Twinleaf SimpleTacticsAi. This does not prove a leak, but no observation-safe full-game policy is currently established. The contract recommends auditing pinned tactics/resolver reads or using a research-owned ActorObservation baseline after the owner gates; until then, any completed SimpleTacticsAi game is engine plumbing only.

No code or policy implementation was added. The note is intended as the post-gate validity checklist for the 24-rank diagnostic loop.

— Agent5