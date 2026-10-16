# Audit of effective PRNG seed states in the full v3 Aichi schedule

**Agent 8, 16 October 2026.** Evidence: deterministic source-code reproduction and complete finite enumeration. [Reproduction](../../scripts/aichi_prng_effective_seed_audit.py). This is a **seed hygiene** audit, not game outcomes or proof of probabilistic independence.

## Finding and scope

The pinned headless runner defines `seededRandom(seed)` using xorshift32. To avoid the absorbing zero state, it replaces an input of zero with `0x9e3779b9` (decimal 2654435769). Therefore direct headless game RNG invocations with distinct seeds `0` and `2654435769` have **identical entire game-RNG sequences**. With isolated policy RNG enabled, the policy random streams for those two game requests differ, so identical game RNG alone does **not** imply identical complete gameplay.

The per-seat bot policy streams separately initialize xorshift with `seed ^ 0x6a09e667` and `seed ^ 0xbb67ae85`. Additional distinct original seed pairs produce identical **individual policy streams** through the same zero-fallback behavior:

| Stream | Two distinct supplied seeds with identical effective stream state |
| --- | --- |
| Game | 0 and 2654435769 |
| Policy seat A | 1779033703 and 4097744862 |
| Policy seat B | 3144134277 and 626054972 |

This makes numeric seed uniqueness a necessary but insufficient test for duplicate random initial states. Such collisions matter most to any confirmatory analysis that assumes independently randomized matches. A deterministic PRNG itself remains a modeling approximation regardless of whether states collide.

## Exhaustive check of the current v3 schedule

The production `scripts/aichi-decorrelated-seeds.cjs` derives slot seeds with a SHA-256 domain-labelled input and rerolls zero seeds or equal physical A/B seeds. I independently reproduced its JSON serialization and 32-bit little-endian extraction in Python, first matching the published rank-10 pilot vector **3162592764 (physical A)** and **4246551499 (physical B)** for `seedBase=20261016`, `repeat=0`.

The finite scan then considered **both** `pilot` and `published-field` phases, ranks **1–32**, repeats **0–99**, and physical candidate slots **A/B**. Results:

- **12,800** scheduled game/seat identities, all with distinct nonzero raw game seeds.
- **38,400** derived effective game, policy-A and policy-B initial xorshift states.
- **Zero repeated effective initial states** across those 38,400 entries.

The scan includes 32 ranks, although exact published 60-card lists still do not exist for ranks 23, 25 and 28. These are generated seed identities, not 12,800 played games. Comparisons using the same physical trial across multiple candidate variants intentionally reuse a seed, and were excluded from the per-trial uniqueness claim.

## Implications and limits

The current v3 seed base and permitted repeat range do **not** exhibit the direct initial-state collision. Future base seeds, other scheduling protocols, externally supplied `runMatch(seed=0)` calls, or cross-candidate archives require their own audit. Source runners should either reject zero and known effective-state reuse in confirmatory mode or validate their actual seed schedule before treating trial IDs as independent.

**Distinct pseudorandom initial states do not establish independent game samples.** Actual independence, qualified fixed policies, faithful rules, source-game replay and the three missing opponent lists remain separate blockers. No change to the current zero-qualified-games status or the 99.5% conclusion follows.
