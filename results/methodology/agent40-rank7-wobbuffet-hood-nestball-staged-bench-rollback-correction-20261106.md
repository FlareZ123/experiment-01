# Rank7 Wobbuffet / Vileplume: staged native Nest Ball error traced to absent Bench slots and stale Store reference

**Agent40 | 6 November 2026 | pinned upstream source review, two compiled manual CI diagnostics. No full-paper game evidence.**

## Prior claim and falsification

The [v1 native Wobbuffet/Stealthy Hood matrix](agent40-rank7-wobbuffet-hood-native-ambiguous-item-error-20261106.md) had six apparent paper-parity rows out of eight. Its two mismatches both showed original rank7 Wobbuffet Active, candidate Vileplume AOR unprotected by Stealthy Hood, `IS_ABILITY_BLOCKED(Vileplume)` true, and an attempted original owner `Nest Ball SVI` with the error `CANNOT_PLAY_THIS_CARD`. The report correctly withheld a proven engine-bug claim. This newer inspection identifies **two independent fixture defects**.

1. **No actual native empty Bench slots:** v1 constructed fresh pinned `Player` instances with `bench=[]`, then pushed exactly one *occupied* `PokemonCardList` per owner. The pinned `NestBall` implementation only allows play when `player.bench.filter(slot => slot.cards.length===0).length>0`. The visually conceivable four vacant spaces had not been represented in the native State. Thus `CANNOT_PLAY_THIS_CARD` on either supposedly unlocked row is explained by the fixture's lack of an engine-recognized empty slot. This failure cannot diagnose Vileplume's Ability-lock semantics.
2. **Post-error reference did not follow authoritative Store:** pinned `Store.reduce()` uses `deepClone(state)` and on root-action rejection replaces `store.state` with that snapshot. V1 continued reading `x.originalPlayer`, an object captured *before* dispatch. Such a stale object can retain partially mutated hand/zones despite the restored authoritative state, invalidating the v1 implication from `Nest Ball absent from hand` to `Nest Ball consumed`.

Upstream source at pinned **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**:
- [Player Bench initialization](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/state/player.ts)
- [Nest Ball's actual empty-slot check and search prompt](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-scarlet-and-violet/nest-ball.ts)
- [Store rollback on error](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts)
- [Shuffle prompt / WaitPrompt sequence](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/prefabs.ts)

## Corrected native staging and test state

[Version 2 staged source code](../../simulation/twinleaf/agent40-rank7-wobbuffet-hood-native-v2.cjs) conserves **both complete authentic printed 60s** and allocates five native Bench slots for each side: one occupied and four empty. It exposes original rank7 `Nest Ball SVI181`, verifies an eligible original `Regirock XYP49` remains in the actual deck after six Prizes, and dispatches on the actual source seat. It reselects the owner from `store.state.players` after each action. A no-Vileplume positive control is included for both seats, alongside the Wobbuffet Active/Benched × Stealthy Hood absent/present 8-row matrix, for **10 staged conditions** in all.

[Manual compiled CI run 42207797850](https://github.com/FlareZ123/experiment-01/actions/runs/42207797850) failed before testing the Item line: the initial target `Snorlax PGO` was entirely Prized by deterministic staging. The target was changed to source-deck-resident `Regirock XYP`.

[Manual compiled CI run 42208322814](https://github.com/FlareZ123/experiment-01/actions/runs/42208322814), head `a01189dc89063b2e7a48b7d89939dac435a8d82e`, **observed six rows passing its then-current strict parity assertion and four failing only because the test incorrectly expected an immediately completed Item**. In both source-seat orientations, each of the four positive cases (no Vileplume or Wobbuffet Active suppressing unprotected Vileplume) had:
- `rootError=null`, an actual pending source-owned `Choose cards` search prompt, and Nest Ball in the temporary Trainer play zone;
- target `Regirock XYP` selected and physically moved onto the source Bench;
- no immediate discard of Nest Ball and one outstanding prompt, a `Shuffle deck` continuation.

This is a **real native Store root and search-to-Bench transition** on each source orientation and a successful early response to the suppressed Item lock. The strict end-of-effect claim still fails because the native `SHUFFLE_DECK` implementation emits a `Shuffle deck` prompt and subsequent `WaitPrompt`. Therefore this CI run certifies *partial action progress*, not complete Item settlement.

The v2 source has since been updated at commit `a7748299a8872bac68f38dba9d2ef1d1c182cc1e` to supply a seeded shuffle order, resolve the nonvisual wait prompt and assert final Item discard, no outstanding prompts and 60 cards in each physical zone partition. **That newest revision has not yet passed compiled CI.** An attempted further manual run was rejected by the execution safety gate; do not claim the corrected full-sequence test passed or substitute another trigger. See [v2 assertions](../../tests/agent40-rank7-wobbuffet-hood-v2.native.test.cjs). The original 6/8 archive remains preserved as diagnostic history.

## Research impact and limits

The old two v1 “could not play Nest Ball” mismatches are **invalid test evidence**, because their native Bench was fully occupied by construction. The follow-on v2 run supports a narrow, conditioned **actual owner-Item search plus Basic Bench placement** while Wobbuffet suppresses Vileplume and before completing shuffle. Native item consumption and full paper-game parity remain open pending an admissible run of the latest correction.

Any other headless staged game should independently certify:
- native empty Bench slots rather than inferred physical vacancies;
- source-owned searchable Basic actually remaining after Prizes;
- distinction between temporary play zone, pending prompts, final discard and root rejection;
- authoritative `store.state` inspection after rejected actions, rather than stale Player references.

No full natural game, original opponent policy, source Faba/Jet counterturn, official timed match, selected fixed 60, or empirically supported win rate is established. Field remains **29/32 authenticated original lists**, missing ranks **23/25/28**; **zero competitively qualified games**.
