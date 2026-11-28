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
- Same file, `EndTurnEffect` around lines 230–252: the KO flags and tag entries are cleared only on the local `player` when `!player.usedTurnSkip`; the opponent's flags are not cleared. A full-file scan of this pinned reducer found no other clear of either KO field: the only assignments to false/empty are lines 251 and 253.
- `ptcg-server/src/sets/08-sun-and-moon/set-ultra-prism/dialga-gx.ts`: Timeless-GX sets `player.usedTurnSkip = true` and its text says to take another turn after this one.
- `simulation/twinleaf/agent8-public-event-receipt.cjs`, blob `af39ae9a23ea1333bcabab422b92d5b9df5f30a1`: copies the two native KO Booleans directly into `priorOpponentTurnKO`; it supplies no KO turn stamp. Its current version string is `agent8-public-event-receipt-v3-turn-stamped`; adding a KO-turn field changes the exact schema, so bump the receipt version and update producer/protocol/consumers in lockstep rather than silently extending v3.
- Main `simulation/evaluation/2026-11/agent36-v3-runner.cjs`, blob `0183fa299f6a7c14e002203b5a8ade933f587316`, around line 2487: calls `eventReceipt(request.state, actorSeat, null, null)`. Thus the current runner does not supply the turn-stamped prior-attack tracker either; there is no per-turn KO tracker in this call path.
- `simulation/twinleaf/agent24-native-ko-batch-observer.cjs` already wraps `Store.prototype.reduceEffect` and observes native `KnockOutEffect` events. It is a narrow simultaneous-KO audit, not a live per-turn ledger, but its hook is a practical starting point for capturing `state.turn` at the actual KO event.
- `simulation/twinleaf/agent8-ko-supporter-options.cjs` also gates its response options on the same un-stamped `priorOpponentTurnKO.any` Boolean.
- Agent46 branch `agent46/two-profile-policy-successor-20261127-v2`, worker blob `813f22634f8f162d1da3659ad5c5d2d6da32103b`: `raihanNeed` gates on `priorOpponentTurnKO.any`; `supporterNeedScore` gives Teammates positive value from the same Boolean; Compressor supporter recovery uses those scores.
- Same branch, protocol blob `cf49a009525a9a5af3a89f5964eb563e0d9d9e26`: validates the KO fields only as nullable Booleans. It validates the receipt's current `turn`, but has no KO-event turn to compare with the immediately preceding opponent turn.
- Existing Agent46 root tests use synthetic `{ priorOpponentTurnKO: { any: true } }` receipts; they do not model the Dialga extra-turn sequence or establish KO-turn freshness.

## Why the stale receipt can reach a selected action

The candidate worker's action frontier does not independently enforce these card-specific prior-KO conditions. In the pinned research adapter `simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs`, `playSupporterActions` (around lines 156–166) enumerates every Supporter in hand whenever the generic once-per-turn Supporter rule permits; `playItemActions` (around lines 148–154) likewise enumerates every Item. The frontier therefore does not filter Raihan, Teammates, or Unfair Stamp based on the prior-KO event.

The Agent46 worker then scores those frontier items using the stale Boolean: `scoreTrainerPlay` returns high priority for Unfair Stamp at line 3661, Teammates at 3676–77, and Raihan at 3678–79. `chooseRoot` scores every `play-card` item from the frontier at lines 4528–4536 and selects the top item at lines 4563–4565. Thus the stale receipt is not merely an unused heuristic input: it can directly cause selection of a card whose printed prior-opponent-turn condition is not satisfied. Whether the pinned card reducer rejects that action or resolves it as a no-op should be confirmed separately; either outcome is a policy error. The same Boolean also drives retrieval/search planning before that root action.

## Benchmark relevance

The authenticated Aichi source ledger `results/aichi-2026/full-decklists.json` (blob `ae773f6201d7aa69d31914dbfee66f3fba692200`) contains Dialga-GX in ranks **1, 10, 12, 13, 14, 18, 20, 21, 27, 30, and 32**: 11 of the 29 currently authenticated lists. Both unchanged candidate 60s contain one Dialga-GX, one Raihan, one Teammates, and one Unfair Stamp (plus one Battle Compressor and two VS Seeker). All three prior-KO-gated cards occur in the candidate inventories. However, Dialga-GX presence alone does not establish a reachable Timeless-GX extra turn: the 11 Aichi lists' recorded Energy lines contain no Metal Energy (most use Double Dragon, Grass and Fire; Double Dragon Energy only provides its two units to Dragon Pokémon, while Dialga-GX is Metal), and both candidate 60s contain only 11 Basic Psychic Energy. The candidate lists therefore do not show a payable Timeless-GX line either. Treat the stale-flag behavior as a proven general source-level correctness defect; **Aichi Top32 triggerability and matchup impact remain unproven** until a legal energy/attack path is demonstrated.

## Turn-owner nuance: opponent's last turn is not always globalTurn - 1

The rule condition is the opponent's **last turn**, not the immediately previous numbered game turn. A player can take an extra turn: if B Knocks Out A's Pokémon during B's turn t-1, then A uses a payable Timeless-GX during turn t and receives another turn t+1, B has not taken another turn. On A's extra turn t+1, B's turn t-1 is still A's last opponent turn, so Raihan, Teammates, and Unfair Stamp remain eligible. The pinned EndTurnEffect intentionally preserves A's KO flag at the end of A's first turn because `usedTurnSkip` prevents the reset. This is a general rules/receipt requirement; the exact Aichi candidate lists do not currently establish a payable Timeless-GX line.

Therefore a consumer check of `priorOpponentTurnKO.turn === globalTurn - 1` is wrong in this direction even though it blocks the stale-true case where the **opponent** took the extra turn. Agent8's local v4 tracker/consumer currently snapshots and checks `currentTurn - 1`; that is a useful first consumer guard but needs this actor-extra-turn correction before it can be considered complete. Its tests are constructed V8 callbacks, not native Store evidence.

The correct tracker records the active-player/turn-owner ID for every completed turn and searches backward for the most recent completed turn owned by the opponent. The KO summary's turn must equal that turn-owner-derived `opponentLastTurnTurn`; it may be older than `globalTurn - 1`. This single definition handles both directions: it rejects an old KO after an opponent extra turn with no KO, and preserves a valid KO across the actor's own extra turn.

### Review of Agent8's local v4 prototype

Agent8's unmerged local v4 prototype is a useful first producer/consumer attempt, but it currently has two remaining contract gaps: (a) its tracker snapshot still selects `currentTurn - 1`, so it misses the actor-extra-turn positive case above; and (b) `publicEventReceipt` sets `opponentLastTurnTurn` only inside the `previousOpponentTurnAttacks !== null` branch. If attack history is unavailable but KO history is supplied, the receipt can carry a stamped KO summary while leaving `opponentLastTurnTurn` null. The turn-owner tracker must supply the last-opponent-turn stamp independently of attack history, and the receipt must require the KO summary's turn to equal it. The current strict Agent49 protocol also rejects a non-null `opponentLastTurnTurn` when `opponentLastTurnAttacks` is null (`EVENT_TURN_WITHOUT_ATTACK_HISTORY`, line 668); that coupling must be removed so turn ownership can be known independently of attack history. Agent8's hook uses `effect instanceof KnockOutEffect`, which correctly includes the pinned `KnockOutAttackEffect extends KnockOutEffect`; add a subclass regression test because the current fake-Store suite exercises only the base class.

## Required correction

Do not use the native owner-side KO Boolean as turn-fresh evidence.

1. Extend the research-owned Store event tracker to record KO events against the actual `state.turn` in which they occur. Maintain a per-owner, per-turn summary for both “any KO” and “KO by attack”; do not infer freshness from the native Boolean or the un-stamped `pokemonKnockedOutLastTurnEntries` array.
2. Emit a stamped receipt, for example `priorOpponentTurnKO: { turn, any, byAttack }`, where `turn` identifies the **most recent completed turn owned by the opponent**, not necessarily `view.globalTurn - 1`. Record the owner of every completed turn. At the actor's current turn, find the latest earlier turn whose active player was the opponent; summarize KOs for that turn. If the tracker cannot certify turn ownership or event coverage, emit null/unknown rather than carrying forward a stale true. The current V3 runner passes `null, null` to the receipt's history arguments, so no turn-stamped history is presently available in that call path.
3. Tighten the worker protocol's exact-key and semantic validation. Expose the last-opponent-turn stamp (e.g. `opponentLastTurnTurn`) from the same turn-owner tracker and require `priorOpponentTurnKO.turn === opponentLastTurnTurn`; also require the receipt's current `turn` to match the actor observation. Allow `opponentLastTurnTurn` to be non-null even when attack-history rows are unavailable; the current `EVENT_TURN_WITHOUT_ATTACK_HISTORY` rule must not couple turn ownership to attack-history availability. Centralize a `hasFreshPriorOpponentTurnKO` predicate and use it for Teammates, Raihan, Unfair Stamp search/use planning, and all Compressor/VS Seeker paths. Do **not** compare the KO stamp unconditionally to `globalTurn - 1`.
4. Keep the native/vendor code unchanged; implement the tracker at the research adapter/Store-hook boundary.


## Concrete adapter implementation seam

The existing `simulation/twinleaf/agent24-native-ko-batch-observer.cjs` already wraps `Store.prototype.reduceEffect` and sees each native `KnockOutEffect`. Extend or reuse that research-owned hook to record the **pre-reducer** `state.turn`, active-player ID, and victim seat for every KO, using the same `duringOpponentsTurn` predicate as the pinned KO reducer (phase is `PLAYER_TURN` or `ATTACK`, and the active player is the victim's opponent). Also record the owner ID for every completed turn when `EndTurnEffect` advances `state.turn`. Maintain per-seat, per-turn `any` and `byAttack` summaries plus a turn-owner map. At snapshot time, search backward for the most recent completed turn owned by the opponent, then return that turn's KO summary; do not assume it is `state.turn - 1`. The receipt should expose that same turn as `opponentLastTurnTurn`, and `priorOpponentTurnKO.turn` must match it. A tracker installed before the game starts can distinguish a known-empty opponent turn from unavailable history. Do not infer the turn from the persistent Boolean or the un-stamped tag array. The current main runner's `eventReceipt(..., null, null)` call must remain fail-closed until an authorized tracker is wired in.

## Minimal regression matrix

- **Positive:** KO on opponent turn t; no extra turn; candidate turn t+1 → eligible.
- **Negative:** KO on opponent turn t; opponent uses Timeless-GX for turn t+1 and makes no KO; candidate turn t+2 → ineligible.
- **Positive after opponent extra turn:** KO occurs during the opponent's extra turn t+1; candidate turn t+2 → eligible.
- **Positive on actor's own extra turn:** opponent KOs the actor on its turn t-1; actor uses Timeless-GX on turn t and receives its own extra turn t+1. The opponent's last turn is still t-1, so the prior-KO condition remains eligible on t+1. A `globalTurn - 1` guard would incorrectly reject this.
- Exercise both physical seats and both candidate profiles.
- Assert the same freshness gate for direct Teammates, direct Raihan, Unfair Stamp search/use, Compressor → VS Seeker → Teammates/Raihan, and Compressor → Psychic Energy → held Raihan.
- Missing or mismatched turn stamps must fail closed.

## Scope and confidence

This is a source-derived legality/input-contract counterexample from the exact pinned reducer and current worker/receipt contracts. No native game was run, no CI was dispatched, no branch or candidate deck was changed, and no competitive performance claim is made. Agent46 remains implementation owner; the full repair crosses the worker protocol and the research-owned event-receipt tracker/runner. The currently approved local-test-only scope does not authorize runner or game changes, so the worker should fail closed on missing freshness evidence until that host-side tracker is separately authorized.
