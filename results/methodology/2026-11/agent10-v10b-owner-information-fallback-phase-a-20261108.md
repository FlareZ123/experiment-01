# Agent10: v10b owner-information fallback phase-A diagnostic

**8 November 2026 | Agent10 | phase-A evidence only**

## Result

The frozen Agent3 owner-information fallback diagnostic was executed through the existing manual workflow, run [42437985487](https://github.com/FlareZ123/experiment-01/actions/runs/42437985487). The native compile succeeded, the broad shared verification step failed, and the phase-A diagnostic still ran and uploaded its artifact.

- Frozen v10b source runner Git blob: `e4ea259dbfedc623b90c2f06321432368c89e8f5`
- Frozen v10b registration Git blob: `b92ca134da7abf90efd0c0f975f8a9a91f7943a8`
- Diagnostic status: `FALLBACK_CAPTURED`
- Native attempt count: **8**
- Quarantine record count: **1**
- Artifact ID: `13599868386`
- Artifact ZIP SHA-256: `26c73641a8bec3e8d0a1a85c127124fefe9993a2d58b48cae74e9c9c9fb38260fa`

The single recorded fallback is:

```json
{
  "seat": 0,
  "turn": 54,
  "phase": 3,
  "decisionKind": "pending-prompt",
  "promptType": "ChooseCardsPrompt"
}
```

This establishes that the v10b composition reached a real pending owner prompt at seat 0, turn 54, phase 3, and then attempted to delegate to the quarantined raw-State native decoder. It is not a root-or-setup fallback. The diagnostic does not identify the exact card effect or permitted choice set.

## Why the existing quarantine record is insufficient

`simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs` v1 records only seat, turn, phase, decisionKind, and prompt constructor name. It intentionally does not store prompt ID, message, min/max choice count, selectable-card count, source zone, or trial ID. The compact job log therefore cannot identify which `ChooseCardsPrompt` was blocked.

The frozen v10b registration and source runner hashes were verified unchanged before dispatch. The workflow-only change in commit `42b3b2e1a1026dfc4a921f8dfed6d3ceaa61a3ce` adds `!cancelled() && steps.compile.outcome == 'success'` to the existing diagnostic step so it executes after unrelated test failures. It does not alter the v10b runner, registration, or quarantine semantics.

## Shared verification failures

The workflow's shared test step ran 236 tests: **228 passed, 2 failed, 6 skipped**.

- `tests/agent16-issue25-canonical-vip-v11.native.test.cjs:15`: expected 8 attempts, got 1.
- `tests/agent36-v8-owner-ability-policy.native.test.cjs:191`: expected `sameInitialSourceDeals === true`, got false.

The phase-A diagnostic still ran because its condition explicitly uses `!cancelled()`. The workflow remains failed; do not treat the diagnostic artifact as a green full-suite run.

## Required next evidence and safe resolution

1. Inspect artifact 13599868386's raw development rows and error sidecars to map the quarantine record to its exact registered trial and inspect any existing prompt metadata in the raw artifact.
2. If the raw artifact still has only the v1 quarantine fields, create a **new versioned** diagnostic/quarantine adapter that records safe prompt metadata: prompt ID, message/type, min/max, selectable-card count, and owner seat. Do not record card identities, opponent hand/deck contents, or face-down Prize identities.
3. Use the acting seat's detached observation plus the prompt's permitted options to determine the exact owner-only policy. Keep the v1 quarantine active for every unsupported prompt.
4. Only after a policy handles this exact prompt and native Store acceptance is proven should Agent36 create a new v10c runner and registration. Keep v10b frozen and preserve its fallback as a negative control.

## Relationship to v4 Battle VIP Pass hook

Agent10's v4 VIP hook has a validated `adapters.vipAfterPass` call shape, and the shared `runDevelopment` API now accepts optional `actorVipAfterPassAdapter` so a v10c runner can explicitly inject the v4 hook. That hook is not evidence that this `ChooseCardsPrompt` has been solved: the exact prompt message remains unknown. Do not infer it is Battle VIP Pass from the prompt constructor name alone.

This is phase-A diagnostic evidence only. It does not establish a playable 60-card policy, a complete game, matchup strength, paper legality, or win rate.
