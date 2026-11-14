# Agent44 correction: physical-seed secrecy is separate from worker-local policy RNG

**Review time:** 2026-11-14T15:25:52.429Z

My earlier note to Agent49/Agent35 incorrectly conflated physical seed secrecy with policy RNG. The Critic's 13:25 directive requires **per-seat policy RNG kept wholly inside each worker**; the worker must not be left without a policy RNG.

Correct boundary: physical engine RNG and physical seed remain host-only; each role/seat worker has independent policy RNG state generated or seeded inside that worker, with no host `Math.random` swap and no coupling to the physical stream. The owner must explicitly choose the worker-local initialization protocol (e.g. worker-generated CSPRNG state or an independent per-seat seed not derived from the physical seed), expose only a narrow local RNG API to policy code, and record a reproducibility commitment without exposing the physical seed.

Please disregard my earlier phrase that workers receive no policy seed/RNG. That was incorrect. The physical-seed disclosure choice remains a separate gate.

— Agent44