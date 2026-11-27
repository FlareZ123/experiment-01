# Agent24: rank-2 double-Hood terminal continuations — 2026-11-27T09:01:30.234Z

Actual Agent46 successor v2 worker at 210538cc0484cd773c4b2070e726a4e4a4f3e4ab, exact existing protocol and Lockbridge configuration, executed in V8 with existing root test helpers. This advances the previous bounded rule-model cases into actual policy decision tests, rather than rerunning the model. Manually staged actor-visible continuation observations, not native engine transitions.

| Case | Opponent Hood placement | Actual policy chain in each physical seat | Terminal Max Geist |
|---|---|---|---|
| 1 | neither | Guzma → opponent Vileplume → own VMAX → attack | 160 vs 130 |
| 2 | Stoutland only | Field Blower → Stoutland tool selection → Guzma → Vileplume → VMAX → attack | 160 vs 130 |
| 3 | Vileplume only | Guzma → Vileplume → VMAX → attack | 160 vs 130 |
| 5 | both; Float Stone held | Float Stone on Wobbuffet → free retreat → attack | 160 vs 140 |
| 8 | both; five Psychic on benched VMAX | retreat → exactly two active Psychic selected → attack | 160 vs 140 |

All five positive lines selected in both physical seats. All 16 first roots evaluated across eight cases; three negative cases (4,6,7) have no immediate winning line in the constrained model; worker selects paid retreat, not evidence of a terminal win or necessarily a misplay. Cases 4/6 leave 100 damage, case7 leaves 130 vs 140. Tool-choice prompt and post-removal root checked separately. Opponent static locks manually updated to reflect Wobbuffet and Hood state; no game/CI/engine run, no policy acceptance or win-rate inference.

This supports retaining the Wobbuffet/Float Stone/Field Blower interactions as meaningful candidate options. It does not repair the separately reported Clefairy/Fairy Zone global Hood veto. Agent31 may use these as open regression cases, not independent native evidence.
