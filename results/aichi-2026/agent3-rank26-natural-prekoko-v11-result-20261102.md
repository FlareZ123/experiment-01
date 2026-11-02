# Rank-26 source-first natural Cola pre-Koko v1.1: 24 exact physical pairs, no selected policy opportunity

**Agent 3 | 2 November 2026 | completed, frozen developmental negative | no competitive game wins**

## Provenance

This is the completed outcome of the **pre-registered and amended** protocol in [the v1.1 registration](registrations/agent3-rank26-natural-pre-koko-24deals-20261102.md). Its initial 140..151-repeat plan could not pass the existing `deriveSlotSeeds` input contract and failed before any deal in [CI 41380099291](https://github.com/FlareZ123/experiment-01/actions/runs/41380099291). The registration was corrected *before receiving any natural game output* to repeats **84..95**, both physical seats, 24 unique seeded setups and 48 control/treatment arms. The corrected [manual CI run 41380396412](https://github.com/FlareZ123/experiment-01/actions/runs/41380396412) succeeded with execution commit `d31758538b658faa3ca405fc780454bbfdada2e4`.

- Engine: pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Original rank-26 source 60 digest (SHA256 of serialized printed-card array): `e0d1b02d134aa142a4289493b6990a304e2983219508de99d793c09c99359f00`.
- Original rank-6 opponent 60 digest: `b50e4cf27c449653cf9c61e4e830b7a3d61f9b1c7e42a7dfd2d781a1c6e6895a`.
- Source: `simulation/twinleaf/rank26-natural-pre-koko-cologne-cohort.cjs`, exported `BASE=20261102`, repeats 84..95, seed phase `pilot`, rank index 26, 120 native actions per arm, normal first-player coin and owner policy.
- Comparison: `rank26-autonomous-cologne-pump-propagation-v3` versus the *same profile* wrapped in opt-in `rank26-cologne-pre-koko-v2`.
- Native artifact: [agent3-rank26-natural-pre-koko-original-source](https://github.com/FlareZ123/experiment-01/actions/runs/41380396412/artifacts/13112719341). Original extracted JSON: 55,054 bytes, SHA256 `c5caba34c758bdad80a6dbcdaf6c02c7bc2cebe69c90f31edb5f6f64070e9cbf`. The ZIP digest at retrieval was `37e3ac839f926c98524902de147ff4d200173632da27a25860425b52e7147c27`.

## All outcome denominators

| Observation | Count |
| --- | ---: |
| Actual random original physical setups | 24 |
| Native control + treatment arms | 48 |
| Independently observed exact matching physical deals | **24/24** |
| Mismatched or missing deal fingerprints | **0** |
| Native exceptions | **0/48** |
| Source physically moved first | **13/24** |
| Opt-in pre-Koko Cologne decoder selections | **0/24 pairs** |
| First-turn source Cologne plays, control and variant | **0/13 source-first** |
| Source first-turn Tapu Koko Dance of the Ancients | **0/13** |
| Source first-turn Crisis Punch | **0/13** |
| Source first-turn state with opponent on one Prize | **0/13** |
| Original engine terminals per arm | **4/24**, source lost all four |
| Action caps per arm | **20/24** |
| Competitive-qualified games | **0** |

Every pair has identical source-owned global-turn-one action traces, native terminal/cap classification, actual source-first flag and reported winner between control and treatment. Each of 13 source-first runs played `PassTurnAction` without a first-turn source attack. The native records include some legal search or development actions, but no observed triggering of the staged full combo. All 48 arms still use weak non-competitive actors; the four original engine terminals remain developmental.

### Measurement boundary

`summarize()` filters source decisions by `turnBefore === 1`, the **global first turn**, and v2 itself additionally requires `state.turn === 1`. Therefore the 11 actual source-second openings have empty `sourceActions` in this report *by design*. They must **not** be counted as 11 source-owned first-turn Passes, nor as 11 eligible failures of the v2 intervention. Exact source-first opportunity denominator is **13**.

Zero native selections among 13 source-first openings has one-sided exact 95% binomial upper bound **20.5817%** for independent identically distributed source-first opportunities under this fixed policy. This is only an uncertainty illustration; the small fixed deterministic seed schedule and potentially non-exchangeable game conditions prevent treating it as broad tournament prevalence.

### What is established

The pre-Koko intervention was actually available to the native actor, executed in a protocol that preserved the paired physical deals, and never selected during these natural source-first openings. The staged both-seat mechanical chain previously passed [CI 41379659683](https://github.com/FlareZ123/experiment-01/actions/runs/41379659683), but did not become naturally reachable here. This bounds the *observed* policy efficacy, not the paper legality or intrinsic strength of the rank-26 archetype. A narrow prerequisite census at each owner-visible source root is the next discriminating test: distinguish absence of held Cologne from missing Meloetta/Koko Bench preparation and fewer than two discarded Lightning. Such a census must preserve source-only visibility and avoid changing actor decisions.

## Release decision

**No natural-game improvement, no credible win-rate update, no new fixed-deck ranking.** Keep v2 opt-in and the existing frozen canonical profile unchanged. Preserve the preregistered all-arm negative sample, and investigate specific prerequisite failures before implementing another source attack policy. Games still lack complete opponent competence, printed action-chain audit and the official paper match clock.
