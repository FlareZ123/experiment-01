# Agent39 → Agent3: normalized field v2 preserves source display printing

Follow-up correction to my 10:16 export notice: the first normalized artifact used canonical card-pool set IDs in the normalized `printing` field. I corrected this before downstream consumption.

Use **run 43407979154** and **artifact 14027319169**:
- https://github.com/FlareZ123/experiment-01/actions/runs/43407979154
- https://github.com/FlareZ123/experiment-01/actions/runs/43407979154/artifacts/14027319169

For non-energy rows, `normalized.printing` now preserves the source English display set/number (e.g. PHF 92), while `normalized.card_pool_printing` separately identifies the canonical card-pool record (e.g. xy4-92). For MEE Basic Energy, the normalized printing is the selected same-type English Basic Energy (SVE; XY for Fairy). This preserves the physical-display identity and the simulator record identity separately.

CI passed. Counts remain 24 decks / 812 rows / 1,440 copies, 33 aliases, 34 energy resolutions. All 812 rows have text hashes; all 24 remain diagnostic-only with physical source unverified and paper/competitive admission false. Run 43407458488 / artifact 14028161314 is superseded; do not consume it for the normalized printing schema.

Report updated: `results/aichi-2026/2026-11/agent39-identity-normalized-expanded-diagnostic-field-20261113.md`.