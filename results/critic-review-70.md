# Critic: single-deck decision and evidence gate

**17 October 2026 Critic status correction:** [Compiled manual replay 38919894636](https://github.com/FlareZ123/experiment-01/actions/runs/38919894636) reconstructs the source-dealt rank-10 champion-B/Regidrago control (**350/350** root dispatches) and Copycat alternate (**235/235**) in a fresh process. All live action inputs have typed/prompt-reference transport; pre/post ordered source-zone and selected card-history digests match at each dispatch. The old 221/149 generic serialization failures do **not** represent missing replay inputs. This is a **single-deal replay-input transport milestone**. Full transient-State/reducer semantics, the five remaining corrected-clone boundary gaps and opposing policy competence are unresolved. `sourceReplayMechanicsVerified:false`, `qualifiedForCompetitiveInference:false`, and **zero independently qualified games** remain unchanged. [Critic broadcast and next gates](../communications/broadcast/20261017T0047Z_critic_rank10_transport_milestone.md). The earlier "replay portability absent" description below is historical.


**Critic operational update (16 October):** [The three-rank replay qualification critical path](aichi-2026/critic-qualification-critical-path.md) freezes broad performance promotion until a source-ranked rank-10 decision-and-response replay and independently checked Simulator isolation exist. Source-ranked rank-2 and rank-6 packets follow. The earlier experimental v1 clone had post-attack alias defects; targeted [post-super v2 reconciliation](twinleaf/post-super-attack-history-alias-reconciliation.md) and [prototype repairs](twinleaf/two-stage-intermediate-prototype-inheritance.md) passed bounded structural tests. Full prompt/reducer replay, source-State noninterference and opponent-policy competence are still unproven; both clone profiles remain unqualified.

**16 October 2026.** Research objective: one fixed, legal 60-card paper Expanded deck targeting a 99.5% win rate against the Aichi 2026 Top 32. **No qualified competitive win-rate evidence currently supports that target.**

## Fixed-deck decision

| Full 60-card list | Role | Status |
| --- | --- | --- |
| [Champion Shadow Rider](aichi-2026/benchmark-shadow-rider.md) | **Sole currently nominated reference** | Published rank-1 list; unoptimized reference |
| [Hood Shield v1](aichi-2026/candidate-hood-shadow-rider.md) | Frozen challenger | Source-checked hypothesis; no qualified games |
| [Temple v1](aichi-2026/candidate-temple-shadow-rider.md) | Frozen challenger | Source-checked hypothesis; no qualified games |

The champion is an unchanged exact copy of field rank 1. The [mirror/source-copy gate](aichi-2026/candidate-copy-gate.md) limits its eligibility under symmetric equal-policy evaluation. None of the three has demonstrated competitive performance sufficient for promotion. A structurally different architecture should remain possible.

## What is actually validated

| Evidence layer | Current state |
| --- | --- |
| Field provenance | [32 tracked](aichi-2026/field.csv), **29 available full source lists**, missing exact ranks **23/25/28** |
| Engine mapping | [Print-aware resolution and bounded matches exist](twinleaf/field-card-resolution.md); many card/rule behaviors still require checks |
| Policy quality | [Nine representative archetypes](aichi-2026/policy-qualification-matrix.md) are **all unqualified** for competitive inference |
| Simulator quality | [Simulated Card object leakage](twinleaf/simulator-card-reference-leak.md) and [Night Watch randomness](twinleaf/night-watch-random-hand-semantics.md) have shown consequential fidelity risks |
| Finished gameplay | [Engine completions](aichi-2026/campaign-diagnostic-execution.md) exist, but **zero policy-qualified matchup wins** are recorded in the [readiness ledger](aichi-2026/readiness-ledger.csv) |
| Statistical strength | No eligible field estimate or 99.5% certificate |

**16 October Critic simulator-safety enforcement:** The [campaign quality screen](../scripts/aichi-campaign-quality-screen.cjs) now carries an explicit per-trial `known-simulator-card-alias-risk` blocker for the default pinned simulator or `experimental-clone-not-qualified` for the opt-in corrected clone. It reports `simulatorSafetyQualified:false` in both modes. This preserves individual-run provenance without implying that every default game was demonstrably corrupted or that the experimental hook is validated. The [two-mode regression](../tests/aichi-campaign-quality-screen.test.cjs) passed the existing [manual statistical CI run 38878258197](https://github.com/FlareZ123/experiment-01/actions/runs/38878258197), whose head includes the change. The [Critic broadcast](../communications/broadcast/20261016T090443Z_critic_replay-clone-gate.md) specifies the adversarial rank-10 replay and clone-isolation validation needed to retire these blockers.

The 32-rank evidence method gives zero lower bounds to unobserved ranks. With three missing ranks, even hypothetical perfect lower bounds for all 29 known ones could produce only a 29/32 complete-field lower bound. This is a **coverage ceiling for that evidentiary method**, not a prediction of actual results.

## One shared critical path

1. **Replayable actual matches.** Take a source-locked rank-2, rank-6 or rank-10 diagnostic with a documented bot failure. Prove a source-representative strategic line and one consequential opponent response in a full game, in each verified starting seat. Preserve decision and prompt traces, card printings, deck identities, actual turn proof, hook toggles, policy versions and failure codes.
2. **Faithful environment.** Rule-test decisive mechanics and ensure game-state cloning, hidden information, random-choice prompts and chosen attacks behave correctly. Keep corrections reversible and distinguish rule fixes from policy improvements.
3. **Fair unchanged-list comparison.** New manual diagnostic workflow dispatches default to `decorrelated-slots-v3`; explicitly select v2 only to replay earlier records. See [Critic's seed-default intervention](aichi-2026/critic-v3-defaults.md). Use the [fixed campaign](aichi-2026/fair-comparison-campaign.md), [quality screen](../scripts/aichi-campaign-quality-screen.cjs), and [v3 seed protocol](aichi-2026/agent44-v3-seed-protocol.md). Hold the 60-card identities and evaluation conditions fixed within comparisons. Do not infer winners from generic-bot terminal states.
4. **Full target coverage.** Seek original source decks for ranks 23/25/28 and retain their missing status until provenance is obtained. Do not silently substitute other lists.

## Promotion contract

Update the nominated deck only when complete list legality, versioned game provenance, opponent line-and-response competence, replayable both-seat results, failure accounting, all-32 scope labeling, and independently sampled confirmation support the decision. See [benchmark validity](aichi-2026/benchmark-validity.md), [raw game contract](../scripts/match_record_contract.py) and [statistical evidence](aichi-2026/evidence-protocol.md).

**Central synthesis recommendation:** add a compact link to this decision board at the very top of [results/README.md](README.md). Keep the 53 KB chronological body as an archive of research links. New atomic reports should update their relevant subject synthesis; the decision board should change when a nominated list, field coverage, or evidence gate changes materially.
