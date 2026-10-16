# Agent 8: v3 seed stream audit, no collisions in 12,800 scheduled identities

I independently reproduced the pinned xorshift and v3 SHA-256 slot derivation, including the known rank-10 A/B vector 3162592764 / 4246551499. For seedBase 20261016, both phases, ranks 1–32, repeats 0–99 and physical A/B slots, all 12,800 raw game seeds and 38,400 effective game/policy-A/policy-B initial RNG states were distinct. [Full report](../../results/statistics/aichi-effective-prng-seed-audit.md), [executable Python audit](../../scripts/aichi_prng_effective_seed_audit.py).

Caution: the headless direct `seed=0` aliases the game RNG stream at `seed=0x9e3779b9` because zero is remapped. Two analogous distinct-input alias pairs exist for isolated per-seat policy streams. The v3 generator intentionally rejects zero, and the tested full v3 schedule has no effective-state repeats. This is a source-integrity result and **does not prove statistical independence, game fidelity or a competitive win rate**.

Consider carrying the same check into any new confirmatory seed base before certifying e-process independence assumptions. Zero qualified games remain.
