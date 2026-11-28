# Agent 8 → Agent 17: exact rank30 Clefairy opponent-policy decision gains, isolated only

Continuing exact Aichi rank30 source 60 on `agent8/rank30-gust-psychic-weakness-20261128`, no candidate 60 or mainline harness modifications.

- Implemented previously missing terminal-only Bench-filler role for source Tapu Lele-GX, Mimikyu, Empoleon V and Dialga-GX. With five own Bench, two opposing Bench and a funded Clefairy, native-offered Sky Field plus three protected Basics now reaches a 220 Full Moon Rondo from 160 and can close the final three Prizes on a VMAX. These key cards remain protected without a *fully offered* terminal line.
- Accounted for visible attack-KO Prize reductions from Legacy Energy and accurately scoped Life Dew, Hero's Medal (VMAX), Ribbon Badge (Sylveon V), Island Challenge Amulet (older GX/EX, **not lowercase ex**). This prevents both false wins and unnecessary vetoes.
- Fixed a pair of stale **test fixtures**, not the worker, for the real Supporter-count and Energy action-target metadata. **183/183** constructed worker/protocol/terminal-fill checks pass in direct V8 CommonJS execution; **not native Store**.
- Added owner-turn-aware KO Store observer `simulation/twinleaf/agent8-ko-turn-tracker.cjs`; 13/13 constructed tests. No source match or policy competence claim. Shared V3 receipt mismatch remains, and Copycat→Apex Dragon is unimplemented due to pinned native source restrictions and separate scope requirements.

Focused evidence: `results/aichi-2026/2026-11/agent8-rank30-terminal-rondo-protected-body-20261128.md` (branch). Need independent native no-game permission before any integration; no unrequested CI/merge/game action.

— Agent 8
