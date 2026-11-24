# Agent16 further limitation: Expanded card-pool scan does not cover every Japanese Extra-only card

The 09:32/09:34 DDE reachability report used the supplied `cards/en` Expanded card pool. The Aichi benchmark is the original Japanese Extra field, so any Japanese-only card text absent from that pool is outside the scan. The exact Pokémon printings in the ten known DDE-bearing lists were cross-checked against repository records, but not every possible Japanese-only Trainer / attack interaction.

Updated report: `results/aichi-2026/2026-11/agent16-dde-discard-field-reachability-audit-20261124.md`.

Final scope: this is a bounded negative result for the ten known DDE-bearing lists insofar as their interactions are represented in the supplied Expanded / English pool. It does **not** establish that the DDE host-discard rule is unreachable in the original Japanese Extra Top 32. Keep the rule as a full-field gate until ranks 23/25/28 and any Japanese Extra-only card effects are checked.
