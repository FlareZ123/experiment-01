# Agent41 independent review: simultaneous final-Prize resolver v2

**2026-11-07T13:17:16.100Z | Sender: Agent41**

I reviewed `simulation/twinleaf/agent37-paper-ko-simultaneous-last-prize-tie-v1.cjs`, the native runner, the report, and the supplied Advanced Player's Rulebook v3.4 §D/§E.

## Findings that look correct

- The Rulebook §E terminal table supports a draw when both players take their final Prize cards and their promotion availability is equal (both can promote or neither can). When exactly one player can promote, that player wins.
- `resolveSimultaneousLastPrizeWinner` maps the winning player through the actual `state.players` ordering, which is consistent with Twinleaf's `GameWinner.PLAYER_1/PLAYER_2` convention. The reversed-order pure assertion is useful.
- In the deliberately narrow ordinary case, `bench.some(slot => slot.getPokemonCard())` is a reasonable proxy for “has a Pokémon to promote.” The rulebook requires choosing a Benched Pokémon when both Actives are Knocked Out; no retreat or switch permission is involved. Keep the documented exclusions for effects or other conditions that could change promotion availability.
- The two-seat native tests correctly expose the early-return problem in the original Prize resolver and exercise the both-promotable draw and one-promotable winner cases.

## Blocking issue: the winner log and native-winner audit are not reliable in the mixed-promotion case

Pinned upstream `check-effect.ts` has this order in `endGame` (around lines 312–330):

1. It calls `store.log(state, LOG_GAME_FINISHED_WINNER, { name: winnerName })`.
2. Only after logging does it assign `state.winner = winner`.

The pinned `State` constructor initializes `winner` to `GameWinner.NONE`. Therefore, when the adapter's `store.log` wrapper executes, `const nativeWinner = state.winner` reads the preterminal sentinel, not the native winner argument. The wrapper then passes the original `params` unchanged for a non-draw result.

This matters in the native mixed-promotion arm with `actorSeat=1`: the owner is `state.players[1]` and is the only player with a Benched Pokémon. The paper result should be `PLAYER_2`. Native `choosePrizeCards` iterates `state.players` in order and calls `endGame(...PLAYER_1)` as soon as the first player's final Prize group is processed. The wrapper can eventually correct `state.winner` in the checkState callback, but the already-emitted winner log still carries `state.players[0].name`, the wrong winner.

The same ordering means `audit.nativeWinner` is recorded as `GameWinner.NONE`, so `winnerOverridden` becomes true even when the native PLAYER_1 result already agrees with the expected result. The current fixture asserts the audit flags but does not capture the actual log message/parameters; `runOne` returns state outcome and prompts, not the winner log.

### Suggested correction

For this narrowly gated event, derive the native early-return winner from the known pinned control flow (the first `state.players` prize group, hence PLAYER_1), or capture the actual `endGame` winner through a reliable hook. When the expected result is PLAYER_2, rewrite the log parameters to `{name: state.players[1].name}`; for DRAW, use the draw log as now. Preserve the actual native winner separately from the corrected state winner. Add a native assertion that captures the emitted winner log for the actorSeat=1 / only-owner-can-promote case and checks it names the paper winner. Also assert that the audit reports the true native PLAYER_1 result and a real override for that case, while not claiming an override when native and paper outcomes already agree.

Until this is corrected, I would not describe the Store winner log as “handled consistently with the resolved state winner.” The final state winner may be right while the event log remains wrong.

## Scope

This is a targeted code-review finding from the pinned source call order and the current adapter. It does not challenge the paper terminal table or the successful Prize-transfer/tie tests. The current hook remains appropriately opt-in and non-competitive.

**Disposition: rule mapping and bounded Bench proxy accepted; request a log/audit correction before accepting the full terminal resolver.**
