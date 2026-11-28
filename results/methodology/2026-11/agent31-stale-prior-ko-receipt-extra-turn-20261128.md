# Stale prior-opponent-turn KO receipt after an extra turn

**Date:** 2026-11-28  
**Severity:** High-confidence legality/input-contract defect in the pinned Twinleaf integration and Agent46's two-profile candidate worker.  
**Evidence class:** Source-level engine trace and exact worker inspection. This is not a played-game observation, native match, matchup result, or win-rate estimate.

## Finding

The current public event receipt can report `priorOpponentTurnKO.any === true` on a player's turn even though the opponent's immediately preceding turn contained no Knock Out. The pinned engine stores the KO condition as an owner-side Boolean and clears it only when that owner ends a turn. If that owner's turn is skipped by an opponent extra-turn effect, the owner never gets the intervening EndTurnEffect that would clear the old flag.

Agent46's current worker treats that Boolean as sufficient eligibility evidence for **Raihan**, **Teammates**, and **Unfair Stamp**. This can therefore select a Supporter or Item whose printed condition was not met during the immediately preceding opponent turn. The same stale Boolean also enables the Battle Compressor → VS Seeker → Raihan/Teammates routes.

## Deterministic source-level counterexample

Let A be the opponent and B the candidate player.

1. During A's turn **t**, A Knocks Out one of B's Pokémon. In pinned Twinleaf `game-effect.ts`, the KO reducer sets B's `pokemonKnockedOutDuringOpponentsLastTurn = true` and appends a tag entry when the KO occurs during the opponent's turn.
2. A uses **Dialga-GX — Timeless-GX**, which sets A's `usedTurnSkip = true`. Its printed effect explicitly takes another turn and skips the between-turns step.
3. At A's first EndTurnEffect, `initNextTurn` keeps A as the active player when `usedTurnSkip` is true, but still increments `state.turn`. A therefore receives turn **t+1** without B taking a turn.
4. Assume A makes no Knock Out during turn **t+1**. At the end of A's extra turn, the EndTurnEffect reset block clears fields on `effect.player` (A), not on B. B's old KO Boolean and tag entries remain set.
5. B now begins turn **t+2**. B's immediately preceding opponent turn was A's **t+1**, which had no Knock Out, but the stale B Boolean is still true.

This is not hypothetical turn accounting: the pinned `initNextTurn` increments `state.turn` even when it keeps the same active player. The KO reset is in the EndTurnEffect for the player whose turn is ending; it does not clear the other player's flag when that player's turn is skipped.

### Exact source locations

- Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Local `advanced-players-rulebook.md`, E-11 (page 56): defines this wording as a check of whether an eligible Pokémon was Knocked Out during the opponent's last turn, with Fezandipiti ex's Flip the Script as an example. This confirms the condition is turn-specific, not a carry-forward KO flag.
- `ptcg-server/src/game/store/effect-reducers/game-effect.ts`, KO reducer around lines 591–605: sets the knocked-out owner's Boolean and appends `pokemonKnockedOutLastTurnEntries`.
- `ptcg-server/src/game/store/effect-reducers/game-phase-effect.ts`, `initNextTurn` around lines 55–75: if `player.usedTurnSkip`, activePlayer is not switched, but `state.turn++` still occurs.
- Same file, `EndTurnEffect` around lines 230–252: the KO flags and tag entries are cleared only on the local `player` when `!player.usedTurnSkip`; the opponent's flags are not cleared.
- `ptcg-server/src/sets/08-sun-and-moon/set-ultra-prism/dialga-gx.ts`: Timeless-GX sets `player.usedTurnSkip = true` and its text says to take another turn after this one.
- `simulation/twinleaf/agent8-public-event-receipt.cjs`, blob `af39ae9a23ea1333bcabab422b92d5b9df5f30a1`: copies the two native KO Booleans directly into `priorOpponentTurnKO`; it supplies no KO turn stamp.
- Main `simulation/evaluation/2026-11/agent36-v3-runner.cjs`, blob `0183fa299f6a7c14e002203b5a8ade933f587316`, around line 2487: calls `eventReceipt(request.state, actorSeat, null, null)`. Thus the current runner does not supply the turn-stamped prior-attack tracker either; there is no per-turn KO tracker in this call path.
- `simulation/twinleaf/agent24-native-ko-batch-observer.cjs` already wraps `Store.prototype.reduceEffect` and observes native `KnockOutEffect` events. It is a narrow simultaneous-KO audit, not a live per-turn ledger, but its hook is a practical starting point for capturing `state.turn` at the actual KO event.
- `simulation/twinleaf/agent8-ko-supporter-options.cjs` also gates its response options on the same un-stamped `priorOpponentTurnKO.any` Boolean.
- Agent46 branch `agent46/two-profile-policy-successor-20261127-v2`, worker blob `813f22634f8f162d1da3659ad5c5d2d6da32103b`: `raihanNeed` gates on `priorOpponentTurnKO.any`; `supporterNeedScore` gives Teammates positive value from the same Boolean; Compressor supporter recovery uses those scores.
- Same branch, protocol blob `cf49a009525a9a5af3a89f5964eb563e0d9d9e26`: validates the KO fields only as nullable Booleans. It validates the receipt's current `turn`, but has no KO-event turn to compare with the immediately preceding opponent turn.
- Existing Agent46 root tests use synthetic `{ priorOpponentTurnKO: { any: true } }` receipts; they do not model the Dialga extra-turn sequence or establish KO-turn freshness.

## Benchmark relevance

The authenticated Aichi source ledger `results/aichi-2026/full-decklists.json` (blob `ae773f6201d7aa69d31914dbfee66f3fba692200`) contains Dialga-GX in ranks **1, 10, 12, 13, 14, 18, 20, 21, 27, 30, and 32**: 11 of the 29 currently authenticated lists. Both unchanged candidate 60s contain one Raihan, one Teammates, and one Unfair Stamp (plus one Battle Compressor and two VS Seeker). All three prior-KO-gated cards therefore occur in the actual candidate inventories; Unfair Stamp's printed condition uses the same immediately preceding-opponent-turn KO wording. This is a benchmark-relevant legal-action defect, not an exotic unsupported card interaction.

## Required correction

Do not use the native owner-side KO Boolean as turn-fresh evidence.

1. Extend the research-owned Store event tracker to record KO events against the actual `state.turn` in which they occur. Maintain a per-owner, per-turn summary for both “any KO” and “KO by attack”; do not infer freshness from the native Boolean or the un-stamped `pokemonKnockedOutLastTurnEntries` array.
2. Emit a separate stamped receipt, for example `priorOpponentTurnKO: { turn, any, byAttack }`, where `turn` identifies the immediately preceding opponent turn being summarized. At actor turn `view.globalTurn`, accept the summary only when its turn equals `view.globalTurn - 1`. If the tracker cannot certify that turn, emit null/unknown rather than carrying forward a stale true. The current V3 runner passes `null, null` to the receipt's history arguments, so no turn-stamped history is presently available in that call path.
3. Tighten the worker protocol's exact-key and semantic validation. Centralize a `hasFreshPriorOpponentTurnKO` predicate and use it for Teammates, Raihan, Unfair Stamp search/use planning, and all Compressor/VS Seeker paths. A current-turn receipt stamp alone is not evidence that the KO happened in the previous opponent turn.
4. Keep the native/vendor code unchanged; implement the tracker at the research adapter/Store-hook boundary.


## Concrete adapter implementation seam

The existing `simulation/twinleaf/agent24-native-ko-batch-observer.cjs` already wraps `Store.prototype.reduceEffect` and sees each native `KnockOutEffect`. Extend or reuse that research-owned hook to record the **pre-reducer** `state.turn` and victim seat for every KO, using the same `duringOpponentsTurn` predicate as the pinned KO reducer (phase is `PLAYER_TURN` or `ATTACK`, and the active player is the victim's opponent). Maintain per-seat, per-turn `any` and `byAttack` summaries. The runner can then pass the summary for `state.turn - 1` into `publicEventReceipt`; a tracker installed before the game starts can distinguish a known-empty turn from unavailable history. Do not infer the turn from the persistent Boolean or the un-stamped tag array. The current main runner's `eventReceipt(..., null, null)` call must remain fail-closed until an authorized tracker is wired in.

## Minimal regression matrix

- **Positive:** KO on opponent turn t; no extra turn; candidate turn t+1 → eligible.
- **Negative:** KO on opponent turn t; opponent uses Timeless-GX for turn t+1 and makes no KO; candidate turn t+2 → ineligible.
- **Positive after extra turn:** KO occurs during the opponent's extra turn t+1; candidate turn t+2 → eligible.
- Exercise both physical seats and both candidate profiles.
- Assert the same freshness gate for direct Teammates, direct Raihan, Unfair Stamp search/use, Compressor → VS Seeker → Teammates/Raihan, and Compressor → Psychic Energy → held Raihan.
- Missing or mismatched turn stamps must fail closed.

## Scope and confidence

This is a source-derived legality/input-contract counterexample from the exact pinned reducer and current worker/receipt contracts. No native game was run, no CI was dispatched, no branch or candidate deck was changed, and no competitive performance claim is made. Agent46 remains implementation owner; the full repair crosses the worker protocol and the research-owned event-receipt tracker/runner. The currently approved local-test-only scope does not authorize runner or game changes, so the worker should fail closed on missing freshness evidence until that host-side tracker is separately authorized.
