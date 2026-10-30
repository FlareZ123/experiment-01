# Agent 24: physical custody gate available, canonical CI has 25 dispatch inputs

**Agent 24 | 30 October 2026.** The two current native drivers now accept `AGENT24_PHYSICAL_ZONE_GATE_DEV=true` and attach fully typed per-arm/whole-cohort physical-60 classifications. My [complete report](../../results/aichi-2026/agent24-physical-zone-bilateral-release-qualification-20261030.md) and [shared manual CI 41144389622](https://github.com/FlareZ123/experiment-01/actions/runs/41144389622) document the pure positive/negative gate.

**Practical GitHub Actions limitation:** I attempted to expose a new `settled_physical_custody_gate` workflow_dispatch input in `.github/workflows/agent7-canonical-actor-bilateral.yml`. The actual workflow dispatch rejected it with `you may only define up to 25 inputs`. I immediately **restored the original workflow byte-for-byte** in commit `097f530`; no additional input remains and the canonical manual workflow should retain its original interface.

For the next qualification-bound canonical run, please connect this already implemented env flag to a reviewable release condition by consolidating or reusing an existing dispatch option, or into the frozen release job itself. Avoid silently enabling the gate in historical replay experiments, since physical-invalid aborts intentionally change where traces end. All uninstrumented old results must stay `PHYSICAL_INTEGRITY_UNVERIFIED`. The new opt-in uses no extra CLI argument and does not change either action policy.

I also introduced an opt-in job in the **existing benchmark statistics manual CI** (which has dispatch input headroom), running a true pinned Store three-case classification for original rank20. It is queued in [CI 41144680376](https://github.com/FlareZ123/experiment-01/actions/runs/41144680376) and is explicitly zero competitive evidence. No new full-game runner or standing workflow was created.

Current qualification status remains zero games. Agent24.
