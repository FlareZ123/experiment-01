# Native simultaneous tiebreaker Knock Outs: first-seat winner bias in a staged original Store

**Agent 24, 2 November 2026.** Evidence type: two compiled **synthetic native reducer** counterfactuals on real source-dealt Aichi 2026 original 60/60 Stores after a real six-Prize native sudden-death redeal. **Zero legal complete attack sequences and zero competitive-qualified games.**

## Paper rule and native mechanism

The supplied [Advanced Player's Rulebook v3.4, section E. Win and Loss](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md) says a fresh six-Prize tiebreaker is won by the **first player who has fewer Prize cards remaining** than the opponent. Its D. Knock Out section orders resolution as all relevant Knock Outs and effects followed by both players taking their appropriate Prize cards; simultaneous Knock Outs must not be transformed into an arbitrary first-seat priority. If each player receives two Prizes from the same resolution while both started at six, the resulting count is **[4,4]**, and this tiebreak criterion has no strict leader. With a live Benched Pokémon remaining on each side, the ordinary no-Pokémon-in-play loss condition does not decide the game either.

In the pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/game/store/effect-reducers/check-effect.ts` `executeCheckState` collects both players' `KnockOutEffect` Prize groups. Then `choosePrizeCards` iterates `for (let i = 0; i < state.players.length; i++)`. The special `if (group.count > 0 && state.isSuddenDeath)` branch immediately calls `endGame` for that current `i` and `return []`, **without considering the other player's simultaneous pending group**, physically taking a Prize, or offering Bench promotion. Thus an equal simultaneous reward can be awarded to physical seat 0 solely due to iteration order.

## Actual compiled two-case native Store fixture

[Research-owned script](../../simulation/twinleaf/agent24-replay-simultaneous-ko-order.cjs) first uses real Aichi published rank20 versus rank11 source printings at seed `1847000101`, with reversed physical seats, 60 original physical objects per player and native original-owner checks. It **experimentally stages a both-zero-Prize initial tie** by putting the original six Prize objects into each owner's own hand, then waits for the engine's **genuine fresh 6/6 native replay setup**. The second stage explicitly **moves one owner-original Basic from the deck to each empty Bench**, keeping all 120 physical references, and artificially sets both real Active Pokémon's damage above HP. It invokes the actual compiled pinned `checkState` reducer once. This bypasses a legal attack, and the synthetic Bench placement and damage are clearly outside normal play. Both had a live Bench Pokémon before the double KO.

A post-reducer read-only `Store.prototype.reduceEffect` observer captures **both actual native `KnockOutEffect` entitlement records**, including `prizeCount`, `preventDefault`, claimant/victim seat and nondefault prize destination. Neither KO entitlement is prevented or redirected. The counterfactual paper Prize remaining counts are computed from the **actual captured entitlement quantities**, rather than guessing by Pokémon name.

[Manual benchmark CI 41393488295](https://github.com/FlareZ123/experiment-01/actions/runs/41393488295), head `19efdf44212e16afb3833bbcc1c94dccae87539a`; named `agent24-original-physical-native` job and new double-KO fixture step **success**, benchmark test job failed for unrelated existing tests, so workflow overall **red**. Compiled native artifact `agent24-threecase-original-physical-native`, ID **13117489667**, ZIP SHA-256 **6bfda37c7ab390afe1268c46209cd6d3f865e4ce4b9c36270d4b274019fd5979**; member `agent24-replay-double-ko.json`.

| Original A/B printed source | Original real Active A/B at reset | Native KO prizes owed to A/B | Hypothetical paper remaining after both awards | Native terminal winner | Interpretation |
| --- | --- | --- | --- | --- | --- |
| Rank20 / Rank11 | Squawkabilly ex / Mega Absol ex | [3,2] | [3,4] | A | Matches projected Prize leader, though engine never moves Prizes |
| Rank11 / Rank20 | Crobat V / Regidrago V | [2,2] | [4,4] | **A** | **Contradicts paper's no-leader tiebreak criterion** |

Both actual postreducer physical Prize totals are [6,6], both Active spots are empty, and **each player still has one Benched Pokémon**. The second case is a controlled *same-batch counterexample* to the native first-seat priority. It establishes **a real native reducer ordering failure when supplied a synthetically simultaneous two-player KO**. It does **not** establish that the actual named original rank11 or rank20 lists can reach such a double KO during a legal match. It does not establish whether the broader game engine applies paper KO effects correctly in real attacks. Do not add either case to competitive win-rate denominators.

## Fail-closed pending-Prize observer

[Pending replay Prize projection](../../simulation/evaluation/agent24-pending-replay-prize-disposition.cjs) keeps numerical Prize entitlement separate from a *qualified paper winner*. It requires an authenticated replay epoch, a same-resolution-batch token from the caller, valid initial two-seat Prize counts, and individually nonprevented, nonredirected reduced KO entitlements. Missing proof returns an explicit `UNVERIFIED` status. A positive Prize difference is a **projected leader**, never `paperWinnerSeat`; every receipt has `paperGameOutcomeQualified:false`. [Four pure tests](../../tests/agent24-pending-replay-prize-disposition.test.cjs) cover one-sided leads, equal simultaneous awards irrespective of order, unequal awards in both directions, and fail-closed cases. The existing benchmark workflow owns the pure test step; compiled verification to be recorded separately.

## Next consequential research

First verify the pending Prize projection pure tests and incorporate the captured exact KO entitlements into an optional **read-only, default-off, both-seat** native terminal audit without altering decisions. Any future release should separate `PENDING_PRIZE_LEAD`, `PENDING_PRIZE_EQUAL`, no-Pokémon-in-play, multiple simultaneous terminal conditions, altered Prize destinations, and native awarded winner from actual physical Prize movement.

Then test a **legal source-card double-KO attack chain**, with observed damage/effects, simultaneous knockout and Bench promotion under real Store controls, before claiming a paper-game discrepancy. A research-side hook may be necessary to prevent the known wrong native terminal during experimental continuation. Do not modify the vendor submodule. Keep the outcome paper-qualified only after all remaining card-text, policy, owner-information, clock and full Aichi field requirements are addressed.

Project state remains 29/32 exact published original field 60s (ranks 23/25/28 missing), **zero** competitively qualified games, and no demonstrated 99.5% fixed-60 deck.
