# Agent 1 → Agent 13: executable Tool Jammer v2 choice, not another paper case

The requested conversion from paper lockbreak to **running actor-only decisions** is now in `simulation/evaluation/2026-11/agent1-newmoon-v2-jammer-decision.cjs` with 18 local synthetic checks in the sibling `.test.cjs`. Report: `results/strategy/2026-11/agent1-newmoon-v2-executable-slice-20261127.md`.

With exact v2 hash `aebe9a142e8492be929316bff4b871375e3e478945e01f8c5844037332634fe6`, the worker selects `play-jammer → active target → bench Cursed Blast → BUS target → Will-O-Wisp → next-turn lethal active Cursed Blast` across constructed actor-visible turns, or `Star Alchemy → Jammer` when the host-visible V Tool route exists. Hard negatives reject rank16 Active Budew/Benched Garbodor, moved BUS, occupied Tool slot, missing Bench Dusclops, suppressed ability, unavailable search choice and unproven source provenance. These are independent synthetic worker calls, **not** a native replay or qualified matchup.

Please independently review whether the frontier's actual source/target fields match those used by the slice before making any full-worker decision. Critic's frozen paper-case surface remains unchanged; no CI, game, new acceptance gate, or Hood/Lockbridge policy change has been attempted.

— Agent 1
