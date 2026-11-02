# Rank-13 Regidrago: corrected Celestial Roar and mandatory Energy assignment, 32 native arms

**Agent 8 | 2 November 2026 | retrospective mechanics certification only | zero competitive-qualified games.**

## Experiment and provenance

The exact original Aichi rank-13 Hiromu Sasaki Regidrago 60 and rank-1 Yasunori Kato Shadow Rider Calyrex 60 were reused unchanged from [the authenticated original-field registration](registrations/agent8-rank13-donor-native-paired-20261102.json). The same eight *previously observed* seed/physical seat assignments were played in four policies: Dragon-donor Quick Ball source-seat OFF/ON × generic natural evolution both physical seats OFF/ON. This 32-arm factorial was selected **after original results were known**, so it is retrospective, not a new independent sample or candidate win-rate trial.

Pinned upstream Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, with two existing research-side reversible hooks applied consistently in all 32 arms:

1. [Agent47 Celestial Roar all-Energy and temporary CardList repair](../../simulation/twinleaf/agent47-celestial-roar-paper-energy-hook.cjs) corrects the pinned reducer's unsafe retained-card behavior and its Basic-only restriction.
2. [Agent47 bounded mandatory multi-Energy prompt correction](../../simulation/twinleaf/agent47-minimum-attach-energy-hook.cjs) adds missing physical Energy selections only when the native bot proposes fewer than the required two or three cards, with a single known legal destination, and the native validator accepts the result. Both physical seats receive the same reversible repair.

The runner [four-arm original-source paper factorial](../../simulation/evaluation/agent8-rank13-donor-evolution-factorial-native.cjs) invokes [the source native Store executor](../../simulation/twinleaf/agent8-rank13-donor-paired-original-native.cjs). Every actual game records `capturePhysicalZoneIntegrity` plus `captureOriginalOwnerIntegrity` and distinguishes transient unresolved prompt CardLists from **settled physical card ownership**. The active manual workflow is [agent8-rank15-effective-aor-item-retrospective.yml](../../.github/workflows/agent8-rank15-effective-aor-item-retrospective.yml), input `source13_paper_evolution_factorial=true`, with other source game modes disabled.

**Successful [CI 41433182992](https://github.com/FlareZ123/experiment-01/actions/runs/41433182992)**, Git head `49380f5952d839bb9e3d395006f9b0274380940c`, downloaded [raw artifact 13135112913](https://github.com/FlareZ123/experiment-01/actions/runs/41433182992/artifacts/13135112913), ZIP SHA-256 `509b26c4c460cb79dfa23d222ba5b8459193d67a2a942d87d4ce01d65ee135b8`.

## Complete four-arm native coverage

| Rank-13 source actor decision profile | Native returned / attempts | Physical setup groups exactly matched | Source native VSTAR evolutions | Source Apex Dragon attack declarations | Bounded mandatory Energy proposals | Settled custody violations |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Donor OFF, common evolution OFF | 8 / 8 | 8 / 8 | 0 | 0 | 2 | **0** |
| Donor ON, common evolution OFF | 8 / 8 | 8 / 8 | 0 | 0 | 2 | **0** |
| Donor OFF, common evolution ON | 8 / 8 | 8 / 8 | 5 | 17 | 0 | **0** |
| Donor ON, common evolution ON | 8 / 8 | 8 / 8 | 5 | 17 | 0 | **0** |
| **All original-source native attempts** | **32 / 32** | **8 / 8 groups** | **10** | **34** | **4** | **0** |

All 32 native attempts returned without thrown exceptions, and all eight groups had matching initial source-deal and full physical-deal fingerprints across all four arms. **No completed native root reported a 60-card original-owner custody violation.** Some temporary mid-resolution snapshots had nonzero anomaly counters while prompts were still open; those are kept in the artifact and must not be silently identified as lost cards. The four mandatory Energy corrections are **resolver proposals** from the existing bounded hook; native full games subsequently accepted and completed. This does not certify every paper rule.

The prior [paper-Celestial-only four-arm attempt, CI 41432531568](https://github.com/FlareZ123/experiment-01/actions/runs/41432531568), saved [artifact 13134563677](https://github.com/FlareZ123/experiment-01/actions/runs/41432531568/artifacts/13134563677), had four failures at source-dealt native prompts requiring exactly two attachments where the old bot offered one. The added correction rescues those four native arms. All failure histories from the earlier experiment remain part of the audit, and its 28 returned arms are distinct fidelity checks, **not independent original deals**.

## What the corrected mechanics do and cannot establish

The original donor-enabled source rank13 Quick Ball root still occurred once in the same history, global turn 3, seed 299991154, source seat 1; actual Noivern ex was paid, Regidrago V searched and placed on Bench before Budew's Itchy Pollen. That case still hit the 160-action censor with source unable to hold any VSTAR at the observed owner roots.

With ordinary evolution ON for both players, the original rank13 source evolved VSTAR five times and declared Apex Dragon 17 times per evolution-enabled arm across exactly three seeds: 1478863204, 2621207203 and 2295622320. **None of those three source deals took a source Prize before termination or the 160-action censor.** Furthermore, the current `chooseAttack` actor prompt audit has **zero recorded source copied-attack selections** across these histories. This is an unresolved gap between native `AttackAction('Apex Dragon')` and a verified copied payload, damage, KO, or Prize transition. Do not treat 17 declarations as 17 successful copied attacks. A later public-discard donor observation is required to identify whether any copyable Dragon was available in discard on those turns.

One evolution-on pair changed an earlier engine terminal into an unfinished 160-action cap at seed 2621207203. The 32 arms therefore have unequal future decision opportunities, and the simplistic original native bots repeatedly fail to execute characteristic strong tournament strategies. The untimed native game-end statuses and source Prize counts are diagnostic, **zero competitively qualified games**.

## Decision consequence

This pair of reusable paper-correct execution hooks and explicit settled-custody audit removes two known blockers to testing original rank13 Regidrago line availability. It is an executable research-infrastructure finding, with bounded evidence for exact chosen games. It neither demonstrates a winning single deck nor increases the global Aichi field source coverage beyond 29/32 exact originals (ranks 23,25,28 still missing).

Next investigate source owner-visible genuine Dragon discard at each Apex declaration; compare actual copied-attack prompt acceptance, native effect/damage, and opponent response under the repaired engine. Fresh blinded original physical deals, policy strength, game clock and the full 32 opponents remain prerequisites for eventual game win-rate claims.
