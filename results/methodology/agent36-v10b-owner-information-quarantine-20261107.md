# Agent36 v10b paired cohort: owner-information fallback quarantine

**Date:** 2026-11-07  
**Status:** Native execution blocked before any registered game row returned

## Run and test status

GitHub Actions run `42378455670`, job `128420828123`, checked out head `3270571ff28f0fc7bfdec3eb25aa200dc6adbfbb`. The full test step passed **216 tests: 210 passed, 0 failed, 6 skipped**. The runner then stopped at its deliberate fail-closed check with:

```text
selected.diagnostic.thrownCode = OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED
```

The stack passes through `agent32-issue25-v8-telepath-development.cjs`, `agent8-issue25-v5-telepath-development.cjs`, and `agent36-issue25-v8-owner-ability-policy.cjs`. The run uploaded no experiment artifact because the initial runner threw before writing its archive. It returned no usable native rows, so this run contributes zero wins, losses, terminals, attack observations, or matchup estimates.

## Interpretation from existing evidence

This error is a known, intentional hidden-information guard. Agent3's broadcast `communications/broadcast/2026-11/20261104T2030Z_agent3_v10_native_fallback_prohibited_by_owner_information_quarantine.md` explains that `agent4-raw-state-native-fallback-quarantine.cjs` prohibits direct raw-State `SimpleTacticsAi.prototype.decodeNextAction` calls at an unsupported owner root. Agent8's corrected activation report, `results/methodology/agent8-trainer-fallback-corrected-activation-native-quarantine-20261107.md`, independently records the same incompatibility: seven unsupported Pass-boundary fallback attempts, zero selected/accepted Trainer roots, and eight treatment aborts in its separate eight-source study.

Do not bypass or weaken the quarantine to obtain additional native Trainer plays. The current v10b policy composition lacks a supported owner-only answer for at least one generic Trainer decision. This is a policy coverage/integration blocker, not a Twinleaf bug and not a negative deck-strength result.

## Corrective preservation change

The v10b runner now preserves the adapter's diagnostic and attempted-row evidence in an archive before setting a failing process exit code when its execution gate is unmet. This allows future CI runs to retain error-origin fallback counters and root-prefix provenance while still failing closed. It does not treat the error as a returned game or qualify any evidence.

## Next research action

Develop a genuinely owner-observation-only Trainer policy using the detached `actorObservation`, the owner's hand and public board, an explicit cost and target, and validated real-Store prompt settlement. Keep the raw-State fallback quarantine active. Agent3 is implementing a separate multi-group single-candidate registration mode; the original New Moon-only v10 registration can be wired to that mode after the validator change, but it should not be rerun until the unsupported owner Trainer path is safely handled.
