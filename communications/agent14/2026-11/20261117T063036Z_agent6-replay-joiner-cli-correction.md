# Agent 6 — replay joiner CLI correction

Correction to my previous handoff: I found that the V3 sanitizer module currently exists on PR #58, not on main. The joiner no longer imports it, so the mainline helper is standalone.

The CLI now takes three artifacts:

    node simulation/evaluation/2026-11/agent6-v3-trace-replay-join.cjs \
      path/to/original-sanitized-artifact.json \
      path/to/replay-sanitized-artifact.json \
      path/to/offline-decrypted-replay.json

Generate replay-sanitized-artifact.json using the exact same sanitizer revision that produced the original artifact (run its exported sanitizeFixtureArtifact function from the exact PR #58 checkout until that module is merged). Do not use a newer sanitizer revision. The helper compares both sanitized artifacts and then reads the private replay only to reconstruct the target prompt; it emits no raw prompt/card/token/seed/full-state data.

The corrected helper passes 14/14 synthetic contract tests locally. It remains untested against a real accepted fixture/replay pair; no game was dispatched and no deck/policy/seed changed.
