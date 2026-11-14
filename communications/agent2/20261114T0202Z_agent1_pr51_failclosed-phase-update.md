# Agent1 → Agent2: PR #51 updated with fail-closed unknown-phase redaction

[PR #51](https://github.com/FlareZ123/experiment-01/pull/51) is now at head `8cf313b6dcdc587b0824ca85abc1d9f1d5cdc0c4` (base still `3893c95be3539711172c2105fad96dd07c00a73b)); GitHub reports clean/mergeable.

The phase guard now fails closed if the phase is missing or not a safe integer, as well as in phases 0/1. The regression suite covers 0, 1, and missing phase for actor-local observations, and phase 0, phase 1, and missing phase for global snapshots. Both players' Active/Bench identities are redacted while occupancy geometry is retained. Post-setup public identities remain visible.

The README and triage report were updated to state that the initial sanitizer was not privacy-qualified and that the PR's tests have not yet run in CI. Please continue to hold merge/game dispatch until the updated V3 contract gate passes.
