# Temple owner pilot: real plays, negative matched tournament-source signal

**Agent12 | 9 November 2026 | Complete, prospectively frozen before native games.**

## Decision

**Do not promote the one-Temple, one-Mimikyu, one-Basic-Psychic fixed60 v2.** The initial shared actor left Temple a dead card (zero actual plays in the first 24-game v2 screen). An independently registered, unchanged-card comparison with a narrow, explicit native owner policy successfully made Temple actionable, but v2 then underperformed the otherwise identical v1 Safeguard Pivot under the same owner policy. The outcome is an operational *developmental reject* of the tested card swap/policy combination, not proof that every Temple configuration is weak.

## Frozen experiment and actual results

[Registration](../../aichi-2026/registrations/agent12-temple-owner-holdout-native-20261109.json) frozen 24 fresh original Aichi rank/seat/seed source groups before any native game, with three seat-balanced repeats of each original rank6/24/29 Thorns opponent and one repeat of ranks1/5/13. Candidate v1 and v2 each unchanged 60s; both received exactly the same actor-owned Psychic→Jet→Temple option (v1 has no Temple to play). The actual pinned Twinleaf root limit was raised from 260 to **360** with explicit registered cap authorization.

[GitHub Actions successful run 42599445057](https://github.com/FlareZ123/experiment-01/actions/runs/42599445057) compiled pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, passed four public-only policy tests, executed all 48 native games, and archived every source-seed/seat/Store-root row in [artifact 13665332186](https://github.com/FlareZ123/experiment-01/actions/runs/42599445057/artifacts/13665332186). The driver is [CommonJS](../../../simulation/evaluation/2026-11/agent12-temple-owner-pilot-native.cjs); policy [here](../../../simulation/twinleaf/2026-11/agent12-thorns-mimikyu-temple-owner.cjs).

| Native result | Mimikyu Safeguard v1, no Temple | Mimikyu Temple v2 |
| --- | ---: | ---: |
| Wins | **16** | 11 |
| Losses | 7 | 12 |
| Engine errors | 1 | 1 |
| Unresolved at 360-root cap | 0 | 0 |
| Actual Temple PlayCard roots | 0 | **5** |
| Actual declared and settled Ghost Eye | **53** | 20 |
| Own Volt Cyclone declarations | 24 | 43 |
| Source Volt Cyclone declarations | 43 | 34 |

Actual Temple roots were **one against original rank6, four against rank29, zero against rank24**. Opponent source Pass roots after the first native Temple play totaled 59 across the v2 games. These Passes cannot by themselves be counted as legally prevented Volt Cyclone attacks, as the opponent might have lacked Energy or deliberately chosen another line.

**Physical matched-pair evidence:** 14/24 original source deals shared the same authenticated opening fingerprint and first player across both contenders. Thirteen of those pairs were double-terminal, with one unresolved native engine-error endpoint. The precise no-assumption **Temple-v2 minus Safeguard-v1 win-count range was [-4,-2]**, including the unresolved pair. The 24-game unpaired raw win totals favor v1 by five, but the matched negative interval is the more defensible development result.

Native original opponent rank breakdown: in six games each against rank6, v1 won 3 and v2 4; against rank24, v1 won 4 and v2 3 (one error per arm); against rank29, v1 won 4 and v2 2. Across the three original Thorns ranks together, the raw totals v1 11 wins vs v2 9, before restricting to physically matched deals. The negative paired interval also incorporates ranks1,5,13. Therefore avoid claiming Temple loses each individual Thorns mirror.

## Causal constraints and design consequence

The executable policy makes the Temple counterline available but does not fully solve sequencing or opponent competence. Its intended public-only steps are: attach held Basic Psychic to Benched Mimikyu, attach held Jet to switch that funded Mimikyu Active while Jet's switching effect still works, then play held Temple if the opponent's Active Iron Thorns has Special Energy attached. Store accepts the actual five Temple plays.

Temple simultaneously makes **our own original four Iron Thorns ex unable to pay the Lightning symbol in Volt Cyclone** using only our Special Energy. v2 has one Basic Psychic, which pays Mimikyu's Ghost Eye but does not pay Thorns' Lightning. Its only one Temple can also be overwritten by the opponent's multiple Stadiums. The execution evidence shows fewer Ghost Eyes and worse matched results under this shared pilot, so changing the original Stadium slot is premature.

There is a fundamental pre-setup fragility in this triple-singleton architecture: when Mimikyu, Basic Psychic and Temple each have only one copy, **27.5161%** of uniform six-Prize configurations contain at least one of those three required pieces. A retrieval chain can recover it later but cannot eliminate early tempo cost, and the deck also has a singleton Gladion that could be Prized. The v1 two-singleton Mimikyu plus Basic Psychic line has a corresponding **19.1525%** chance of at least one such card Prized. These are direct hypergeometric arithmetic, conditional only on the six random Prize identities; actual card access and recovery must be modeled separately.

**Next substantive avenue:** restructure the better-performing v1 around improved access to Mimikyu and Basic Psychic while preserving the original Thorns control ALS and testing against all three Thorns mirrors and Mew/Shadow Rider; consider multiple non-Rule-Box attackers and energy/recovery redundancy, rather than further cosmetic Temple swaps. Do not claim the game-winner target from these developmental datasets.

Qualified competitive paper games **0**; exact authenticated opponents **29/32** (ranks23,25,28 unverified); no demonstrated 99.5%.
