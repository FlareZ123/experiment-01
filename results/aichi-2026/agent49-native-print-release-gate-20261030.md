# Native printed-card and required-fixture release gate (Agent 49, 30 October 2026)

## Problem and intervention

A completed green CI job is not proof that a native test executed, settled a printed effect, or demonstrated a competitive game. The 30 October Critic [release veto](../../communications/broadcast/20261030T2053Z_critic_green_ci_native_print_skip_release_veto.md) identified the rank-15 Buneary / Mega Lopunny printed-card test as a regression case in which required printings were reportedly unavailable during prior pinned Store tests. The upstream test has since changed its behavior; this report makes **no claim** that the current pinned fixture still skips.

Added the pure, versioned, fail-closed [release checker](../../simulation/evaluation/agent49-native-print-release-gate.cjs), with [eight independent synthetic Node tests](../../tests/agent49-native-print-release-gate.test.cjs).

The checker joins canonical original printed 60s to the existing `reportCoverage(manifest)` result, then to actual `planAichi` resolved opponent rows. It emits **all 32 placements**, including explicit `MISSING_ORIGINAL_60` rows, full printed-card identifier statuses, modification records, and `PAPER_EQUIVALENCE_UNVERIFIED` even when a native identifier exists.

A separate required-fixture gate distinguishes **REQUIRED_TEST_MISSING**, **TEST_SKIPPED_UNSUPPORTED_PRINT**, **TEST_FAILED**, **NATIVE_EFFECT_NOT_SETTLED**, **NO_BILATERAL_FOLLOWTHROUGH**, **PAPER_EQUIVALENCE_UNVERIFIED**, and **REQUIRED_NATIVE_WITNESS_COMPLETE**. It requires a nonempty preregistered required-fixture list. Native acceptance alone never passes it. The combined release gate requires all 32 original lists, exact native IDs, an attested unchanged native candidate 60, all required native effect/reply/printing witnesses, an identical two-seat owner-information-safe frozen policy, and paper-event clock qualification.

**Tests:** eight of eight pure Node tests passed locally, including a simulated rank-15 skipped fixture that remains rejected even if CI completed. Tests use miniature constructed data, not native game states. New test command was appended to the existing **manual-only** `.github/workflows/aichi-benchmark-stats.yml`, with no on-push workflow.

**Manual CI:** [run 41128218282](https://github.com/FlareZ123/experiment-01/actions/runs/41128218282) was dispatched at repository head `e4c970f`; inspect the final result before claiming compiled-platform success.

## Explicit limitations

The new module is a release/audit boundary, **not a repaired actor chooser**, and is not yet wired into Agent 41's canonical match runner. Its caller must supply real pinned CardManager coverage, original field identity, native Store fixture outcomes, and reviewable evidence artifacts. Claimed native/paper flags must be independently verified against those artifacts; the checker itself does not prove real-world game-rule equivalence. No actual native rank-15 card attack was executed in this contribution. No win rate or fixed-deck tournament strength is inferred.

The current field remains **29/32 original exact 60-card lists** (ranks 23, 25, 28 missing), **zero competitive-qualified games**, and **no demonstrated 99.5% field win rate**.

## Integration next step

The canonical integration owner can attach a release packet after an actual pinned Store run using `auditSourcePrintings(sourceManifest, reportCoverage(sourceManifest), planAichi(...))` inputs and a frozen required native-fixture list. Preserve all skipped and unexecuted tests as machine-readable negative cells. A future integrated release must independently supply actual owner-root and prompt ledgers, action acceptance, settled effects, later own-root continuation, and opponent response. Do not infer those fields from a green workflow status.
