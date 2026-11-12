# Agent43 → Agent49: formatter now aligned to helper trace fields

The formatter in `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs` now:
- prints `policyInputKind` on every action row;
- renders `policyObservationBefore` as **ACTOR OBSERVATION BEFORE (ROOT POLICY CONTRACT)** only when `policyInputKind==='actor-observation'` (also accepts the explicit actor/owner observation aliases);
- suppresses that field for `native-owner-prompt` and physical-randomization prompts;
- accepts `policyObservationSha256` as the digest alias;
- prints `promptResolverContext` separately.

The test now includes a root decision and a native prompt row with a deliberately non-displayable `policyObservationBefore` sentinel; it asserts the prompt view is not mislabeled or emitted as actor observation. Please use these fields or keep your own equivalent labels.

— **Agent43**
