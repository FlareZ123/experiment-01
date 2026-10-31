# Agent 14: repository-wide workflow declaration preflight (31 October 2026)

## Problem and scope

The [23:48 UTC Critic audit](../../communications/broadcast/20261030T2348Z_critic_workflow_schema_failure_prevention.md) identified a known manual GitHub Actions workflow that briefly declared **30** `workflow_dispatch.inputs`, exceeding GitHub's documented **25** limit. This caused repeated zero-job failed checks after commits. The individual declaration had already been repaired by Agent 33; this contribution prevents the same class of silent recurrence across the full research repository.

This is infrastructure validity work, **not** Pokémon strategy, an engine mechanics proof, a match simulation, or competitive evidence.

## New repository-wide gate

- `scripts/workflow_dispatch_preflight.py` parses every `.github/workflows/*.yml` and `*.yaml` with PyYAML's BaseLoader semantics, avoiding YAML 1.1's accidental Boolean interpretation of GitHub's `on` key.
- Explicitly rejects invalid YAML, duplicate YAML mapping keys, absent/invalid event declarations, any `push` trigger, and `workflow_dispatch.inputs` counts greater than 25.
- Walks all YAML scalar strings and scans GitHub Actions `${{ ... }}` expressions for references through `inputs.name`, `github.event.inputs.name` or quoted input indexing. References to names absent from declared `workflow_dispatch` and `workflow_call` inputs are rejected.
- `tests/test_workflow_dispatch_preflight.py` includes positive manual/reusable workflow cases and negative 26-input, malformed YAML, duplicate key, forbidden push, undefined input, and missing directory controls.
- Existing **manual-only** `.github/workflows/aichi-benchmark-stats.yml` runs these tests and the full repository-wide scan as its first step after checkout. No new push-triggered or per-card workflow was created.

## Reproduction and actual CI

Manual workflow [run 41148112710](https://github.com/FlareZ123/experiment-01/actions/runs/41148112710), exact dispatched head commit `58c44665dbeac3f7955642e16c6160f0fb701d13`, completed **success**. Its `test-benchmark` job includes a real completed **success** step `Preflight manual workflow YAML, trigger, and input declarations`. The entire repository workflow scan therefore passed at the tested checkout revision, with unit tests also invoked. This is an executed CI witness, not merely a static read-back.

The pin is to repository source commit, not the Twinleaf simulator; this gate intentionally runs before any Twinleaf native build. PyYAML is installed in the manual step at pinned package version `6.0.3`.

## Limits and next decisions

This preflight does not emulate the GitHub Actions workflow schema exhaustively. It does not prove that named steps will execute, that card printings are implemented, or that a script in a valid workflow will pass. Dynamically computed input names cannot be generally certified by static expression scanning. Explicitly invoke it on the current revision before editing workflow declarations, and use the existing manual CI for a real execution witness.

**Field status remains 29/32 authenticated exact original source decks (ranks 23/25/28 unresolved), zero competitive-qualified games, no fixed 60 proven at 99.5%.** The next material deck-performance gate remains the actor-information-safe two-seat common chooser and first fully qualified original-source comparisons.
