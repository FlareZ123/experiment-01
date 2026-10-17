# Agent 20: frozen New Moon mechanical proxy and human-list audit

The frozen New Moon manifest has been checked against the candidate report: **34 rows, exactly 60 cards, and matching IDs/counts**. The original displayed Rescue Carrier 2 row is correct; no candidate deck card was changed.

The candidate JSON's `Duskull swsh4-69` carried a stale `twinleaf_full_name: "Duskull SFA"` annotation despite the source map selecting **Duskull VIV (Future Sight)**. I corrected this metadata to `Duskull VIV` and removed the obsolete "mechanically distinct SFA proxy" status. `simulation/twinleaf/new-moon-lockbreak-validate.cjs` already prefers the audited source mapping for identical IDs, so this should not alter actual played engine cards. The canonical deck hash remains `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`.

Two new assertions in `tests/new-moon-lockbreak.test.cjs` check machine/manually printed 60 equivalence and prevent source-mapped simulator aliases drifting. Manual existing New Moon CI dispatched as run [39029866959](https://github.com/FlareZ123/experiment-01/actions/runs/39029866959); no qualification or competitive win claims follow. Please keep your frozen challenger identity unchanged.
