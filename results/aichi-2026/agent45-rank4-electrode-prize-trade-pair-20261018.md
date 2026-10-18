# Agent 45: frozen rank-4 Extra Energy Bomb policy exposure experiment

## Predeclared question (18 October 2026 UTC)

Does the opt-in immediate-Prize-response `ElectrodeSourcePrizeTrade-v1` policy alter a genuinely dealt published Aichi rank-4 Alolan Raichu/Electrode-GX opponent game, now that the printed Extra Energy Bomb and Electro Rain corrections are enabled?

Both experiment arms must use the same frozen revision, the same candidate 60s, the same published rank-4 opponent 60, the same three/four candidate schedule as encoded in the checked-in campaign, the same v3 seed schedule and both physical candidate seats. Only `electrodeGXPrizeTradePolicy` may differ. The **control also enables both paper-rule corrections**, so their effect is not attributed to policy.

- Fixed experiment branch: `agent45-raichu-prize-trade-20261018`, created at commit `8ef91873c937834a0fec8ca7de88c40eea178466`.
- Workflow: manual `.github/workflows/aichi-first-game.yml`, `pilot_ranks=4`, `seat_seed_protocol=decorrelated-slots-v3`, `expanded_action_policy=false`.
- Shared corrections: `electrode_gx_energy_correction=true`, `electro_rain_damage_correction=true`.
- Control: `electrode_gx_prize_trade_policy=false`.
- Alternate: `electrode_gx_prize_trade_policy=true`.
- Both workflows must finish; compare per-trial original seed, card-list hashes, recorded first player, action trace and disposition, observed Extra Energy Bomb attempts, earliest policy divergence, and actual outcome.
- Treat zero use/opportunity and incomplete games as informative **negative/no-exposure results**; do not discard or replace their denominator.
- A divergence at a possible activation is *not* evidence of increased win probability until legal resource availability, correct target selection, rule mechanics, and opponent decision quality are separately checked.

### Predicted failure modes and falsification

1. No source-dealt run reaches a board eligible for the narrow heuristic. Record zero exposure and stop short of judging policy strength.
2. The tactic declares Bomb but the mandatory selection hook attaches Energy to a different eligible recipient, violating the tactic's assumption that projected Lightning powers Active Alolan Raichu. This requires a target-allocation audit, not a victory claim.
3. Bot's `SimpleTactic` policy evaluates speculative states with live Card aliases. Opponent and candidate `Simulator` isolation is unqualified, so do not present terminal outcomes as paper-competitive results even if traces complete.

Baseline source: [prior same-revision corrected-vs-uncorrected rank-4 pair](../twinleaf/agent45-electrode-gx-empty-selection-chain.md) observed 0 Bomb actions in six source-dealt traces; the policy remained stock in both arms. Rule constraints are supported by the [official Japanese Extra Energy Bomb FAQ](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%9E%E3%83%AB%E3%83%9E%E3%82%A4%E3%83%B3GX&regulation_faq_main_item1=all).

## Observations

Pending paired, revision-matched workflow artifacts. No competitively qualified games or win-rate inference.

