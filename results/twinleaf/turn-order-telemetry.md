# Actual starting-turn attribution in Twinleaf

**Agent 9, 15 October 2026.** The headless research adapter now records which **engine player started turn 1**, irrespective of player slot A/B. This is needed before computing 64 (32 placements x first/second) field confidence strata.

## Mechanism

At the pinned upstream revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `setupGame` in `ptcg-server/src/game/store/reducers/setup-reducer.ts` handles setup coin flip, confirms which player goes first, and sets `state.activePlayer`. `initNextTurn` in `ptcg-server/src/game/store/effect-reducers/game-phase-effect.ts` increments `state.turn` to 1 and writes `LOG_PLAYER_DRAWS_CARD` for the first player under the runner's explicit `firstTurnDrawCard=true` rule.

The research-side helper [`turn-order-evidence.cjs`](../../simulation/twinleaf/turn-order-evidence.cjs) reads the **first observed state where `state.turn===1`** through the `Store.onStateChange` callback, capturing `firstTurnSlot`, `firstTurnPlayerId` and `firstTurnPlayerName`. It then cross-checks the earliest logged `LOG_PLAYER_DRAWS_CARD` actor against that observed player and records `verifiedByDrawLog`. An incomplete match with no observed turn 1 has explicit null fields and cannot be silently certified. The observer never derives first player from deck placement or seed parity.

## Verification

[Manual Twinleaf smoke run 38821227591](https://github.com/FlareZ123/experiment-01/actions/runs/38821227591) compiled pinned upstream and passed:

- Five pure attribution tests, including an invalid-slot rejection and contradictory draw-log rejection: [tests/turn_order_evidence.test.cjs](../../tests/turn_order_evidence.test.cjs).
- A deterministic 100-action engine smoke run replayed twice with identical output and asserted valid first-turn ID and draw-log agreement: [smoke-test.cjs](../../simulation/twinleaf/smoke-test.cjs).
- In that engine run, actual first slot was **1**, player ID **202**, player name **research-B**; the earliest draw log also named **research-B**, so `verifiedByDrawLog=true`.

This is **measurement fidelity**, with no Aichi matchup strength claim or field-win estimate.

## Remaining evidence gates

The [raw-match record contract](../../scripts/match_record_contract.py) now checks nested `first_turn` fields against candidate A/B slot, `first_player_side` and derived `seat=first|second`. A future engine-to-contract exporter must populate these from observed first-turn data; existing [`field-benchmark.cjs`](../../simulation/evaluation/field-benchmark.cjs) still only alternates engine slots. Validate actual first/second empirical balance over many independent seed draws and assess how the engine policy chooses first vs second after the coin flip.

A digest of complete replayable action traces and strategically competent Expanded play remain separate unmet gates. Never promote slot rotation or three low-policy completed games as competitive first/second balanced evidence.
