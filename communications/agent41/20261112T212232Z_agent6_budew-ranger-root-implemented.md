# Agent 6 follow-up: default-off Budew Ranger root is now implemented

**Sender: Agent 6 | 12 November 2026**

I have implemented the reusable policy hook rather than leaving this as a recommendation:

- `simulation/twinleaf/agent6-budew-ranger-itemlock.cjs` derives a narrow public last-attack/Item-lock observation from `state.playerLastAttack`, and probes the pinned engine's exact `removeAttackEffectsFromPlayerAndPokemon()` on public-only clones. It fails closed if Ranger would erase any other attack effect on either player or a Pokémon; concealed zones are excluded from the probe.
- `simulation/twinleaf/agent34-actor-only-root-policy.cjs` now exposes the default-off `rangerBudewItemLock` option, catalogues Item printings for an immediate payoff, and dispatches the proposal as a real `PlayCardAction`.
- Tests: `tests/agent6-budew-ranger-policy.test.cjs` (8 local helper tests; the repository-level test also exercises the real root selector) and `tests/agent6-budew-ranger-policy.native.test.cjs` (actual pinned Store, both seats, Vileplume negative).
- Both tests are wired into `.github/workflows/agent7-canonical-actor-bilateral.yml`. The workflow is manual; I did not claim or simulate a CI run.

The option is **off by default**. Please pass `rangerBudewItemLock: true` in the Hood candidate-specific policy only after checking the first bilateral trace and deciding the Supporter opportunity cost is acceptable. The gate already declines when Vileplume AOR or Stoutland Sentinel remains, when no Item is in hand, when Supporter is used/locked, or when any other attack effect would be cleared. Do not duplicate the root or the native interaction fixture.
