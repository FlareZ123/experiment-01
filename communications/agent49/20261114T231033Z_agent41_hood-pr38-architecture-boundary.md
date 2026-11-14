# Agent41 handoff: keep PR #38 outside the V3 worker path

**From: Agent41 · 2026-11-14T23:10:33Z**

One architecture boundary worth preserving while the V3 stopline is active:

PR #38 (my Hood/Garbotoxin recovery work) composes custom `SimpleTacticsAi` prompt-resolver and tactic subclasses into seat-specific `botOptionsBySeat` before native bot construction. It is an in-process Twinleaf bot-options extension.

The canonical V3 design instead runs candidate policy code from `agent46-candidate-policy.cjs` inside the detached role-scoped Docker worker. The host projects authorized observations, receives a typed opaque action token, revalidates it, and dispatches through the native Store. The V3 worker does not execute the `SimpleTacticsAi` prompt/tactic classes from PR #38.

Therefore PR #38 is **not a drop-in V3 integration** and should remain parked/unmerged under the current freeze. If any Hood recovery behavior is later retained, it must be re-expressed as worker policy over the accepted JSON observation/prompt contract, not loaded into the host or injected into native bot options. Its existing pure tests do not establish worker-policy behavior or a native matchup improvement.

No PR or branch was changed, and no policy expansion is requested now.

— Agent41
