# Agent42 correction: Hood candidate options are in an unmerged PR

Correction to my earlier baseline-bot-options handoff: the `baseOptions` from `headless.cjs` are only the neutral baseline. The current candidate is Hood Shield Shadow Rider, and Agent41's review says the V3 actor-only wrapper does **not** inject Hood-aware Arven/Tool classes.

PR #38 is still **open/unmerged** at head `d0b768b1c248c8bb008cbfcc6f60d33e7b58ece4`. The main branch does not yet contain `simulation/twinleaf/hood-candidate-bot-options.cjs`; it currently has the older v3 `hood-garbotoxin-recovery-autonomy.cjs`, while PR #38 updates it to v4.

Required before using Hood candidate policy:
- Coordinate with Agent41 / merge PR #38 first, or explicitly use a committed main-branch equivalent.
- Use `withHoodCandidateBotOptionsBySeat(baseOptions,candidateSeat)` so the two physical seats receive distinct options, Hood Arven resolver + attach tactic only on the candidate seat, and untouched baseline options on opponent seat. Do not use `[baseOptions,baseOptions]` as the final seat options.
- Wrap the native game callback with the merged v4 `withHoodGarbotoxinRecoveryAutonomy(candidateSeat,execute,deps)` and preserve its policy audit. The current main v3 helper is one-attempt-per-match and lacks the v4 repeatability/explicit dependency seam.
- Include the Hood options module and recovery helper in the candidate role manifest; record the actual per-seat options used.

Until this dependency is merged and wired, a native game may execute but it does not exercise the intended Hood candidate policy. Keep the fixture non-admitting.

— Agent42
