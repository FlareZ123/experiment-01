# Rank26 source opportunity diagnosis: natural Cologne absent, Lightning not discarded, native replay exact

**Agent 3 | 2 November 2026 | read-only owner-root native replay; retrospective diagnosis, zero competitive-qualified games**

## Result

The native [preregistered 24-physical-deal cohort v1.1](agent3-rank26-natural-prekoko-v11-result-20261102.md) completed with zero opt-in pre-Koko Cologne selections and zero source-first Crisis Punch. The new [retrospective prerequisite protocol](registrations/agent3-rank26-prerequisite-audit-v12-20261102.md) adds *read-only* source owner-hand/Bench/Active/discard and opponent public-Active state snapshots before native Store owner actions. It leaves every bot action unchanged.

**The replay exactly reproduces the v1.1 source JSON SHA256**, `c5caba34c758bdad80a6dbcdaf6c02c7bc2cebe69c90f31edb5f6f64070e9cbf`. The 24 cases remain 24/24 source physically paired, the same 48 completed/capped game arms, 13 source physically first, and complete control/variant action and terminal parity. There were **zero native exceptions**. This is strong replay-invariance evidence for the new passive observer, while retaining the existing game-level qualification veto.

### First global turn source-root opportunities, distinct source-first physical deals

| Owner-observable prerequisite appeared at any source action root | Deals of 13 |
| --- | ---: |
| Opposing public Active was Iron Thorns ex or Klefki | **13** |
| Source held Canceling Cologne | **0** |
| Source Active was Meloetta ex | **1** |
| Source Benched Meloetta ex | **3** |
| Source Benched Tapu Koko Prism Star | **2** |
| Both Meloetta and Tapu Koko simultaneously on Bench | **1** |
| Two Basic Lightning already in source discard | **0** |
| Benched Meloetta + Koko + two discarded Lightning | **0** |
| Entire v2 Cologne opportunity predicate | **0** |

Thirteen source-first deals contributed **between 3 and 10 real source-owned action-root observations apiece**, counted at most once per physical deal for each prerequisite. No individual accepted-action root was considered an independent statistical sample.

The opponent-lock side of the predicate was satisfied throughout all thirteen source-first openings. **Neither held Cologne nor the required two discarded Lightning appeared at any recorded source-first action root.** Rank26 therefore never presented an eligible source-owner intervention to the opt-in v2 decoder. The zero selected Cologne decisions cannot establish that choosing Cologne is strategically bad or that the staged line lacks potential. The immediate observed problem is resource assembly and search/prompt policy.

In the one source-first case with both Meloetta and Koko Bench-ready (repeat 92, source seat B), the source still lacked held Cologne and two discarded Lightning. A different case had Active Meloetta (repeat 91, source seat B) and also lacked Cologne. This cleanly distinguishes opportunity construction from the native card's conditional action legality.

### Baseline constraints and interpretation

Original rank26 printed 60 has one Cologne, one Meloetta, one Koko and two Lightning; its original 60 also contains four Battle Compressor. The [archived v1.1 action traces](agent3-rank26-natural-prekoko-v11-result-20261102.md) show zero accepted first-global-turn Battle Compressor plays among the 13 source-first cases. The new source-root census separately proves two discarded Lightning were absent in all 13. It does **not** report whether Battle Compressor was held, available by search, Prized, or legally played but rejected in a later root. Those are the next questions, with owner-only information boundaries preserved.

As a limited mathematical calibration, for 12 Basic Pokémon and a singleton non-Basic Trainer in the 60, conditional on an initial **Basic-valid seven** and one ordinary draw with no bonus or other draw/search, that singleton is among the first eight cards with probability **12.6593%**. The probability of seeing it in zero of 13 independent such openings would be about **17.2115%**. These are exact card-location calculations under narrow assumptions, not simulated matchup frequencies. They demonstrate that zero naturally held Cologne is unsurprising at this sample size and reinforce the need to examine legitimate search paths. Native setup can include mulligan-bonus draws, Prizes and actions, so these numbers are not native game-rate estimates.

## Evidence and execution chain

- Frozen experiment v1.1 source engine: Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, original rank26/6 printed 60s, seed base `20261102`, repeat 84..95, seat A/B, 120 native actions, two same-deal policy arms.
- New read-only observer source: `simulation/twinleaf/rank26-prerequisite-census-v12.cjs`, pure owner-only tests `tests/agent3-rank26-readonly-prerequisite-census.test.cjs`; both controlled and opt-in policies identical to v1.1.
- Initial immutable diagnostic branch `agent3-rank26-prerequisite-v12-20261102` and [CI 41392732819](https://github.com/FlareZ123/experiment-01/actions/runs/41392732819) failed *before native execution* because of a precompilation import. This is preserved separately, not counted among the 48 replayed arms.
- Corrected immutable branch `agent3-rank26-prerequisite-v12-retry-20261102` at **`ba20ed41005c10b5632f4f75808c6e0c2e75174d`**, [compiled manual CI **41392876241**](https://github.com/FlareZ123/experiment-01/actions/runs/41392876241) **passed**, including its new pure two-seat prerequisite tests and all 48 native replay arms. No new auto-triggered workflow was introduced.
- [Native JSON artifact 13118133081](https://github.com/FlareZ123/experiment-01/actions/runs/41392876241/artifacts/13118133081): 61,250 uncompressed bytes, SHA256 `4eaefff01d83fe3287b35e00600bc27a22df0f0f28fe414d48b0b95516f3504b`, download ZIP SHA256 `2f219c0901d2e8b5f2fa554894ecad6599c56c82614ced7a4519b8f15221baa1`. Contains every case, root counts, first and final source-visible prerequisite snapshots, original replay digest, source action/terminal parity and admission flags.

## Next discriminating experiment

Instrument **held and legally usable Battle Compressor, Quick Ball, Trainers' Mail and source K0/K1 deck-search opportunities** at the first native owner root under true original rank26 source deals. Then test a *versioned, owner-information-safe source setup policy* that prioritizes acquiring Cologne and putting the two Lightning in discard while preserving the Exeggcute, DCE, Bench and Supporter competing channels. A future first-turn native attack must include printed costs, complete prompt settlement, opponent continuation and source actor competence before informing the fixed-60 deck decision. Avoid interpreting source-first absence from this small cohort as proof of impossible or inferior archetype strength.

**Qualification:** Retrospective owner-root diagnosis only. Zero independent prospective games beyond v1.1; zero competitively qualified games, no demonstrated 99.5% single-deck solution.
