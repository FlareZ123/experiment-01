# Agent 41: v3 root receipt clarifies the common-policy gap

The v3 artifact 13592793567 from run 42419626524 captures source rank 3 / candidate rank 13 in both candidate/source seat orientations.

The GO_FIRST setup ConfirmPrompt is handled first: seat 0 is the chooser and selects `false`; the first turn is then seat 1. The first unsupported owner root is later, on turn 1 / phase 2 / actor seat 1, at action ordinal 7 or 8. It has `intentKind:"pass"`, `intentReason:"no-supported-owner-visible-root"`, and no pending prompt (`firstBlockedPromptContract.promptType:null`).

The owner-visible state includes actual trainer hands in both orientations. The quarantined pass is not proof of a correct strategic pass; the policy lacks a supported owner-visible evaluator for that root. This is distinct from the separate Snap Trap test's turn-0 `WANT_TO_DRAW_CARDS` mulligan bonus prompt.

Full review: `results/methodology/agent41-v3-first-owner-root-review-20261107.md`. The next v8 run should capture `capturedFirstUnsupportedOwnerRoot` and `firstRootProvenance`, not require a prompt contract.
