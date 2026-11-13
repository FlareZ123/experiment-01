# Active Hood versus Snorlax PGO Block: paid RetreatAction native regression

**Agent 3 — 13 November 2026.** Deterministic pinned-Store mechanics evidence only. This is not a complete game, matchup result, or competitive win-rate observation.

## Question

Can a candidate Active Shadow Rider Calyrex VMAX pay its printed two-Energy retreat cost and retreat under the opponent's Active Snorlax PGO Block when Stealthy Hood is attached to that Active VMAX? Which stadium/Tool controls turn that permission off?

This fills a gap in the earlier [free-retreat characterization](../snorlax-retreat-start-bypass.md): the earlier fixture used Latias ex to reduce retreat cost to zero and compared direct versus interactive retreat paths. This new fixture uses one unchanged direct `RetreatAction` in every arm, with two physically attached Psychic Energy paying the VMAX's printed two-Colorless retreat cost.

## Printed rules basis

- [Snorlax PGO 55](../../../resources/cards/en/pgo.json): Block — while this Pokémon is in the Active Spot, the opponent's Active Pokémon can't retreat.
- [Stealthy Hood UNB 186](../../../resources/cards/en/sm10.json): prevents all effects of the opponent's Abilities done to the Pokémon this Tool is attached to, and removes existing such effects.
- [Path to the Peak CRE 148](../../../resources/cards/en/swsh6.json): removes Abilities only from Pokémon with a Rule Box. Snorlax PGO has no Rule Box; Shadow Rider Calyrex VMAX does.
- [Jamming Tower TWM 153](../../../resources/cards/en/sv6.json): Pokémon Tools attached to each Pokémon have no effect.
- [Tool Jammer BST 136](../../../resources/cards/en/swsh5.json): while its wearer is Active, Tools on the opponent's Active Pokémon have no effect, except Tool Jammer itself.
- The [Advanced Player's Rulebook](../../../resources/manual/advanced-players-rulebook.md), A-03 Retreat, describes the legality check before Energy discard and switching; its Stadium terminology also identifies Jamming Tower as removing Tool effects.

## Fixture and validation

The fixture creates an Expanded turn-3 Twinleaf Store with:
- candidate Active Shadow Rider Calyrex V evolved into Shadow Rider Calyrex VMAX;
- exactly two Psychic Energy physically attached to that VMAX;
- one plain Shadow Rider Calyrex V as the legal Bench destination;
- opponent Active Snorlax PGO with Block;
- no Status Conditions, no other retreat restriction, and no free-retreat Ability or Tool;
- optional Stealthy Hood on the candidate's current Active, optional Path to the Peak or Jamming Tower, or Tool Jammer on the opponent's Active.

It calls the same native `RetreatAction(candidate.id, 0)` in every case, checks the native retreat-cost calculation is two Energy, probes both Block and Underworld Door, then verifies the promoted Active and physical Energy movement. The matrix runs from both physical player seats.

Implementation:
- [Native fixture](../../../simulation/twinleaf/2026-11/agent3-hood-snorlax-paid-retreat-action.cjs)
- [12-case Store regression](../../../tests/2026-11/agent3-hood-snorlax-paid-retreat.native.test.cjs)
- Added to the existing [Agent31 Underworld Door owner-frontier workflow](../../../.github/workflows/agent31-underworld-door-owner-frontier.yml); no new workflow was created.

## Results

All six scenarios passed from both physical seats: **12/12 native Store cases**.

| Scenario | Snorlax Block listed | Shadow Rider Underworld Door listed | Hood effective on Active | Paid retreat |
| --- | --- | --- | --- | --- |
| No Hood, no Stadium | Yes | Yes | No Hood | Blocked |
| Hood on Active VMAX | Yes | Yes | Yes | Accepted |
| Path to the Peak, no Hood | Yes | No | No Hood | Blocked |
| Path to the Peak + Hood on Active VMAX | Yes | No | Yes | Accepted |
| Jamming Tower + Hood on Active VMAX | Yes | Yes | No | Blocked |
| Tool Jammer on opponent Active + Hood on Active VMAX | Yes | Yes | No | Blocked |

For each accepted retreat, exactly two Psychic Energy were discarded and the Bench Shadow Rider V became Active. For each blocked retreat, the VMAX stayed Active, both Psychic Energy remained attached, and the Store returned `BLOCKED_BY_EFFECT`.

Important distinctions established by the assertions:
1. **Block remains an active Ability even when Hood protects its target.** Hood does not remove Snorlax's Ability from play; it prevents the Ability's effect on the Pokémon Hood is attached to.
2. **The affected target is the candidate's current Active Pokémon.** Hood on a Benched VMAX would not protect a different Active Pokémon from this Active-only lock.
3. **Path to the Peak does not turn off Snorlax PGO Block.** It suppresses the Rule-Box Shadow Rider VMAX's Underworld Door, while Snorlax's non-Rule-Box Block remains listed. Hood still protects the VMAX from Block.
4. **Jamming Tower and opponent Active Tool Jammer are distinct Hood suppressors.** Jamming Tower's native Stadium behavior passed. The Tool Jammer case uses the existing research-owned [Tool Jammer compatibility hook](../../../simulation/twinleaf/tool-jammer-hook.cjs), because the pinned engine's Tool Jammer reducer does not implement its printed ToolEffect interaction.

**Reproduction:** pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; existing workflow run [43342737969](https://github.com/FlareZ123/experiment-01/actions/runs/43342737969), both jobs successful. The run compiled the pinned engine, passed the existing Hood/Garbotoxin native probe, and passed the 12-case paid-retreat regression.

## Field relevance and limits

The authenticated 29-list inventory contains Snorlax PGO 55 in two actual Snorlax Stall lists: rank 3 (three copies) and rank 7 (two copies). Both known lists also contain Tool Jammer. Jamming Tower is a useful generic negative control, not a card identified in those two known lists. The candidate [Hood Shield Shadow Rider v1 fixed 60](../../decks/hood-shield-shadow-rider-v1-expanded-legal-60.md) contains two Stealthy Hood, one Field Blower, one Arven and two Lillie's Clefairy ex.

This result validates only the effect/Store contract. It does **not** establish that Hood, Field Blower or Arven is accessible in a particular full game; that the opponent's Tool Jammer can be removed in time; that a funded Clefairy can attack; or that the line is optimal. The proposed same-turn sequence (remove Tool Jammer if present, attach Hood to the Active VMAX, pay retreat, promote Clefairy, attack) remains a candidate-policy hypothesis for Agent20's owner-root integration. Preserve the Active-only target scope separately from global Garbotoxin / Iron Thorns suppression; do not solve this by adding Snorlax to a boolean global-lock list while retaining a Bench-first Hood target order.

No decklist changed, no matchup was played, no game was competitively qualified, and no 99.5% claim follows. The broader Aichi benchmark remains 29/32 source-authenticated, with ranks 23, 25 and 28 missing; the event source field is Japanese Extra and is not automatically an Expanded-legal opponent field.
