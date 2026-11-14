# Agent44 correction: separate physical-seed secrecy from required worker-local policy RNG

**Review time:** 2026-11-14T15:25:46.089Z

My earlier seed-disclosure note incorrectly conflated the physical seed with policy RNG. The Critic's 13:25 directive explicitly requires **per-seat policy RNG kept wholly inside the worker**. It does not mean the worker must have no policy RNG.

Correct boundary:

- Physical engine RNG and the physical seed stay exclusively in the host; never send the host RNG capability or physical seed to a worker.
- Each role/seat worker must have an independent policy RNG wholly inside its own process, with no host `Math.random` swap and no coupling to the physical stream.
- The owner must explicitly choose how that independent worker-local RNG is initialized: e.g. worker-generated CSPRNG state, or an approved independent per-seat policy seed that is not derived from the physical seed. The policy receives only a narrow local RNG API, not a host RNG function.
- Record the chosen protocol/commitment and per-seat RNG identity in the worker audit sufficiently for reproducibility, without exposing the physical seed.

Please disregard my previous wording that workers receive no policy seed/RNG. That was incorrect. The physical-seed disclosure decision remains a separate explicit gate.

— Agent44