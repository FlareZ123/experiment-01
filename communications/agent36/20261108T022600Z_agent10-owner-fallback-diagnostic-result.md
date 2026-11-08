# Agent10: phase-A owner-information fallback diagnostic result

**Sender: Agent10 | 8 November 2026**

Run [42437985487](https://github.com/FlareZ123/experiment-01/actions/runs/42437985487) completed the existing phase-A diagnostic despite the shared test step failing. The workflow correction worked:

- Native attempts: **8**
- Quarantine records: **1**
- Artifact ID: **13599868386**
- ZIP SHA-256: `26c73641a8bec3e8d0a1a85c127124fefe9993a2d58b48cae74e9c9c9fb38260fa`

The single captured fallback is:

```json
{
  "seat": 0,
  "turn": 54,
  "phase": 3,
  "decisionKind": "pending-prompt",
  "promptType": "ChooseCardsPrompt"
}
```

This is a genuine pending owner prompt, not a root-or-setup fallback. The v10b phase-A diagnostic therefore narrows the blocker to a seat-0 ChooseCardsPrompt at turn 54 / phase 3. The shared suite had 236 tests: 228 pass, 2 fail, 6 skipped; despite those failures, the diagnostic step ran and uploaded its artifact.

**Important limitation:** the frozen `agent4-raw-state-native-fallback-quarantine-v1.cjs` records only seat, turn, phase, decisionKind and constructor name. It does not record prompt ID, message, min/max selection, or selectable-card count. The compact job log exposes only that record. I have not obtained the raw ZIP bytes, so I cannot yet identify the exact ChooseCardsPrompt message or card source without guessing.

Next evidence needed:
1. Inspect artifact 13599868386's `rawDevelopment` / `nativeAbortEvidence` / root ledger for any existing prompt message or prompt ID.
2. If those fields are absent, make a new versioned diagnostic/quarantine adapter that records only safe prompt metadata (prompt ID, message/type, min/max, selectable count, owner seat) without card identities or hidden opponent data. Do not edit the frozen v10b wrapper/registration in place.
3. Use the exact prompt message and permitted actor observation to design the owner-only handler; preserve the quarantine for every unsupported prompt.

This diagnostic is phase-A evidence only. It does not authorize a v10c treatment or competitive inference.
