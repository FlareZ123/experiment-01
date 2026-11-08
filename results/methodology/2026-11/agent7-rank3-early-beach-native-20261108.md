# Original rank-3 first-turn Tropical Beach: native actor-only Pass conversion

**Agent 7, 8 November 2026.** Frozen original rank-13 Regidrago versus rank-3 Snorlax canary. **Native-positive development result, zero competitively qualified games.**

## Actionable failure and solution

The existing selected-v8 shared actor-policy root can return `PassTurnAction` on the original Snorlax first turn despite holding a legal-to-play `Tropical Beach BWP 50` in a seven-card hand. The pre-existing `agent33-tropical-beach-lastchance.cjs` intentionally refuses an expected single-card draw and does not cover this particular opening. The original canary records the Snorlax as Active and both hands' owner/root decisions after real native setup.

The default-off `simulation/twinleaf/agent7-early-beach-after-pass.cjs` now offers `play-tropical-beach` only at an otherwise unsupported first- or second-global-turn owner root. On the next owner root, if Beach is now visibly in play and its once-per-turn effect is unused, it offers `use-tropical-beach`. The native Store handles the physical placement, draw and turn-end. Other actor-root alternatives retain priority; existing Stadiums are never blindly replaced. The decision uses the own hand, public board, Stadium clocks/locks and publicly known deck count. Its activation is opt-in via `AGENT7_EARLY_BEACH_DEV=true` from the canonical `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, which remains OFF by default.

## Successful genuine native execution

[**Native CI run 42525830704**](https://github.com/FlareZ123/experiment-01/actions/runs/42525830704), commit `9bd10dfb98175093f98a1596da0273d9a87a5e2a`, succeeded. It reused the existing [Agent2 manual v8 canary workflow](../../../.github/workflows/agent2-v8-common-owner-root-canary.yml) with input `agent7_early_beach=true` and the pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The preceding [baseline/initial action run 42525163864](https://github.com/FlareZ123/experiment-01/actions/runs/42525163864) verified the first Store-accepted Beach play. An intermediate strict run [42525557840](https://github.com/FlareZ123/experiment-01/actions/runs/42525557840) failed the researcher-created *instrumentation* gate because the `UseStadiumAction` lacked a player ID field; the genuine accepted-root ledger already recorded `UseStadiumAction` at ordinal 8 on turn 1. The instrumentation was corrected to attribute native Stadium use to the authenticated `state.activePlayer`, then rerun successfully.

The successful executable [`simulation/evaluation/agent7-v8-rank3-early-beach-native.cjs`](../../../simulation/evaluation/agent7-v8-rank3-early-beach-native.cjs) compares its explicit control and treatment using **exactly the same frozen two physical orientations, seed `290134`, source rank 3 original 60, candidate rank 13 original 60 and native cap 128**. Its exit gate now requires all of:

1. A native Store-accepted `PlayCardAction` whose acting owner's real held printing is `Tropical Beach BWP 50`.
2. Native public Stadium movement from absent to present, and hand count from seven to six.
3. A same-seat, same-global-turn native Store-accepted `UseStadiumAction` with that Beach visibly in play.
4. The actual owner's hand count returning to seven and deck count physically decreasing following Stadium use.

These conditions were all met in run 42525830704. The exact opening arm had Snorlax PGO Active, seven initial cards including Trainers' Mail ROS and Tropical Beach BWP 50. The prior native action tape also shows an opponent `PlayCardAction` after the Beach turn advanced, but the required later source own-turn continuation has not been certified by this short canary.

## Interpretation

This supplies a concrete **previously lost action → real play → real one-card draw** native conversion. The paper rule allows Tropical Beach to be used once per turn and ends that player's turn when it draws. The policy chooses this line only after the original canonical actor root has declined its other supported actions; it does not establish optimality compared with a concurrently held Trainer such as Trainers' Mail.

Agent38 independently implemented a more extensive prior [Trainers' Mail owner-Pass intervention](agent38-v8-first-real-pass-to-mail-four-arm-native-20261108.md), with five settled Items across four original rank-3 arms and genuine later owner/opponent action continuation. That existing work should be reused when planning a broader common policy. This Beach branch is a complementary option, with a distinct single-draw first-cycle window.

**Limits:** the complete game policies are unqualified and could make strategically poor choices; no complete competitive game, fixed-deck optimization, opponent-field win rate or 99.5% result is implied. The full 32 published opposing inventories are still incomplete, and exact historical paper-printing legality is unresolved. Both printed 60-card inventories were held unchanged during this intervention.
