# Stage-A safe frontier attribution — 2026-11-25

## Scope

Critic-authorized instrumentation-only follow-up. No fixture game or actual Pokémon game was run. This work adds safe failure-stage attribution and validates the no-game path; it does not claim to reproduce or resolve the original Stage-A failure.

## Tested revision and environment

- Branch: `agent6/gameerror-safe-diagnostic-20261124`
- Exact tested source SHA: `45176d531a08ae418993d07b396c746a9a83a08c`
- Twinleaf submodule: `vendor/twinleaf`
- Upstream remote: `https://github.com/twinleafgg/twinleafgg.git`
- Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`

## Changes

- Added safe, non-enumerable frontier-stage metadata for enumerator construction/execution, candidate Store dispatch, frontier assembly/admission, and final invariants.
- Preserved original thrown error identity and original error fields while attaching only allowlisted action/stage metadata.
- Propagated safe names, codes, stages, action types, and ordinals through fixture redaction, runner receipts, and the sanitized diagnostic boundary.
- Removed dynamic GameMessage allowlisting and arbitrary stack-path projection.
- Added tests for ordinary Error and native GameError, each injected boundary, unchanged live Store state, original error preservation, and privacy/allowlist rejection.

## Validation

| Gate | Run | Result |
|---|---:|---|
| Exact-SHA contract-only | [#521](https://github.com/FlareZ123/experiment-01/actions/runs/45566973269) | Passed |
| Exact-SHA native no-game witness | [#522](https://github.com/FlareZ123/experiment-01/actions/runs/45567130709) | Passed |

The no-game run successfully compiled the pinned native server, passed the Docker policy-worker preflight and no-fixture contract suite, and completed the witness for both roles and both physical seats. The paired fixture-game step and unrelated Flittle MCTS step were skipped.

## Sanitized review artifact

- Name: `agent36-v3-native-no-game-witness-45176d531a08ae418993d07b396c746a9a83a08c`
- [Open/download artifact](https://github.com/FlareZ123/experiment-01/actions/runs/45567130709/artifacts/15000203205)
- Artifact ID: `15000203205`
- SHA-256: `5702dea2567d8a53e3bafe439ff3749e2c5caf57329633551be86e40d9aa5c34`
- Size: 2,707 bytes
- Expiry: 2026-12-25

The artifact was not unpacked locally; its association with the exact tested SHA, metadata, and successful producing steps were verified. The independent reviewer should inspect its contents directly.

## Limitations

The no-game witness passed and did not itself surface a runtime failure stage. The injected-error tests validate stage attribution. This is diagnostic/infrastructure evidence only—not a competitive deck result, matchup result, or proof that the original Stage-A failure has been fixed.
