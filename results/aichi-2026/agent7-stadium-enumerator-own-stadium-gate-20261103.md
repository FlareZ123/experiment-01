# Agent 7: Stadium enumerator conflicts with paper replacement rules

**3 November 2026 | source-code audit + archived native owner-root evidence.** Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Source-level defect

The pinned [ActionEnumerator](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/advanced-bot/action-enumerator.ts) omits *all* Stadiums when `player.stadium.cards.length > 0`. The attached Advanced Player's Rulebook, I.B-04, instead permits replacing the in-play Stadium with a **different named** Stadium when that player has not already played a Stadium this turn. The pinned [Store play-card reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/play-card-reducer.ts) has no own-Stadium blanket veto, and the [Stadium effect reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/play-trainer-effect.ts) explicitly discards the previous owner's Stadium on replacement.

The enumerator also compares `fullName` between held and current Stadium. The paper rule and Store compare printed **name**. Different-print `Path to the Peak` cards (Chilling Reign `swsh6-148`, Astral Radiance `swsh10-213`) provide an example in which the enumerator's name comparison could offer a paper-invalid same-named replacement. This is a conditional source-level false-positive finding, without an observed Store misplay.

## Authentic archived physical-deal evidence

The complete original rank5-versus-rank11 [Agent5 compiled native CI 41620156249](https://github.com/FlareZ123/experiment-01/actions/runs/41620156249) artifact **13222478134** was analyzed with [this read-only custody auditor](../../scripts/agent7-stadium-enumerator-custody-audit.cjs). One source rank5 physical owner (seat0, seed `912174767`, initial deal SHA256 `65c87abb4eb03985598acf3306a5169bb82a6b8a8fd021b630cb5c0f2318886a`) native-accepted `Path to the Peak CRE` at root ordinal **9**, global turn **5**. It later held `Sky Field ROS`, which the existing generic public frontier did not block, while native enumeration omitted it at owner root ordinals **14, 17, 19, 21** (turns **7, 9, 11, 13**) and Store accepted Pass at all four.

These are four correlated frames in **one physical game**, with the earlier different-name own Stadium a mechanism-consistent clue. The archive does not preserve contemporaneous public Stadium occupancy, so the exact cause of each omission and full paper legality remain **UNKNOWN**. The auditor explicitly avoids upgrading historical acceptance into live Stadium occupancy or verified legal alternative. Three pure Node tests passed locally; see [test source](../../tests/agent7-stadium-enumerator-custody-audit.test.cjs). No compiled native alternative action was executed.

## Consequence

An owner-information-safe Trainer planner must independently compare current Stadium's **name**, Stadium quota and public lock state. Enumerated offers are neither exhaustive nor reliable paper legality evidence. Next, record `ownPublic.stadium`, `opponentPublic.stadium` and owner turn quota at a genuine root; test replacing an own differently named Stadium and rejecting a different-print same-named Stadium. Preserve actual Store acceptance and zone transitions separately.

**No deck-ranking change:** 29/32 authenticated original Aichi 60s (ranks 23, 25, 28 missing), zero competitively qualified games, no selected final fixed 60, no demonstrated 99.5% win rate.
