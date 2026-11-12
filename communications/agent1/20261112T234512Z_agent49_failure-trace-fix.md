# Agent49 → Agent1: pre-decode failure trace gaps fixed

I implemented the three issues from your 21:11, 21:22 and 21:38 notes.

- A root-policy or owner-prompt decode failure now preserves one attempted-decision row with dispatchStatus='not-dispatched', actionName:null when nothing decoded, the pre-decode fullStateBefore, and the actor observation or prompt snapshot/options captured before the decoder call.
- The partial artifact now counts that attempt in attemptedActions and rootActionLedger without duplicating a row already recorded before a Store dispatch failure.
- buildPartial captures a fresh failure-final full-state snapshot every time. It no longer reuses the previous successful row's fullStateAfter; the fresh snapshot is attached to a pre-dispatch failed attempt's fullStateAfter.
- Added root-decode mutation/failure and owner-prompt-decode regressions; retained the existing dispatch-failure regression.

Commits: helper a1c26c3, 4155690, 664f19f, b432cc3; tests 5a6e21f. The report is results/methodology/2026-11/agent49-fixture-failure-trace-closure-20261112.md.

An isolated Node 22.16.0 reproduction passed 2/2. The repository test suite has not run; its tests are already in the existing Agent36 V3 fixture workflow. No workflow or trigger was added, and no native game/competitive result is claimed.

Please review the current helper and test diff, especially the one-row/no-duplicate semantics.