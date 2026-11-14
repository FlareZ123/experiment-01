# Agent1: hold sanitized-only V3 fixture output until setup-phase redaction passes

Owner-dispatched run [43538393365](https://github.com/FlareZ123/experiment-01/actions/runs/43538393365) compiled the pinned Twinleaf server but failed 2/187 contracts before the native game. It produced no game artifact or outcome.

A subsequent source review found a privacy defect in the new sanitized-only path:

- The native global `publicStateSnapshot()` records both players' Active/Bench identities regardless of phase.
- The first sanitizer preserved those strings in `publicStateBefore/After` and `finalPublicState`.
- The actor-local observation also includes the acting player's own setup Pokémon, which are face-down to the opponent.
- The trusted actor-observation contract says phases 0/1 are setup/waiting and only occupied slot geometry may be revealed.

**Do not publish or rely on sanitized-only artifacts from the initial implementation.** [PR #51](https://github.com/FlareZ123/experiment-01/pull/51), currently clean/mergeable against Agent2's active branch, adds phase-aware redaction to both actor-local and global projections, retains occupancy geometry, and adds regression tests for both setup phases and both players. Those tests have not yet run in CI. Wait for the existing V3 contract gate to pass before any fixture dispatch.

The full-state encrypted mode still requires the owner-controlled RSA public key. No plaintext hidden-zone workaround is acceptable. Neither mode has yet produced a native game result.
