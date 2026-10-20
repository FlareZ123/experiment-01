# Agent 50 v6: independently constructed, common-policy-scoped hidden-order worlds

**20 October 2026.** Preregistered at `agent50-v6-constructor-scoped-world-registration.md`; compiled manually dispatched CI [39369203035](https://github.com/FlareZ123/experiment-01/actions/runs/39369203035) **SUCCESS**, head `b6d2029b26b343e40549df234cec00fdd6d86203`; pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, shared historical source/seed/frozen 60s unmodified. **Artifact [12241285069](https://github.com/FlareZ123/experiment-01/actions/runs/39369203035/artifacts/12241285069), downloadable ZIP SHA256 `d23e90ffb0698d9d2f75a5efd12139875a7ce538cb0750301fb515024cd58a7f`.** Existing manual workflow executed additional `tests/rank10-hidden-order-live-probe.test.cjs` alongside Agent50 tests. It passed all; check log for exact test count. Four historical original Store matches reproduced all four observation runs with verified noninterference, same source deals/roots/outcomes, no game qualification.

## Corrected experimental construction

Each cloned physical and reversed-hidden-own-deck State enters a **fresh** `withBilateralCommonCandidatePolicy` wrapper *before* creating its `SimpleTacticsAi`, executing scoring or selecting a move. This ensures the current policy's synthetic Star Alchemy tactic is present in its initial tactic inventory, and every world receives independent transient Field Blower state. The generic source helper's sixth parameter `wrapWorld` is opt-in; other experiments still use the historical direct bot code path. Constructor-scope isolation is independently covered by a synthetic test. The actual Store games and actor's true root actions were untouched. V5 and V6 use the same schema label `...v5` in JSON, so distinguish them by **head SHA and artifact ID**, not label alone. The source revision fully determines construction order.

## Full four-arm classification

| Frozen historical arm | Actual candidate root action | Reconstructed physical candidate action | Detached own-deck-order result | Classification |
| --- | --- | --- | --- | --- |
| Rank6 Iron Thorns / champion reference | Lillie's Determination | Pale Moon-GX | Scorer values differ | **Baseline mismatch: uninterpretable as actual policy response** |
| Rank6 Iron Thorns / New Moon Lockbreaker v1 | Pass | Pass | Same Farewell Letter action scores **50 physical / 51 reversed** | **Score sensitivity, no action change** |
| Rank11 Absol/Garbodor / champion reference | Hisuian Heavy Ball | Hisuian Heavy Ball | Same action and score traces | Root-specific negative |
| Rank11 Absol/Garbodor / New Moon Lockbreaker v1 | Pass | Pass | Same action and score traces | Root-specific negative |

At rank6 NewMoon global turn3, the real actual bot scored 9 proposals, 5 finite. Each correctly reconstructed world generated 9 proposals, 5 finite. The first differing candidate is the exact `UseAbilityTactic` Farewell Letter action on the own Benched Unown. **No reconstructed action flip** occurred; both hypothetical worlds and the real bot chose Pass. The original root was physical candidate first, opponent rank6 second, with no claim of source-first lock evidence. Rank6 champion still fails actual action parity and cannot be used as evidence that an actual choice changed, despite 50%? no sample-level outcome estimate applies. The rank11 two negative findings are only local to these sampled roots.

## Attribution and open gaps

The pinned `SimpleTactic.evaluateAction` simulates on the full physical deck State and scores the resulting hand. The exact `Unown AOR` Farewell Letter discards the Benched Unown and draws one card, and `HandScore` values actual drawn card types. The source-code mechanism for future hidden-top-card dependency is set out in `agent50-farewell-letter-score-mechanism.md`.

The **legal K0/K1 knowledge epoch and any prior top-card-order reveals have not been independently authenticated at this exact native decision root**. Exact whole-policy source history, delegated attacks, opponent concealed-information invariance, paper-rule fidelity, official 25-minute clock and opponent decision competence remain open. This does not certify an illicit action, competitive advantage or any win rate.

**Status remains 29/32 published exact opponent lists, zero competitively qualified game wins and no demonstrated 99.5% goal.** Next worthwhile integration: use Agent21's actor-only observation and authenticated owner-search history to test a genuine hidden-top permutation for this precise scored root, then build an information-set-safe expectational evaluator in the canonical common policy rather than pretending the one physical deck future is publicly known.
