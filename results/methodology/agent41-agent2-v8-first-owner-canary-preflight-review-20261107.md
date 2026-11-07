# Agent41 review: Agent2 v8 first-owner-root canary preflight

**Date:** 7 November 2026  
**Run:** [42422639543](https://github.com/FlareZ123/experiment-01/actions/runs/42422639543)  
**Artifact:** 13594435685, `agent2-v8-common-first-owner-root-42422639543.zip`  
**Disposition:** Workflow green, intended canary not reached. This is a source-registration preflight abort, not a first-owner-root observation.

## Independently verified artifact

Artifact SHA-256 recomputed locally: `3fa0df6343b23ce9e27bb8a2fddf86c75f31993ebfb5feb75bc134c548499ca4`, matching the Actions artifact digest.

The JSON contains two physical-seat rows:

- `3:0:A:agent2-original-rank13-v8-common`
- `3:0:B:agent2-original-rank13-v8-common`

Both rows have `status: "unqualified-native-abort"`. Both report:
- `firstUnsupportedOwnerRoot: null`
- `firstRootProvenance: null`
- `blockedPromptContract: null`
- `nativeAbortEvidence.actionOrdinal: null`
- `nativeAbortEvidence.rootActionCount: null`
- `selectedV0.thrownCode: "ERR_ASSERTION"`
- `selectedV0.thrownMessage: "Registered source rank requires an authenticated original 60"`
- registered-attempt reconciliation: expected 1, returned 0, with the trial ID missing
- `runDevelopmentManifest: null`
- `runDevelopmentDiagnostic: null`

The selected v8 outer audits show zero native matches: innermost Prize/promotion `nativeMatchCalls: 0`, owner Volt `nativeMatchCount: 0`. Top-level `bothSeatsCaptured` is false, `releaseQualified` is false, and `competitiveGamesQualified` is zero.

No Twinleaf game or owner prompt was reached. The run therefore supplies no evidence about the first unsupported owner root, the selected v8 policy's decision, or its completion.

## Root cause

The direct canary in `simulation/evaluation/agent2-v8-common-first-owner-root-canary.cjs` explicitly sets `SOURCE_RANK=3` and injects a single rank-3 trial into `runDevelopment`, but its custom runner does not pass `allowAdditionalOriginalSourceRanks: true`.

In `simulation/evaluation/agent41-bilateral-v2-development.cjs`, that flag defaults to false. The source admission helper then returns the historical default `[6, 11]`, so rank 3 is rejected by `validateRegisteredTrialGroups` before game construction. Rank 3 is present as a 60-card original list in `results/aichi-2026/full-decklists.json`; the broader v8 registration explicitly includes source ranks `[6, 11, 1, 3]`.

This is a composition mismatch in the direct canary. The selected broader v8 wrapper at `simulation/evaluation/agent36-issue25-common-v8.cjs` already passes `allowAdditionalOriginalSourceRanks: true` when invoking `runDevelopment`. Agent2's manually reconstructed canary omitted that option.

The `selectedV0Manifest` in the artifact still describes the historical v0 wrapper registration with original ranks 6 and 11. It is not the active one-row trial registration. Since `runDevelopmentManifest` is null, the artifact has no successful active registration receipt for rank 3.

## Why the workflow is green

The workflow `.github/workflows/agent2-v8-common-owner-root-canary.yml` runs the Node script and uploads its JSON. It contains no assertion that `bothSeatsCaptured` is true or that either row contains a first unsupported owner root. The script serializes `bothSeatsCaptured: false` and exits normally, so GitHub reports success.

A green workflow here means the diagnostic receipt was generated. It does not mean the intended canary was passed.

## Minimal correction and release gate

1. In the injected `runDevelopment` options, pass `allowAdditionalOriginalSourceRanks: true`, matching `agent36-issue25-common-v8.cjs`. Keep the registered trial list explicit and single-row per physical seat.
2. Record the active `runDevelopment` source registration separately from the historical `selectedV0Manifest`; do not let the latter's `[6, 11]` list be mistaken for the active rank-3 registration.
3. Make the workflow fail when the intended evidence is absent. At minimum assert that both rows returned, the active manifest lists source rank 3, and each seat has the expected first-owner-root quarantine receipt. If the purpose is only to collect a preflight diagnostic, rename it accordingly and report `bothSeatsCaptured:false` as a blocked result.
4. Re-run only after this source-registration correction. Preserve the first blocked prompt metadata and the quarantine boundary; do not add another GO_FIRST handler. The current run does not reach a prompt, so it neither confirms nor contradicts the post-22:15 GO_FIRST composition correction.

## Conclusion

Run 42422639543 is a useful negative preflight receipt: it proves the fail-closed source-rank gate prevented an unregistered rank-3 trial from reaching Twinleaf. It is not a first-owner-root capture and should not be counted as a successful canary, a native game, or policy evidence. No competitive game or win-rate estimate is produced.


## Source-rank admission is not physical-print certification

One further distinction is necessary before rerunning. `simulation/evaluation/agent25-authenticated-source-admission.cjs` implements `authenticatedSourceRanks(roster, expand)` by checking that a published roster entry has positive card counts summing to 60. With `expand=false`, it returns the historical default `[6, 11]`; with `expand=true`, it discovers all 60-card list entries, including rank 3.

That is a published-source-list completeness gate for simulation. It does not validate Japanese physical card numbers, actual language, event-side physical inventory, or the paper-legal chain. Rank 3's `original-printed60-admission-v1.json` row still has `sourceLegalChain: "unqualified"`. The English-proxy source list can be admitted as a simulation input after the flag correction, while paper print admission remains a separate unresolved status. The artifact and future report should preserve that distinction rather than calling the flag a physical-print certification.
