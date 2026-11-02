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


## Read-only live comparator and 3+2 native regression, 22:43 UTC

After documenting the v2 isolated outcome, the team added an explicitly conservative native-to-pending Prize comparator at [`simulation/evaluation/agent24-pending-replay-prize-disposition.cjs`](../../simulation/evaluation/agent24-pending-replay-prize-disposition.cjs). It requires an authenticated simultaneous KO projection, an actual `finished:true` with `endReason:"engine-game-end"`, and a concrete winning physical seat. It never certifies a paper result or excludes other win conditions.

- [Manual pure workflow 41539111445](https://github.com/FlareZ123/experiment-01/actions/runs/41539111445) **overall success**; eight pure pending-Prize regressions including the four new adversarial cases succeeded.
- [Pinned compiled manual workflow 41539300794](https://github.com/FlareZ123/experiment-01/actions/runs/41539300794) **Agent24 native job success**, with both named double-KO native fixture steps success. [Raw artifact 13186455318](https://github.com/FlareZ123/experiment-01/actions/runs/41539300794/artifacts/13186455318), ZIP SHA-256 `b6b8b9c68a3b78512aa78d25710f236bb740bb589db318888e028e7b64ce7542`.
- From that **actual native archive**, `agent24-replay-double-ko.json` contains the ordered statuses `NATIVE_WINNER_MATCHES_PENDING_PRIZE_LEAD` for [3,2] claimant Prizes, `NATIVE_WINNER_WITHOUT_PENDING_PRIZE_LEAD` for [2,2], and `NATIVE_WINNER_OPPOSES_PENDING_PRIZE_LEAD` for [2,3]. The source counterexample remains **opposing leader seat1 versus native winner seat0**.
- `agent24-spiky-double-ko.json` contains two `NATIVE_WINNER_WITHOUT_PENDING_PRIZE_LEAD` outcomes from genuine printed `Volt Cyclone` and `Spiky Energy` reducer sequences under staged board setup, both native winner seat0.
- All five native comparator receipts explicitly return `paperGameOutcomeQualified:false` and `competingWinConditionsExcluded:false`. The comparator is observational and changes neither native action nor winner.

**Provenance distinction:** the first successful raw v2 native execution is `41538296976`, while `41539300794` is an independently compiled follow-up after adding the comparator. Reusing the same source seed and setup does not qualify these as independent competitive games.


## Independent ordinary-game final-Prize counterexample, 22:55 UTC

The same pinned source branch is also observable in **ordinary non-sudden-death games**, without an artificial tiebreak reset. Using genuine original rank-11 and rank-20 60-card decks in both physical-seat orientations, `oneOrdinaryDoubleFinalKO` prepares an explicitly synthetic late-game state: each player initially receives six genuine Prize objects, four per owner are relocated to the **same owner's hand** to represent already-taken Prizes, both owners retain a real Basic on Bench, and the original-owned two-Prize Basics Crobat V and Regidrago V occupy the two Active Spots. The 120 original-card owner references remain conserved. Both Active Pokémon are then set to lethal damage in the same pinned `checkState` reducer batch.

**Compiled validation:** [manual workflow 41540930313](https://github.com/FlareZ123/experiment-01/actions/runs/41540930313), both the native `agent24-original-physical-native` job and the pure `test-benchmark` job succeeded. The named native simultaneous-KO and printed Spiky counteraction steps both succeeded, along with **12 pure Prize-projection tests**. Archived ZIP [artifact 13186907715](https://github.com/FlareZ123/experiment-01/actions/runs/41540930313/artifacts/13186907715), SHA-256 `d83008ee4bc5490467fdb482a949e5d4943337a255a4f220be4b2a77f85ec8ec`. Read `agent24-replay-double-ko.json.ordinaryDoubleFinalKOs`; its source prints, owner movement provenance, and seat-order-correct pre-KO Active states were verified against the actual archive.

| Original source physical A / B | Genuine printed pre-KO Actives A / B | Pre-KO physical Prizes | Two actual native claimant Prize entitlements | Prize totals if **both** entitlements are honored | Native final Prizes | Native winner |
| --- | --- | --- | --- | --- | --- | --- |
| Rank11 / Rank20 | Crobat V / Regidrago V | [2,2] | [2,2] | **[0,0]** | **[0,2]** | **0 / A** |
| Rank20 / Rank11 | Regidrago V / Crobat V | [2,2] | [2,2] | **[0,0]** | **[0,2]** | **0 / A** |

The source's positive `group.count >= prizeLeft` branch **automatically transfers the first seat's remaining two Prize objects and ends the game immediately**, before processing the second seat's equally valid KO entitlement. Both after-state Actives are vacant because KO happened; both still had a real Benched Pokémon. The supplied Advanced Player's Rulebook 3.4, sections **D. Knock Out** and **E. Win and Loss**, requires both players' Knock Out Prizes to be taken and treats both taking all Prizes simultaneously as a tie (followed by a tiebreaker in a tournament requiring a winner). The observed native single-winner terminal conflicts with that simultaneous result. Unlike the earlier sudden-death case, **physical Prize objects really move** in this ordinary native terminal, but only for player 0.

The new separately authenticated `projectPendingOrdinaryPrizes` mode reuses the Prize arithmetic with an explicit **ordinary game source-epoch gate**, without ever asserting a sudden-death replay. Both actual archived ordinary outcomes return `projectedBothPrizeEmpty:true`, `NATIVE_WINNER_WITHOUT_PENDING_PRIZE_LEAD`, `paperGameOutcomeQualified:false` and `competingWinConditionsExcluded:false`. The original tiebreak projection and its schema remain distinct. All existing successful native controls still pass.

**Scope:** The staging of four Prizes per side into hand and the lethal damage is explicitly experimenter-induced. No paper-legal match turn sequence, naturally reachable final turn, own/opponent player-policy competence, or official event clock was established. These results diagnose the pinned engine's two independent early-winner branches under a simultaneous valid KO batch; they do not measure how often an actual Aichi matchup reaches that state.

**Action for release integrators:** Simultaneous KO Prize resolution needs a **whole-batch all-recipient** gate in both sudden death and ordinary final-Prize adjudication. Staged test results cannot be projected into a competitive opponent win-rate denominator; the default native winner remains an engine result only.
