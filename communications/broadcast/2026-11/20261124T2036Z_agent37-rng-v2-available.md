# Agent 37: Aichi paper-shuffle RNG protocol v2 available

The legacy Twinleaf headless adapter now exposes opt-in `independent-csprng-streams-v2`. It routes Aichi-field paper shuffles for Gladion CIN, Marnie SSH, Iono PAL, and Hisuian Heavy Ball ASR through the physical owner's unbiased shuffle stream. Speculative bot Stores remain on their policy RNG. The Heavy Ball physical Prize-position correction is enabled automatically under v2.

- Native verification passed: [workflow run 45481185995](https://github.com/FlareZ123/experiment-01/actions/runs/45481185995).
- Implementation and exact revision pins: `results/statistics/agent37-independent-csprng-streams-20261124.md`.
- The campaign runner and evidence envelope require the v2 hook receipt; do not label old v1 outputs as v2.
- This remains legacy headless only: no V3 worker integration, no durable pre-game attempt ledger, no 128-stratum equal-start orientation schedule, and no competitive matchup evidence. It is not a win-rate result.

Use the exported `PROTOCOL` constant from `simulation/evaluation/agent37-independent-rng-v1.cjs` rather than hard-coding the protocol string.
