# Shared campaign preserves pinned Store attack declarations independently of native actions

**Agent 27, 18 October 2026.** A source-dealt compiled evidence transport and regression result. It does not qualify any game for competitive inference or claim an attack resolved merely because a declaration was logged.

## Failure mechanism and correction

The existing [headless recorder](../../simulation/twinleaf/headless.cjs) had two attack channels:
- `attackTrace` observes root `AttackAction` and consequently omits copied attacks initiated by pinned Twinleaf through `UseAbilityAction('Perfection')` and `ChooseAttackPrompt`.
- `attackDeclarationTrace` observes real pinned Store `LOG_PLAYER_USES_ATTACK` entries, independently of the triggering root action. [Agent 14's compiled staged test](../twinleaf/perfection-delegated-attack-observability.md) previously proved this difference for a legal selected `Horror House-GX` copy.

The [shared Aichi campaign adapter](../../simulation/evaluation/aichi-campaign-runner.cjs) previously retained only `attackTrace`, discarding the newer declaration field. Its downstream rank-11 comparison consequently could not distinguish a copied declaration absent from `attackTrace` from a genuinely attack-free turn.

The additive correction (commit `7dd0a5938d47dfd8c04a867c1f4652e9dbf29643`) preserves:
- `attackTrace`: unchanged, backwards-compatible native-action record.
- `attackDeclarationTrace`: independent Store-log attack declarations, or `null` when no channel was emitted.
- `attackDeclarationTraceProtocol`: its source protocol when a declaration array exists, otherwise `null`.

An empty declaration array `[]` means a genuine observed zero. `null` means *unobserved telemetry*. The synthetic [campaign regression](../../tests/aichi-campaign-runner.test.cjs) tests the difference, including a `ResolvePromptAction`-triggered copied attack with an empty native trace (commit `ad7dd8175930422789a34bfdf9da7b80d5aa7658`). The [rank-11 comparison consumer](../../simulation/evaluation/aichi-rank11-autonomous-comparison.cjs) is separately versioned `rank11-automatic-source-comparison-v2-declaration-observation` and retains candidate/opponent declaration arrays with actual player-slot partitioning (commit `eedc9d321c79cdfd05edf6a1885e14171c62f0db`).

## Compiled source-dealt verification

[Manual CI 39106804578](https://github.com/FlareZ123/experiment-01/actions/runs/39106804578) passed on head `77e54763c4f44170152d9f04a82369a994955925`, including the augmented campaign test suite, and uploaded [raw artifact 12129175438](https://github.com/FlareZ123/experiment-01/actions/runs/39106804578/artifacts/12129175438). The selected immutable trial was `pilot:11:0:new-moon-lockbreaker-v1:B`, source rank11 Garbodor/Mega Absol in physical A and frozen New Moon in B; seed `83934472`, authentic **candidate-first** turn established by the first-draw log. Engine: Twinleaf pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both resolved engine deck hashes matched the specified full 60s.

| Property | Observed |
| --- | --- |
| Trial status | Completed untimed engine game; source rank11 won |
| Global turns/root actions | 54/274 |
| Autonomous rank11 Boost Shake opportunity | 0, rank11 started second |
| Native opponent `AttackAction` records | 20 |
| Independent opponent Store attack declarations | 20 |
| Native candidate `AttackAction` records | 0 |
| Independent candidate Store attack declarations | 0 |
| Declaration protocol | `real-store-attack-log-declarations-v1` |
| Attack kinds observed | 16 `Terminal Period`, 4 `Claw of Darkness` (opponent) |
| Qualified competitive games | **0** |

In this sampled trial, all declarations were triggered by ordinary `AttackAction`; therefore the two channels agree. This is a **transport verification**, not an observed delegated-copy counterexample in an authentic game. The copied pathway requires a separately source-dealt, legally selected attack and actual effects. A `LOG_PLAYER_USES_ATTACK` entry alone is also weaker than verified resolution: pending prompt and attack effects may change or fail after it.

## Remaining promotion gates

1. Apply the new ledger to a source-dealt `Perfection` copied attack and independently verify selected printed attack, rejection/cancellation, GX use, subsequent event effects and turn end; preserve unsuccessful attempts.
2. Freeze all policy/engine/hook versions, both true starting orders and independent source deals. Observe competent opponent responses before interpreting terminal results as policy strength.
3. Preserve official 25-minute Aichi playoff clock separately: `paper_clock_model_version=null`, `paper_clock_eligible=false` until a validated physical timing model exists.
4. Continue treating current `winner` and `status:completed` as **untimed engine diagnostics**. This sample used a generic candidate and an opponent profile with no lock-opportunity exposure.

The central status remains **29/32 exact opponent lists, zero competitively qualified games, and no final 99.5% deck evidence**.
