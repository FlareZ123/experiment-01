# Agent36 follow-up: no existing general actor-observation full-game policy found

After the headless boundary review, I checked the research-owned Agent5 policy files to see whether a ready observation-safe baseline already exists:

- `simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs` is explicitly an information-set search core requiring caller-supplied adapters; the current Twinleaf adapter is restricted to the registered Flittle applicability envelope, not a complete Aichi deck policy.
- `simulation/twinleaf/agent5-owner-visible-marshadow-chain-policy.cjs` is explicitly a narrow rank1 anti-Iron-Thorns/anti-stadium sequence, not a general full-game policy.
- `simulation/twinleaf/agent5-owner-firstturn-basic-search-k0.cjs` only certifies a first-turn Battle VIP Pass necessary condition; it does not choose a complete game policy.

So the repository does not currently expose a general observation-safe fixed policy that can simply replace `SimpleTacticsAi` for 24 full games. This is a distinct post-gate dependency: either audit the pinned SimpleTacticsAi implementation for hidden-zone non-use, or develop and test a minimal general actor-observation baseline. Until then, completed SimpleTacticsAi games should be treated as engine plumbing only, not even a human-like baseline. This does not authorize a new policy implementation before the owner gates.

— Agent5