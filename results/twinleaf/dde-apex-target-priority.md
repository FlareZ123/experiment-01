# Regidrago Double Dragon target priority, policy v2

**Agent 20, 16 October 2026. Classification: narrow experimental decision-policy change.** This result does not establish a competitive win rate.

## Source-verified failure and correction

The pinned Twinleaf simulator's generic `AttachEnergyTactic` does not score dynamic Energy supplied by Double Dragon Energy (ROS 97). Research tactic v1 recovered legally available DDE attachments, but greedily selected the first legal Dragon Pokémon, checking Active first. A pinned engine fixture established an Active Regidrago VSTAR SIT already paying the printed Grass + Grass + Fire cost of Apex Dragon, with a second unpowered Regidrago VSTAR on the Bench. The v1 tactic nevertheless selected the Active. See [prior integration and four-seed action audit](dde-runtime-integration.md).

The updated [research-side tactic](../../simulation/twinleaf/dde-attach-tactic.cjs) uses a narrow, **printed-cost priority**:

1. When Active is Regidrago VSTAR SIT and at least one Benched Dragon exists, read its effective attached Energy using a cloned state and the pinned engine's `CheckProvidedEnergyEffect`.
2. Test whether three **distinct** provided units cover the printed Grass, Grass and Fire requirement. An `ANY` unit can cover one missing typed unit. Colorless remains Colorless, including special Energy transformed by Temple of Sinnoh.
3. If Active covers this cost, try legal DDE attachments to Benched Pokémon first, then Active. Otherwise retain the v1 Active-first order. Return only an attachment accepted by the pinned `PlayCardAction` reduction and whose actual dynamic provision is nonzero.

The update does not execute speculative attacks to check readiness. A paid printed cost does **not** prove a real attack is legal under status conditions or card effects. The first Bench target can still be strategically inferior to holding Energy or placing it elsewhere. For now, this is an explicit heuristic correcting one reproduced greediness counterexample, rather than a general target-value optimizer.

## Validation

- [Independent effective-unit matcher tests](../../tests/dde-attach-priority.test.cjs) cover typed requirements, `ANY` assignment without reusing the same unit, insufficient total units and Temple-like Colorless conversion.
- [Pinned Store target fixture](../../simulation/twinleaf/dde-target-priority.cjs) asserts the alternative Benched Regidrago is chosen and the actual Store attaches DDE there.
- [Manual workflow](../../.github/workflows/aichi-dde-runtime.yml) runs those checks alongside the pre-existing legal attachment and frozen-source bounded Regidrago diagnostics. The policy result label has changed from `DoubleDragonAttachTactic-v1` to **`DoubleDragonAttachTactic-v2`**. Old v1 outputs must retain their version and must not be combined as though produced by v2.

The engine submodule remains pinned to `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; no upstream file is edited. **Pinned-engine validation passed [manual CI run 38869518061](https://github.com/FlareZ123/experiment-01/actions/runs/38869518061).** The exact unit-matcher tests, revised source-state Benched attachment, prior DDE action regression, seeded bounded source-deck diagnostics and 15 field-evaluator tests all completed successfully. The checkout cleanup emitted an already-known nested `pokemon-cards-css` submodule warning after the successful job. No source-deck game outcome, opponent policy qualification or matchup probability is inferred.

## Next research actions

Check whether the modified rule increases attacks or Prize-taking opportunities in matched, source-locked rank-10 states with a credible opposing response, using the decorrelated-v3 seat protocol. Then examine authentic cases where saving a DDE for a Benched Regidrago would delay the Active's best higher-cost attack. Inspect the cloned-state Energy read for mutation or hidden-information effects before allowing repeated policy evaluations to count toward strength evidence.
