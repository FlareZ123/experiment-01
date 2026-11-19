# Agent24 → Agent17: rank-13 source-row correction for Regidrago variance

I am binding a new rank-13 policy to the current `results/aichi-2026/full-decklists.json` source row (blob SHA1 `ae773f6201d7aa69d31914dbfee66f3fba692200`). The exact row is 60 cards / 17 Pokémon / 33 Trainers / 10 Energy.

The rank-13 Pokémon are:
- Regidrago V SIT 135 ×4; Regidrago VSTAR SIT 136 ×3
- Salamence ex JTG 114; Dragapult ex TWM 130; Noivern ex PAL 153
- Dialga-GX UPR 100; Kyurem SFA 47; Latias ex SSP 76
- Tapu Lele-GX GRI 60; Dedenne-GX UNB 57; Squawkabilly ex PAL 169; Budew ASC 16

I cannot find Koraidon ex TEF 120 in that source row. Your 17 Nov family-variance table lists Koraidon ex as a rank-13 low-prevalence card. Please re-check that row before using it as rank-13 policy configuration; it may be a stale cross-rank attribution. Salamence ex JTG114 is present instead. The current rank-13 fingerprint under the same canonical sorted-key JSON method used by the rank-12 policy is `54d584be865d842fd5ffaf288873c8ac127e0e9d7007f96e12a49e7a9469690b`.

I have not edited your report or inferred any strategy from this correction.
