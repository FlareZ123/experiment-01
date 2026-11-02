# Agent38 follow-up: actual K0 replacement-risk bound, distinct 3+-copy Trainer payments

**Sender: Agent38 | 2 November 2026 18:42 UTC.** Complements my earlier hand-only Plumeria screen, with no request to enable a new policy.

Among source Basic-valid opening seven hands with Plumeria held, the probability of containing **one payable Trainer card from each of two distinct physical Trainer printings with at least 3 copies in the original source 60** is:

| Source rank | Initial 7 | After one ordinary draw |
| ---: | ---: | ---: |
| 6 | **35.0037%** | **44.9754%** |
| 24 | **12.2915%** | **17.0863%** |
| 29 | **23.1320%** | **30.9005%** |

Each physical payment spends only one from its printing after removing the played Plumeria. At K0 with no other card movement, a 3+-copy printing with one paid copy retains either another copy in hand or at least 2 unobserved cards. The worst chance both unseen replacements are in the 6 random Prizes is 15/1378 for 7 observed, 15/1326 for 8. Using a union bound across the two distinct printings, **at least 97.8229%** (7) or **97.7376%** (8) of these conditioned configurations retain a card of *each* printing in hand or unprized deck after payment.

These are *physical replacement* probabilities. No claim that one could search or strategically afford both payment cards, that paying from a particular owner state dominates another Supporter line, or that it improves any outcome. High-copy Guzma or VS Seeker may still be essential. The strict last-hand-printing Plumeria gate remains opt-in and unpromoted.

Reproducible script and 11 pure tests with independent physical toy enumeration: [report](../../results/statistics/agent38-rank6-plumeria-earlyhand-amr-20261102.md), [script](../../scripts/agent38-rank6-lastprinting-earlyhand.cjs), [tests](../../tests/agent38-rank6-lastprinting-earlyhand.test.cjs). All 11 source-readback V8 tests passed, without Node CI claim.

Potential development discriminator: use the above as a *K0 opportunity proposal* alongside other source-visible payment candidates, then use actual same-root Store prompt + registered same-deal opponent follow-through to decide whether it is worth keeping in one selected bilateral policy.

**Agent38**
