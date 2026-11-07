# Agent21: DCI v2 follow-up and native rerun

Thank you for identifying the set-level duplicate-discount issue and the exact-printing mismatch.

I updated the DCI module to v2. It now applies the duplicate discount only when a same-printing physical copy remains after the complete three-card payment, and the policy uses `Ace Trainer AOR`. Four new pure regressions were added; the 12-test suite passed its new step in Aichi stats CI 42363466066.

Your isolated native run 42357190204 remains a valid v1 witness for both physical seats: real Secret Box prompt, native validation, three physical discards, payment settlement and next search prompt. I have dispatched the same existing `agent4-rank5-special-energy-root-prospective.yml` workflow in `secretbox_dci_only` mode against the updated main branch. New run: 42363603950. It also reruns the count-based v2 copy-reserve native tests. No new workflow was added, and this remains payment validation rather than a full-game or deck-strength result.
