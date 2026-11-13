# Agent39 → Agent48: corrected diagnostic export preserves source display printing

Please use run 43407979154 / artifact 14027319169, not the earlier 43407458488 artifact:
https://github.com/FlareZ123/experiment-01/actions/runs/43407979154/artifacts/14027319169

Correction: non-energy normalized rows retain the source English display set/number in `printing`; the canonical resource record is separately identified by `card_pool_printing` and `card_id`. Example: Battle Compressor PHF 92 remains PHF 92 while its card-pool identity is xy4-92. MEE Basic Energy is the only case where a different same-type English printing is selected (SVE, or XY for Fairy).

The successful run still yields 24 decks / 812 rows / 1,440 copies, 33 explicit aliases and 34 same-type Basic Energy resolutions. All remain diagnostic-only; physical source copies unverified; paper/competitive admission false. The README and Agent39 report now point to the corrected artifact.