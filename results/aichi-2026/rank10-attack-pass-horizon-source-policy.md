# Rank-10 same-horizon Attack/Pass score correction: authentic source-policy counterfactual

**Agent 3, 17 October 2026 UTC.** Compiled manual [CI 39000529657](https://github.com/FlareZ123/experiment-01/actions/runs/39000529657), revision `7ef6091bc448d5178aa37cd3bffdeb1a1c1b2ca5`, succeeded. [Source artifact 12089266317](https://github.com/FlareZ123/experiment-01/actions/runs/39000529657/artifacts/12089266317) contains full bounded source-case observations. **Both game outcomes are diagnostic, unqualified for competitive inference. Zero qualified games.**

## Compiled four-arm, decision-scoped source-clone test (17 October)

[Manual CI 39001518181](https://github.com/FlareZ123/experiment-01/actions/runs/39001518181) **passed** on head `2904e24a09e0d345790477ab109f1cf5977d2772`. [Four-arm machine-readable artifact 12089198469](https://github.com/FlareZ123/experiment-01/actions/runs/39001518181/artifacts/12089198469) reproduces each unchanged physical-60 source comparison with four frozen turn-five opponent decision profiles: **raw original bot**, **raw aligned Attack/Pass bot**, **original bot with detached Simulator only while making turn-five Koraidon choices**, and **aligned bot with the same decision-scoped detachment**. The initial actual root-State and all real decisions from earlier turns are identical across the compared arms, within each candidate inventory.

The graph inspector traced the **first exact own-data mutation** under the raw bot to a `RegidragoV` instance at `Store.state.players[1].hand.cards[0]` during the third proposed `PlayCardAction`: that Card's own-property count increased **32 → 34** *before the real source dispatch*. At the final Pass/Attack decision, another `RegidragoV` at `Store.state.players[1].bench[4].cards[0]` changed `movedToActiveThisTurn: false → true` during speculative scoring, despite being on the source Bench. Both mutations occurred in **the original and aligned tactics, in both physical-A candidate cases**. The owner paths and differences were reconstructed from canonical own-data Store graphs, without using proposed actions as data.

Agent 48's already-studied experimental post-constructor source-graph reconciliation was installed only for the individual audited real bot decisions via [reversible scoped hook](../../simulation/twinleaf/decision-scoped-detached-simulator.cjs). The Store's own-data graph stayed **unchanged across each of all five Koraidon turn-five source policy calls** in both candidates and in both policy versions. The original bot still passed; the aligned bot still made the real engine accept printed `Retribution Strike`. Source-game winning seats also remained unchanged across all four profiles: champion A lost and Hood A won. This demonstrates a **bounded policy-selection noninterference repair** in these particular source windows and shows the score-horizon action change survives the repaired clone. It does not cleanse earlier turns, validate clone semantics for all effects, reveal function closures, enforce hidden-information fairness or prove either choice strategically best.

[Canonical owner-path helper](../../simulation/twinleaf/graph-difference-witness.cjs), [scoped-hook tests](../../tests/decision-scoped-detached-simulator.test.cjs), and [graph-path tests](../../tests/graph-difference-witness.test.cjs) passed in the same compiled manual workflow. Continue to label `sourceReplayMechanicsVerified:false` and `qualifiedForCompetitiveInference:false`. The earlier raw-policy corruption below remains a relevant historical failure, and this repaired decision-only experiment does not supersede the separate champion-B archive's v2 replay milestone.

## Underlying policy mistake

Agent 36 independently measured an upstream `AttackTactic` score-horizon mismatch on source rank-10 opponent turn five. The pinned tactic compares an attack's score **after the simulated turn advances** to the **unchanged pre-turn live score** minus the `attackBonus` tolerance. On these exact known-source states, it rejected the legal `Koraidon ex TEF / Retribution Strike` even though independent post-turn Pass scoring ranked attack above Pass by 26 or 31 points. See [original mathematical and full-source diagnosis](rank10-koraidon-score-horizon.md).

I implemented a research-only, opt-in [same-horizon tactic](../../simulation/twinleaf/attack-pass-horizon-policy.cjs) that instead evaluates an actual speculative `PassTurnAction`, then evaluates each printed Active-Pokémon `AttackAction`, comparing scores on the same next-turn horizon with the original `attackBonus` tolerance. No upstream/vendor source file was edited. The hook can target a single physical seat and a single global turn; all other turns retain the pinned `AttackTactic` implementation. [Pure regression tests](../../tests/attack-pass-horizon-policy.test.cjs) include Agent 36's exact source score observations and passed in compiled CI.

## Frozen authentic game contrast

Two separately existing 60-card candidate inventories, **published champion Shadow Rider** and **Hood Shield v1**, are each played unchanged in physical slot A versus the published Aichi **rank 10 Regidrago** in physical slot B. Both use seed `3162592764`; actual first turn is Regidrago B. The candidate bot remains unchanged. The opponent receives the modified AttackTactic **only on global turn 5**. All earlier actual root actions are byte-equal within each pair, and the full source-State/Store fingerprints **before the first turn-five decision** match exactly. After the experimental branch, the original source control repeats identically.

| Source candidate | Opponent's original turn-five final choice | Same-horizon turn-five final choice | Original engine winner | Changed engine winner |
| --- | --- | --- | --- | --- |
| Published champion Shadow Rider | **PassTurnAction** | **Retribution Strike** | Regidrago B | Regidrago B |
| Hood Shield v1 | **PassTurnAction** | **Retribution Strike** | Hood A | Hood A |

Both source variants first chose three genuine PlayCard actions and a genuine `Legacy Star` Ability action in the same turn before the final decision. In both, the new horizon policy **actually announced a printed legal attack in the root source Store**. This is stronger evidence than finding an available attack name in a cloned state; the actual game continued to its terminal result.

The winner did **not** change in either paired game. Same numeric seed across different candidate 60s is **not** a paired hidden-zone state between those candidate inventories; each baseline is paired only with its own changed policy arm.

## Significant noninterference red gate

A root-Store own-data graph fingerprint taken immediately before and after each actual turn-five bot decision showed **policy-time root graph changes** on a third PlayCard proposal and on the final Pass/Attack proposal in **both** default and corrected policies. The exact differing graph paths were not yet recorded in the first CI artifact; a follow-up diagnostic adds a `firstMismatch` to classify them.

This matters: `SimpleTactic.evaluateAction` uses a speculative Simulator that may alias or mutate the live source state. Our result does **not** demonstrate that the corrected policy explores safely detached world states, even though the first source decision and earlier live actions match. The global `qualifiedForSourcePolicyNoninterference`, `sourceReplayMechanicsVerified` and `qualifiedForCompetitiveInference` gates remain **false**. In addition, the speculative decision policy still has a known own-deck-order information leak. A shared score horizon is an experimental consistency improvement, not proof of a realistic hidden-information decision policy.

The source board is also affected by Pale Moon-GX's delayed Knock Out; Agent 36's separate [compiled paper-rule defect](rank10-pale-moon-source-rule-discrepancy.md) confirms that raw Twinleaf fails to remove that attack effect upon retreat. The attack-versus-Pass correction cannot be assumed superior to a legal retreat decision, and the source-engine game win is uncalibrated.

## Next decisive checks

1. Read the newly recorded first differing Store-graph path and determine whether this is material alias corruption or inert diagnostic metadata.
2. Compare same-horizon and default attacks with a detached speculative profile, without changing the source decks or opponent side, then check deterministic replay and hidden-information restrictions.
3. Test attack, retreat and Pass at a common time horizon under corrected Pale Moon Active-exit semantics; evaluate representative opponent responses before interpreting any match outcome.

### Reproducibility

- [Source-ranked coupled runner](../../simulation/twinleaf/aichi-rank10-aligned-attack-probe.cjs).
- [Policy adapter](../../simulation/twinleaf/attack-pass-horizon-policy.cjs) and [tests](../../tests/attack-pass-horizon-policy.test.cjs).
- [Existing manually dispatched CI workflow](../../.github/workflows/aichi-attack-pass-score.yml).
- [Original baseline's common-horizon score and printed attack/retreat forks](rank10-koraidon-score-horizon.md).

The ambition remains one unchanged legal paper-Expanded 60 for the complete Aichi Top 32. **No deck or win-rate promotion follows from this single-seed policy experiment.**
