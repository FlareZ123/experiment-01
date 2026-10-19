# Rank-2 Vileplume/Stoutland: exact one-slot Prize sensitivity

**Agent 29, 19 October 2026 UTC.** Independent exact combinatorial extension of [Agent 30's rank-2 dual-lock census](rank2-stoutland-vileplume-initial-prize-ceiling.md), tied to the immutable [published rank-2 Aichi source 60](full-decklists.json). Evidence class: necessary physical card availability, **zero gameplay tests or qualified wins**.

## Question and controlled comparison

The rank-2 runner-up list uses two printed **Oddish UNB**, two **Gloom UNB**, two Item-locking **Vileplume AOR**, two **Lillipup CEC**, two **Herdier SUM**, and only **one Supporter-locking Stoutland BCR**. There are **14 printed Basic Pokémon**, four among the named necessary roles and ten outside them. The AOR Vileplume and BCR Stoutland are distinct Stage-2 chains; Vileplume-GX in the source is **not** interchangeable with the AOR Item-lock role.

I compared the original exact role counts with **six hypothetical alternatives**, each adding one copy of *one* necessary role and displacing an unspecified other **non-Basic** card from the 60. Every other Basic and necessary-role count remains fixed. Adding Oddish or Lillipup therefore increases total Basic count from 14 to 15; adding Stage 1 or Stage 2 leaves it at 14. This does not select a responsible card to cut, establish a legal finished 60, or model that lost card's strategic value.

The experiment enumerates every six-card Prize composition from the 60 and weights it by the number of valid initial seven-card hands from the **remaining 54**, requiring at least one Basic. A chain is *physically available without recovering any Prize card* only when at least one copy of every printed role in that chain remains outside Prizes. Combinatorial calculations use BigInt counts and exact reduced fractions.

## Exact conditional results

| Composition | Both separate Stage-2 chains physically available, given Basic-valid opening | Absolute increase over published 60 |
| --- | ---: | ---: |
| Published rank 2: 2-2-2 Vileplume, 2-2-1 Stoutland | **86.06286796%** | Baseline |
| +1 Oddish | 86.75516179% | +0.69229383 pp |
| +1 Gloom | 86.79389805% | +0.73103009 pp |
| +1 Vileplume AOR | 86.79389805% | +0.73103009 pp |
| +1 Lillipup | 86.75516179% | +0.69229383 pp |
| +1 Herdier | 86.79389805% | +0.73103009 pp |
| **+1 Stoutland BCR** | **94.99447007%** | **+8.93160211 pp** |

The source probability is the exact rational **68469698109287/79557769491200**, independently equal to the existing source-rank-2 exact model. With another Stoutland and one unspecified off-role non-Basic displaced, the joint availability is **226726444592383/238673308473600**. The stage-1/stage-2 symmetrical additions share the same conditional probability, while the stage-0 Basic additions also change legal-seven weighting.

For one Stoutland, **10.06467208%** of Basic-valid initial configurations have that sole copy Prized. For a hypothetical two-copy Stoutland line, **0.858418997%** have *both* Prized. This large reduction in immediate physical Supporter-lock inaccessibility is the source of the approximately 8.93-percentage-point joint gain. It is a necessary-resource effect, not a measured success rate for establishing Item/Supporter lock in time.

## The crucial recovery caveat and decision

The source 60 contains **Gladion**, **Peonia** and multiple access/connective resources. In particular, a singleton Stoutland that is Prized can sometimes be retrieved with an available Gladion, subject to discovering and playing that Supporter in time. Among Basic-valid openings, the joint probability of two specified non-Basic singleton cards (such as **Stoutland and Gladion**) *both* occupying Prizes is **0.858418997%**. Therefore, conditional on Stoutland being Prized, its one-copy Gladion rescuer is **not Prized in approximately 91.470969%** of those initial configurations. This does **not** guarantee Gladion is in hand, that it is searchable before the lock window closes, or that spending the turn's Supporter on it can be afforded. Peonia provides a further, position-uncertain route.

The extra Stoutland's *paper availability advantage* is therefore largely a **turn/connector/recovery opportunity-cost question**, rather than an already proven source-game failure avoided. Replacing a card that enables the Bunnelby Omega Barrage → double TM Evolution opener or long-game recursion could outweigh that advantage. Without an explicit legal card removal, adversarial early opposing decisions, authentic Prize-recovery policy and both-start games, **retain the authentic rank-2 60 and make no candidate promotion**.

**Concrete test hypothesis:** in prospectively or independently held-out rank-2-source games, stratify *observed* initial configurations by Stoutland Prized/unprized. Measure how often the source correctly obtains and spends Gladion/Peonia under Supporter contention, whether it establishes Stoutland Supporter lock before opposing attack/escape, and whether the opponent has a live response. A future explicit second-Stoutland candidate must preserve a fixed genuine 60 with a named cut and be evaluated against at least rank-6 and rank-11 locks using the same frozen, owner-information-safe two-sided policy. Conditional selected hands are only diagnostic; retain all failed opportunities and do not treat such hand-selected samples as win-rate data.

## Reproducibility and fidelity boundaries

- Exact implementation: [scripts/aichi-rank2-one-slot-lock-sensitivity.cjs](../../scripts/aichi-rank2-one-slot-lock-sensitivity.cjs), source-bound to the published rank-2 printing IDs and 14 Basics.
- Independent original-census agreement, six one-slot mutations, BigInt conservation and no-win qualification assertions: [tests/aichi-rank2-one-slot-lock-sensitivity.test.cjs](../../tests/aichi-rank2-one-slot-lock-sensitivity.test.cjs).
- **Compiled Node 22 manual CI passed:** [GitHub Actions run 39212061518](https://github.com/FlareZ123/experiment-01/actions/runs/39212061518), head commit \`395725b2efdd7e49640b58663fd91c3b2a878f79\`.
- Original six-Prize / Basic-valid model: [rank-2 Stage-2 feasibility study](rank2-stoutland-vileplume-initial-prize-ceiling.md). A broader source strategy requires board, Bench, Energy, Supporter and Prize-rescue state beyond these six roles.

**Field qualification unchanged:** 29/32 exact opponent 60s, zero competitively qualified games, no demonstrated single-deck 99.5% win rate.
