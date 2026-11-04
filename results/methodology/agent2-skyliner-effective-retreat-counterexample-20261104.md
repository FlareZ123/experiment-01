# Agent 2: Skyliner negates the proposed funded Float Stone tactical benefit

4 November 2026. Corrected controlled native Store research finding.

## Verified native counterfactual

Rank-11 source-present printed cards form the constructed tactical root: Active Latias ex SSP with one Darkness Energy, Bench Mega Absol ex M1L with three Darkness Energy, Forest Seal Stone SIT first and Float Stone BKT second in own hand, opponent Active Mega Absol ex. The existing FSS-first Tool tactic holds; both Agent2 and Agent14 developmental alternative policies can choose the second held Float. Actual native Store accepted the subsequent Float, retreat and 200-damage Claw of Darkness attack.

**Crucial untreated control:** Latias ex SSP has printed Ability Skyliner, whose text is **Your Basic Pokémon in play have no Retreat Cost.** The previous paper-printing-archive inspection directly confirmed this text for sv8-76. With **both Tools still in hand and no Float played**, the pinned native Store confirmed effective Retreat Cost **zero** in both physical seats, accepted an untreated RetreatAction into powered Mega Absol, and accepted the **same 200-damage attack**. The alleged causal need for Float was false. The fact that treated actions succeeded remains true, but gave zero incremental access to this attack.

[CI 41901978124](https://github.com/FlareZ123/experiment-01/actions/runs/41901978124) succeeded with **14/14 native tests** under pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. The identical native control and treatment are in [tests/agent2-fss-rank11-funded-attacker.native.test.cjs](../../tests/agent2-fss-rank11-funded-attacker.native.test.cjs). Separate [CI 41901298985](https://github.com/FlareZ123/experiment-01/actions/runs/41901298985) confirms the treatment's two-step Agent14 policy selection and actual Store actions. The [earlier staged report](agent2-fss-first-tool-staged-native-20261104.md) was explicitly corrected.

## Strategic policy consequence

The [Agent14 generic funded Float selector](../../simulation/twinleaf/agent14-generic-funded-floatstone-frontier.cjs) uses the Active Pokémon's printed Retreat Cost. It omitted effective-cost reductions from publicly visible Abilities such as Skyliner, so it **selected an unnecessary Float Stone** in this state despite full tactical funding already being achievable by free retreat. This false-positive would waste a Tool resource and might exclude stronger Tool attachments. Therefore it should remain unselected until public effective-cost logic and Ability-lock checks are integrated and tested against no-Tool baselines. The first-Tool choice-set flaw and generic ToolScore printing-blindness remain separately proven by source and native tests.

The rank-3 Snorlax PGO original-print position has printed four-unit retreat and no Skyline source, offering a more genuinely useful staged Float mobility example. It remains a constructed state, with no claimed game win-rate benefit.

All evidence is constructed tactical Store testing, **zero qualified full competitive games**. The field remains **29/32 authenticated originals**, final 99.5% target unproven.
