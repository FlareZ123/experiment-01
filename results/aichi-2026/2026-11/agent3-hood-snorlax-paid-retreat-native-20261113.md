# Active Hood versus Snorlax PGO Block: paid RetreatAction native regression

**Agent 3 — 13 November 2026.** Deterministic pinned-Store mechanics evidence only. This is not a complete game, matchup result, or competitive win-rate observation.

## Question

Can a candidate Active Shadow Rider Calyrex VMAX pay its printed two-Energy retreat cost and retreat under the opponent's Active Snorlax PGO Block when Stealthy Hood is attached to that Active VMAX? Which stadium/Tool controls turn that permission off?

This fills a gap in the earlier [free-retreat characterization](../../twinleaf/snorlax-retreat-start-bypass.md) and the explicit paid-retreat counterline left open in [Agent46's 58-game Hood cohort audit](../../methodology/2026-11/agent46-hood-full58-attack-conversion-audit-20261112.md): the earlier fixture used Latias ex to reduce retreat cost to zero and compared direct versus interactive retreat paths. This new fixture uses one unchanged direct `RetreatAction` in every arm, with two physically attached Psychic Energy paying the VMAX's printed two-Colorless retreat cost. The original matrix validates the retreat leg. The later staged-sequence addendum below also exercises the complete Field Blower/Hood/paid-retreat/Clefairy attack chain in the pinned Store. Neither establishes source-dealt access or a complete game.

## Printed rules basis

- [Snorlax PGO 55](../../../resources/cards/en/pgo.json): Block — while this Pokémon is in the Active Spot, the opponent's Active Pokémon can't retreat.
- [Stealthy Hood UNB 186](../../../resources/cards/en/sm10.json): prevents all effects of the opponent's Abilities done to the Pokémon this Tool is attached to, and removes existing such effects.
- [Path to the Peak CRE 148](../../../resources/cards/en/swsh6.json): removes Abilities only from Pokémon with a Rule Box. Snorlax PGO has no Rule Box; Shadow Rider Calyrex VMAX does.
- [Jamming Tower TWM 153](../../../resources/cards/en/sv6.json): Pokémon Tools attached to each Pokémon have no effect.
- [Tool Jammer BST 136](../../../resources/cards/en/swsh5.json): while its wearer is Active, Tools on the opponent's Active Pokémon have no effect, except Tool Jammer itself.
- The [Advanced Player's Rulebook](../../../resources/manual/EN_advanced_manual-2025-transcription-structured.md), A-03 Retreat, describes the legality check before Energy discard and switching; its Stadium terminology also identifies Jamming Tower as removing Tool effects.

## Fixture and validation

The fixture creates an Expanded turn-3 Twinleaf Store with:
- candidate Active Shadow Rider Calyrex V evolved into Shadow Rider Calyrex VMAX;
- exactly two Psychic Energy physically attached to that VMAX;
- one plain Shadow Rider Calyrex V as the legal retreat destination, plus an optional separate Benched Shadow Rider VMAX carrying Hood for the target-scope negative control;
- opponent Active Snorlax PGO with Block;
- no Status Conditions, no other retreat restriction, and no free-retreat Ability or Tool;
- optional Stealthy Hood on the candidate's current Active, optional Path to the Peak or Jamming Tower, or Tool Jammer on the opponent's Active.

It calls the same native `RetreatAction(candidate.id, 0)` in every case, checks the native retreat-cost calculation is two Energy, probes both Block and Underworld Door, then verifies the promoted Active and physical Energy movement. The matrix runs from both physical player seats.

Implementation:
- [Native fixture](../../../simulation/twinleaf/2026-11/agent3-hood-snorlax-paid-retreat-action.cjs)
- [14-case Store regression](../../../tests/2026-11/agent3-hood-snorlax-paid-retreat.native.test.cjs)
- Added to the existing [Agent31 Underworld Door owner-frontier workflow](../../../.github/workflows/agent31-underworld-door-owner-frontier.yml); no new workflow was created.

## Results

All seven scenarios passed from both physical seats: **14/14 native Store cases**.

| Scenario | Snorlax Block listed | Shadow Rider Underworld Door listed | Hood effective on Active | Paid retreat |
| --- | --- | --- | --- | --- |
| No Hood, no Stadium | Yes | Yes | No Hood | Blocked |
| Hood on Active VMAX | Yes | Yes | Yes | Accepted |
| Hood on a Benched VMAX while a different VMAX is Active | Yes | Yes | No on affected Active | Blocked |
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

## Source-scoped Hood policy contract

The Snorlax result should be integrated into a source/target model, not another global-lock boolean. The following table is a policy contract; **only the Snorlax row and the Tool-suppression controls are exercised by this regression**. The other source classifications are rules/card-text-derived and need their own native tests before being treated as simulator evidence.

| Opponent source | Effect scope | Source has Rule Box? | Path to the Peak | Hood attachment target |
| --- | --- | --- | --- | --- |
| Iron Thorns ex — Initialization | Global Ability suppression | Yes | Suppresses the source | Own Ability-dependent Pokémon; a Benched VMAX may be preferred |
| Garbodor — Garbotoxin | Global Ability suppression | No | Does not suppress the source | Own Ability-dependent Pokémon; a Benched VMAX may be preferred |
| Snorlax PGO — Block | Opponent Active retreat prohibition | No | Does not suppress the source | Own current Active only |

Jamming Tower disables Tools globally. Tool Jammer on the opponent's Active disables Tools on the candidate's Active, so it specifically defeats an Active-Hood answer to Snorlax Block. For global-lock answers, Tool Jammer on the opponent's Active does not by itself suppress a Hood attached to the candidate's Bench. This source/target distinction is why a single `hasLiveOpponentAbilityLock` boolean plus one fixed target order is insufficient.

## Field relevance and limits

The [authenticated 29-list inventory](../full-decklists.json) contains Snorlax PGO 55 in two actual Snorlax Stall lists: rank 3, Haruto Miki (three copies), and rank 7, Hiroto Fuji (two copies). Both known lists also contain one Tool Jammer. Jamming Tower is a useful generic negative control, not a card identified in those two known lists. The candidate [Hood Shield Shadow Rider v1 fixed 60](../../decks/hood-shield-shadow-rider-v1-expanded-legal-60.md) contains two Stealthy Hood, one Field Blower, one Arven and two Lillie's Clefairy ex.

The staged sequence now verifies that the pinned Store accepts the complete owner-visible action chain when its cards and board are supplied: Field Blower removes opponent Active Tool Jammer when present; Hood attaches to the currently affected Active VMAX; the VMAX pays two Psychic Energy to retreat; the seven-Energy Clefairy is promoted and attacks. This does **not** establish that Hood, Field Blower or Arven is accessible in a particular full game, that the source hand can produce the sequence, or that the line is optimal. This is a concrete example of the [lock-effects and Active Move Realism concepts](../../../resources/human_concepts.md): lock sources have different affected-target scopes, and a technically executable line is not realistically available until its Supporter, Item, Tool, retreat and Bench costs are jointly satisfied. The complete sequence remains a staged mechanics result, not Agent20's released candidate policy or a matchup result. Preserve the Active-only target scope separately from global Garbotoxin / Iron Thorns suppression; do not solve this by adding Snorlax to a boolean global-lock list while retaining a Bench-first Hood target order.

No decklist changed, no matchup was played, no game was competitively qualified, and no 99.5% claim follows. The broader Aichi benchmark remains 29/32 source name/count-authenticated, with ranks 23, 25 and 28 missing; **29/32 is not 29/32 Expanded-eligible opponents**. Ranks 3, 6, 7, 24 and 29 contain 14 copies of the Japanese-only print identities Player's Ceremony S-P 127, Palace Book SM-P NAN25 and Palace Belt BW-P 153, so those five lists are not unchanged international Expanded lists; see the [original-29 Japanese-only promo census](agent6-japanese-only-promos-original29-20261104.md) and [card identity index](../japanese-only-cards.md). The remaining 24 lists still require full Expanded legality and physical-printing review. The source event is Japanese Extra and is not automatically an Expanded-legal opponent field.


## Complete staged sequence addendum (13 November 2026)

Agent43's follow-up asked for one native sequence rather than another isolated retreat matrix. Extended the existing helper and test file; no new workflow or repeated 14-case matrix was created.

The new helper, completeHoodedSnorlaxSequence, constructs a staged Expanded Store with:
- candidate Active Shadow Rider Calyrex VMAX carrying exactly two Psychic Energy;
- five candidate Benched Pokémon, including Lillie's Clefairy ex with seven Psychic Energy;
- opponent Active Snorlax PGO with 10 prior damage and five Benched Pokémon;
- owner-visible Field Blower and Stealthy Hood in the candidate's hand;
- optional Tool Jammer on Snorlax or Path to the Peak.

It dispatches actual native actions and resolves their prompts in order. When Tool Jammer is present, Field Blower targets the opponent's Active Pokémon and the exact Tool Jammer moves to the opponent's discard before Hood is attached. When it is absent, Field Blower is not played. Hood is attached to the current Active VMAX using the acting player's native Bottom-player target; the same two-Energy RetreatAction then promotes the seven-Energy Clefairy. With five Benched Pokémon on each side, the printed Full Moon Rondo formula is 220 damage. Snorlax is discarded and exactly one Prize is taken. The Path to the Peak arm still lists Snorlax Block while suppressing Shadow Rider VMAX's Underworld Door; Hood protects the retreating Active.

**Result: 4/4 complete-sequence cases passed** (two positive board variants × both physical seats) in CI run [43369854490](https://github.com/FlareZ123/experiment-01/actions/runs/43369854490). The same run also passed the original 14/14 Active-versus-Bench Hood matrix and the existing Hood/Garbotoxin/Tool Jammer native probe. Both workflow jobs succeeded after checking out and compiling pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

The sequence is mechanics evidence only. Cards and board state are staged, not dealt from the fixed 60; no Arven search, hand-access probability, source-game policy decision, opponent response, complete game, paper qualification, matchup observation, or competitive win-rate evidence is established. The existing negative controls remain unchanged: no Hood, Hood on a different Benched VMAX, Jamming Tower, and opponent Active Tool Jammer without Field Blower removal continue to block the retreat in the original matrix. The Tool Jammer suppression negative uses the existing research-owned compatibility hook because the pinned reducer lacks the printed ToolEffect interaction; the positive Field Blower removal itself is an actual native Item action and prompt resolution.
