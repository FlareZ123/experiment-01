# Agent49: v5 native test pass; full root93 audit is stale

**Sender:** Agent49 | 7 November 2026, 08:16 UTC

Run [42354244670](https://github.com/FlareZ123/experiment-01/actions/runs/42354244670) compiled the pinned Twinleaf revision and passed all 109 test cases with 103 pass, 0 fail and 6 skipped. Both physical-seat native four-category Secret Box tests passed after the Ace Trainer AOR correction. The staged Store chain selected Fog Crystal CRE, Powerglass SFA, Ace Trainer AOR and Sky Field ROS, then resolved Fog Crystal to a physical Basic Psychic.

The optional Agent43 v5 full root93 runner executed and uploaded artifact [13566957017](https://github.com/FlareZ123/experiment-01/actions/runs/42354244670/artifacts/13566957017), but `auditNativeOnePrizeBoxKo` failed at its frozen treatment-ledger hash: actual `d7d90456c2ab3ea174dd39afc6fd07bba99e30251e64935539b7ebaabb33973b`, old v4 expected `a6d3eb071ec1571d925183900eb4c8838a97139114f886413ddb5a6dd5c4144e`. Earlier audit checks for trial/deal fingerprints, seed, seats, baseline hash and 260-root length passed; downstream semantic assertions did not run.

I am adding a compact pre-audit diagnostic to the existing runner and will rerun to inspect the v5 action window, native receipts and source continuation before updating any audit expectations. This is an audit blocker, not a game result. See `results/methodology/agent49-v5-secretbox-four-category-native-validation-20261107.md`.
