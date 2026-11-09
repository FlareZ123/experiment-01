# Original rank-6 Iron Thorns fixed-60 architecture screen

**Agent12 | 9 November 2026 | Completed prospective developmental native test, zero competitively qualified games.**

## Decision

The unchanged original Aichi rank-6 Iron Thorns 60 cannot meet the 99.5% objective on a uniformly weighted 32-opponent field under symmetric, equally skilled mirror play. That identical rank-6 60 is an opponent, so a 50% best expected mirror and a hypothetical 100% against all remaining 31 imply a maximum of **98.4375%**. This does not transfer to a modified Thorns candidate.

## Actual 32-game native screen

The [frozen registration](../../aichi-2026/registrations/agent12-thorns-vs-champion-eight-rank-screen-20261109.json) selected source ranks 1, 2, 5, 6, 11, 13, 24, and 31, with both physical seats and 16 independent source-group seeds. The two candidate 60s were the original published rank-1 Shadow Rider champion and original published rank-6 Iron Thorns, unchanged.

**Native successful execution:** [run 42594760636](https://github.com/FlareZ123/experiment-01/actions/runs/42594760636), [full 32-game JSON artifact 13663690394](https://github.com/FlareZ123/experiment-01/actions/runs/42594760636/artifacts/13663690394). Artifact ZIP SHA-256: 68db6738f0e73703e682fd0707c8c144f8830b9cd525a13c01b6b1ac34543927. Pinned Twinleaf revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05, common shared actor policy, three paper-correction hooks, root cap 260. [Reproducible driver](../../../simulation/evaluation/2026-11/agent12-thorns-fixed60-eight-rank-native.cjs) and three passed tests.

| Native outcomes | Rank-1 champion | Rank-6 Iron Thorns |
| --- | ---: | ---: |
| Wins | 6 | 4 |
| Losses | 5 | 3 |
| Censored, no terminal at 260 roots | 5 | 9 |
| Engine errors | 0 | 0 |

Only **5 of 16 opponent-source openings** had a physically matching original-source fingerprint and the same starter seat across candidate decks. Only **one** physically matched pair terminated on both sides, with no winner reversal. Across all five matched groups, the exact no-assumption Iron Thorns minus champion native win-count interval is **[-3,+3]**. The native record cannot rank these lists.

Changing from a 14-Basic champion to a four-Basic Thorns list can change mulligan frequency and opponent bonus-draw sequence; a shared seed alone does not give an identical source physical hand. The source fingerprints establish mismatch but do not isolate each mismatch's cause. The raw actual native wins among 16 per arm have censor-only win-count ranges champion **[6,11]** and Thorns **[4,13]**, with no causal paired claim for the eleven mismatched deals.

## Actual new 60-card counter hypothesis

[Fixed Iron Thorns / Mimikyu Safeguard Pivot v1](../../aichi-2026/candidate-iron-thorns-safeguard-pivot-v1.json) retains all four Thorns and exchanges two Camping Gear plus one Captivating Poké Puff for **Mimikyu PAL 97, Jet Energy PAL 190, Psychic Energy MEE 13**. The specific line is non-Rule-Box Safeguard wall against ex/V attacks; one Psychic and one Colorless enable printed Ghost Eye damage-counter placement; Jet can fund and promote Mimikyu or rescue an Mimikyu-only start.

This is **unproven**: starting Mimikyu can forfeit early Initialization, Mimikyu/Psychic can be Prized, Jet is vulnerable to Special Energy removal, and repeated opponent Energy denial may prevent attacks. The resulting name/count 60 is distinct from all 29 exact published source sixties.

A [second prospective native 48-game variant panel](../../aichi-2026/registrations/agent12-thorns-safeguard-contrast-20261109.json), with extra coverage of all three original Iron Thorns opponents at ranks 6, 24, 29, has been registered separately. The screen is an exploratory architectural decision input, not a full Top 32 comparison or a demonstrated 99.5% record.
