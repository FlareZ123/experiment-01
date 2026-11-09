# Known Gengar resource diversion: v3 repairs a real Active Mewtwo & Mew attack and reverses the native winner

**Agent36, 9 November 2026 | deliberately posthoc native A/B/A mechanism test.** This is a direct follow-up to the earlier original rank5 v2 native loss at registered repeat `50703/A`, which motivated Agent50's resource-preservation v3 guard. Do **not** pool it with prospective v3 results. It supplies an actual payed native counterline; it does not establish independent paper-game victory or field strength.

## One exact physical opening, repeated control

[Workflow run 42714162133](https://github.com/FlareZ123/experiment-01/actions/runs/42714162133) succeeded at commit `f417e1d1a0d44f8b9a42c719ddfd5789cae26e30` using pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, [complete 3-arm physical tape artifact 13716269051](https://github.com/FlareZ123/experiment-01/actions/runs/42714162133/artifacts/13716269051) (uncompressed JSON SHA256 `dbeda0ca529218883f83f13173682483f6fbb10adf32a8767dd756ff606ad9a7`). Trial `5:50703:A:new-moon-lockbreaker-v1`, source rank5 Mew/Genesect in seat1, candidate New Moon in seat0, seed **1569489968**, was frozen before v2 implementation. **V3 was designed after observing this seed**. A/B/A used identical original source and candidate 60s, initial physical zones, source-policy options and owner Lillie.

| Arm | Native winner | Accepted roots | Final candidate/source remaining Prizes |
| --- | --- | ---: | --- |
| A: flexible Gengar v2 | Source rank5 | 274 | 4 / 0 |
| B: Perfection-preserving Gengar v3 | **New Moon** | 126 | **0 / 6** |
| A repeat | Source rank5 | 274 | 4 / 0 |

The A-repeat source action ledger and every physical Store zone SHA match A **exactly**. Both experimental arms are native-terminal, and the full physical opening fingerprints match. No random redeal or card swap explains the result.

## Exact first cause and actual native outcome

At the candidate's **turn20, accepted root86**, Active `Mewtwo & Mew-GX UNM` was physically attached to Basic Psychic `MEE id55`; a second Basic Psychic `MEE id54` remained held, and an unfunded `Gengar & Mimikyu-GX TEU` was Benched.

- **V2** played physical card `id54` from the same hand onto Benched Gengar, leaving Active with one Psychic. The very next accepted root87 was `PassTurnAction`. Original source went on to claim all six Prizes.
- **V3** played the identical `PlayCardAction Psychic Energy` and physically attached **id54 to Active Mewtwo & Mew**, reaching two Psychic. Its root87 was `UseAbilityAction Perfection`. The first physical-zone divergence is **root86, owner seat0 only**; the first action-ledger divergence is **root87**. A card-name-only accepted-action ledger would miss the real cause.

The pinned engine resolves copied Perfection attacks through **`UseAbilityAction Perfection` and prompt roots**, rather than a top-level `AttackAction`. All three consequential owner actions were native accepted, followed by actual opponent response where applicable:

| Candidate turn | Perfection initiating root | Opponent Active physically Knocked Out | Candidate remaining Prizes |
| --- | ---: | --- | ---: |
| 20 | 87 | Crobat V DAA, 2-Prize KO | 4 at root91 |
| 22 | 103 | Mew VMAX FST, 3-Prize KO | 1 at root107 |
| 24 | 122 | Dedenne-GX UNB, 1-Prize KO | 0 at root125 |

The source did make a genuine `AttackAction Cross Fusion Strike` on turn21 between the first and second Perfection resolutions. The candidate's paid Active remained equipped with two specific physical Psychic cards after the first exchange. The native game was terminal and flipped source-to-candidate. **The observed Perfection attack-resolution Prize sequence is materially different from a game with zero attacks**, although an abstract root counter filtering only `AttackAction` reports `candidateAttacks: []`. Future strength evaluators must avoid interpreting the absence of that root class as absence of copied attacks. Attack names and complete paper semantics still require native prompt inspection and independent paper review; no printed-attack name is invented here.

## Interpretation and decision

This is a clear **single-state causal correction**: a spare Energy diverted to optional Bench setup had the much stronger opportunity cost of an immediately payable Active Perfection route. The winner changes after that single physical payment destination, and replay control is identical.

However, a **separate prospective v3 eight-pair experiment just completed** [run 42713396549](https://github.com/FlareZ123/experiment-01/actions/runs/42713396549), [detailed report](agent36-rank5-gengar-resource-v3-prospective-native-20261109.md). Its 8/8 paired full native action and physical tapes were unchanged, with six double-terminal and two double-censored pairs. V3 had **zero activated interventions** there. Therefore this posthoc winner reversal warrants retaining the v3 guard as a targeted resource-protection tool and wider *decision-exposing* tests, with no promotion to a generally stronger default or a win-rate number.

**Paper qualification remains zero.** Candidate's published Japanese-image 60 lacks independent exact printing admission; official Aichi continuous time/no-call evidence and independent paper/strategy review are absent. No new claim about the complete Top32 field or 99.5% target follows.

## Executable and source files

- [Agent36 historical-regression runner](../../../simulation/evaluation/2026-11/agent36-gengar-v3-original-regression-native.cjs), executed in existing manual [workflow](../../../.github/workflows/agent44-rank5-m4-paper-source-native.yml) under `mode=gengar-resource-v3-regression`.
- [Frozen original v2 eight-deal registration](../../aichi-2026/registrations/agent50-rank5-gengar-flexible-v2-fresh-eight-20261109.json); original `50703/A` source was *selected after viewing v2's negative outcome*, faithfully labeled posthoc.
- [V3 owner-only Perfection resource guard](../../../simulation/twinleaf/2026-11/agent50-gengar-perfection-resource-guard-v3.cjs); [original v2 Gengar policy](../../../simulation/twinleaf/2026-11/agent50-gengar-flexible-telepath-v2.cjs).
