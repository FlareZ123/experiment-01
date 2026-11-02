# Pinned native tiebreaker resolves the first claimant before simultaneous KO Prize comparison

**Agent 24, 2 November 2026.** This is a native reducer-fidelity counterexample on deliberately staged original-card states, **not** a paper-legal end-to-end game, a competitive win or a field matchup estimate.

## Reproducible native evidence

- Pinned Twinleaf submodule: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; source `ptcg-server/src/game/store/effect-reducers/check-effect.ts`.
- Versioned source fixture: [agent24-replay-simultaneous-ko-order.cjs](../../simulation/twinleaf/agent24-replay-simultaneous-ko-order.cjs), v2, commit [e357803](https://github.com/FlareZ123/experiment-01/commit/e35780323bbc6e6a1414614962d096d1fdf254c3).
- Separate actual printed attack fixture: [agent24-iron-thorns-spiky-double-ko-attack.cjs](../../simulation/twinleaf/agent24-iron-thorns-spiky-double-ko-attack.cjs), no patch to Twinleaf.
- [Compiled manual CI run 41538296976](https://github.com/FlareZ123/experiment-01/actions/runs/41538296976): `agent24-original-physical-native` job **success**. Both named steps `Exercise both native pending-Prize groups after synthetic simultaneous tiebreak KOs` and `Exercise actual printed Spiky Energy counter KO in a staged native Iron Thorns attack` succeeded. Raw artifact [13184874107](https://github.com/FlareZ123/experiment-01/actions/runs/41538296976/artifacts/13184874107), ZIP SHA-256 `8dae862a9d8b6cbab92e353fccda05da7fe8b4efea9abfe1530a3af20d950e1e`. Inspect `agent24-replay-double-ko.json` and `agent24-spiky-double-ko.json`.
- Control predecessor: [compiled run 41393488295](https://github.com/FlareZ123/experiment-01/actions/runs/41393488295), raw artifact [13117489667](https://github.com/FlareZ123/experiment-01/actions/runs/41393488295/artifacts/13117489667), already established both post-reducer actual KO Prize entitlements for the first two rows.

Each source fixture starts with authentic unchanged printed 60s, preserves all 120 source-owner card references, artificially stages an initial zero-Prize tie, and lets the native engine deal a fresh six-Prize tiebreaker. The direct reducer fixture then stages both Active Pokémon at lethal damage. Its third row also explicitly swaps the original owner’s Basic card from that player's **deck** into Active, returning the original Active Basic to the same deck; these swaps are synthetic.

| Source original 60s A/B | Stage | Native post-reducer pending Prize awards A/B | Projected remaining Prizes A/B | Projected strict leader | Native reported winner |
| --- | --- | --- | --- | --- | --- |
| Rank 20 / Rank 11 | Squawkabilly ex (2) and Mega Absol ex (3) both KO | [3,2] | [3,4] | A (0) | A (0) |
| Rank 11 / Rank 20 | Crobat V (2) and Regidrago V (2) both KO | [2,2] | [4,4] | **none** | **A (0)** |
| Rank 11 / Rank 20 | **Synthetic original-owner Active swaps:** Mega Absol ex (3) and Squawkabilly ex (2) both KO | [2,3] | [4,3] | **B (1)** | **A (0)** |

Each row has exactly **two actual native post-reducer `KnockOutEffect` receipts**, positive `prizeCount`, `preventDefault:false`, no alternate Prize destination, at least one live Benched Pokémon per seat, `nativeFinished:true`, and final **physical** Prizes [6,6]. Third-row deliberate source-owner swaps originate from each owner's **deck**, and do not fabricate Pokémon card identities. The final two rows demonstrate a native tiebreak terminal with no net strict pending-Prize lead or with the strict lead belonging to the other seat, respectively.

## Distinct printed-attack reproduction

The independent [Spiky Energy real-root fixture](../../simulation/twinleaf/agent24-iron-thorns-spiky-double-ko-attack.cjs) uses original Aichi rank-6 and rank-29 sixties, reversed across two trials. After explicit synthetic board/Energy/damage preparation, a real `AttackAction` with Iron Thorns ex's **Volt Cyclone** is resolved against Iron Thorns ex carrying **Spiky Energy**. Both native reducing effect families occur: `DealDamageEffect` on the defender for 140 and `PutCountersEffect` on the attacker for 20. In both seat orders, two real `KnockOutEffect` receipts award [2,2] pending, projecting [4,4] without a strict leader; the native winner is **seat 0**, despite the real attack originating from **seat 1**. The fixture reports 33 native actions per trial and no competitively qualified games. This proves the early-winner failure is also reachable through an actual printed attack/effect combination once its prerequisite board is deliberately staged. It does not prove a naturally reached board or paper-legal full turn sequence.

## Pinned source cause and paper constraint

Inside `choosePrizeCards`, the pinned `check-effect.ts` loops `i=0` before `i=1`. For each positive group, it immediately invokes `endGame` if `state.isSuddenDeath` and **returns before evaluating the other seat or physically moving Prize cards**. The source comment says that taking any Prize in sudden death wins. That shortcut does not evaluate a complete simultaneous KO Prize batch.

The provided *Advanced Player’s Rulebook Ver. 3.4*, section **D. Knock Out**, requires both players to take the applicable Prizes in the KO process. Section **E. Win and Loss** says a tiebreaker starts with six Prize cards and is won by the first player to have **fewer Prizes remaining than their opponent**. The printed rule’s strict comparison is inconsistent with declaring an arbitrary winner for equal pending Prizes, and with declaring the lower-award recipient the winner when the other player is strictly ahead. The tournament handbook's criterion likewise uses a Prize **advantage**.

This result is specifically a **simultaneous pending-KO-Prize adjudication** defect. It does **not** invalidate ordinary one-sided native tiebreaker KOs, nor prove their winner results wrong. The read-only [pending-replay projection](../../simulation/evaluation/agent24-pending-replay-prize-disposition.cjs) deliberately returns `paperGameOutcomeQualified:false` for all states, including a projected strict leader, because other simultaneous-win conditions and paper-effect correctness may remain unverified.

## What remains to qualify

A future optional, research-owned paper correction should evaluate **both pending Prize groups in one resolution batch** before declaring a tiebreaker winner. It must preserve differing Prize destinations, owner choice of Prize card, knockout side effects, simultaneous no-Pokémon conditions, active promotion, and the normal non-tiebreaker path. Verify opposite claimed leaders, equality, swapped seat order, and a genuine selected naturally achieved legal attack board. Keep the option default off until full pinned tests and shared runner integration pass. Do not rewrite historical native winners or treat staged outcomes as genuine games.

**Field release: 29/32 original source 60s authenticated; ranks 23, 25, 28 missing; zero competitively qualified games; no selected final fixed 60; 99.5% not demonstrated.**
