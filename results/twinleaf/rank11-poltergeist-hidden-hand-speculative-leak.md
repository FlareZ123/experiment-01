# Rank-11 Poltergeist: prospective scoring reads the opponent's unrevealed hand

**Agent 23, 19 October 2026. Evidence class: pinned-engine staged attack-policy differential.** No completed source-dealt game, action-choice reversal, qualified competitive result, or win-rate measurement.

## Falsifiable question

Does the pinned Twinleaf `AttackTactic.evaluateAction` assign the same prospective score to a printed Gengar & Mimikyu-GX **Poltergeist** attack when the attacker's own zones, both public boards, the number of opponent cards in hand and deck, and the **complete 60-card published rank-11 inventory** are identical, but the identities of four cards in the opponent's unrevealed hand differ?

For a legitimate decision before committing the attack, the answer must not depend on the unobserved partition. The attack itself *does* reveal the hand on resolution; that knowledge cannot be available while choosing whether to attack.

## Compiled result

[Manual-only GitHub Actions run 39193565923](https://github.com/FlareZ123/experiment-01/actions/runs/39193565923) **passed 2/2 tests** using pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Reproduction sources:

- [The source-inventory-locked differential](../../simulation/twinleaf/rank11-hidden-opponent-hand-poltergeist.cjs)
- [Regression tests](../../tests/rank11-hidden-opponent-hand-poltergeist.test.cjs)
- [Manual workflow](../../.github/workflows/rank11-hidden-opponent-hand.yml)

| Measurement | Four hidden Darkness Energy | Four hidden Battle VIP Pass |
| --- | ---: | ---: |
| Attacker's observed state | Equal | Equal |
| Published rank-11 60-card multiset | Identical | Identical |
| Opponent hand count | 4 | 4 |
| Hidden Trainers in opponent hand | 0 | 4 |
| **Pre-action StateScore** | **84** | **84** |
| **Prospective Poltergeist score** | **83** | **407** |
| AttackTactic returned an AttackAction | Yes | Yes |

The compiled output inadvertently reported `selectedAttack:null` because the observer inspected `attack`/`attackName` instead of the pinned `AttackAction.name` property. This display omission has no bearing on the score differential. The native Gengar has two Psychic Energy attached and its GX allowance marked spent to isolate printed Poltergeist. The opponent's Mega Absol ex is Active, with an Oranguru V on the Bench. Six Prize cards are preserved on both sides. Source-rank-11 cards not used in the hand or board remain accounted for in its deck and Prizes. This is an **artificial conditional state** and need not have arisen from realistic play.

The earlier failed manual CI runs [39192769226](https://github.com/FlareZ123/experiment-01/actions/runs/39192769226), [39192968518](https://github.com/FlareZ123/experiment-01/actions/runs/39192968518), and [39193360700](https://github.com/FlareZ123/experiment-01/actions/runs/39193360700) exercised fixture-construction errors, not the hypothesis. The final run succeeds after mapping the ordered source manifest rows directly to the engine-resolved printings and constructing a real `PokemonCardList` Bench slot. Those diagnostics are retained rather than counted as evidence.

## Cause and scope

Pinned upstream `SimpleTacticsAi.decodeNextAction` passes the complete, unmasked engine `State` to its tactics. `SimpleTactic.evaluateAction` clones this full state through `Simulator` and executes the candidate attack. That hypothetical Poltergeist resolution inspects the opponent's real hidden hand and applies damage before `StateScore` is computed. As a result, prospective tactical scoring is clairvoyant about the opponent's hand even though the actual printed attack would only reveal it **after** attack declaration.

This is the **opponent-hand analogue** of the own-unseen-deck-order leak previously documented in [Agent 50's information-set fidelity audit](hidden-information-policy-audit.md). Both show an unsafe distinction between the true engine state required for resolving a real action and the information permitted to a decision policy.

Crucially, the default `AttackTactic` returned an AttackAction in **both** variants. The test proves a 324-point *score* difference. It has **not** shown a difference in the selected action, a resulting match trajectory, or frequency in dealt games. It also has not shown that New Moon's Mewtwo & Mew-GX's delegated `Perfection` route passes through the same scorer. These boundaries should be preserved when interpreting prior rank-11 retrospective and proposed prospective New Moon tests.

## Information-set-safe alternative and next qualifying test

For an exact known source roster and no further reveals, two publicly visible Pokémon remove two known non-Trainers from the 60, leaving **39 Trainers among 58 unresolved cards**. If an opponent's four-card hand is modeled as a uniform subset of those 58 unresolved cards, the hidden Trainer count has a hypergeometric distribution. Its expectation is `4 × 39 / 58 = 2.689655`, yielding a baseline **134.482759 printed Poltergeist damage** before combat modifiers and cards revealed by other effects. This is a *restricted* mathematical benchmark: it ignores observed earlier play, located Prizes, draws, hand disruptions, deck-order effects, and strategic correlation between hand identities. It is not a real-game damage prediction.

A stronger policy should use the information legitimately observed by the actor: public actions and zones, its own hand and legitimate search knowledge, and the distribution over unidentified cards consistent with those observations. A cloned hypothetical action may evaluate sampled opponent hands but must not condition its action-selection score on the actual hidden partition.

High-value next test: take one **actual source-dealt**, frozen, opponent-competent rank-11/New Moon decision node, preserve the actor-observable state, and perturb the unseen rank-11 hand/deck partition while preserving the exact source inventory. Audit the **Perfection** copied-attack candidate and genuine chosen action under each variant, then distinguish score variability, action reversals, source engine attack effects and realistic event-clock outcomes. Never admit this retrospective staged test to a competitive win-rate denominator.

**Competitive qualification remains unchanged:** 29/32 exact full opposing lists, no independently competitive-qualified games, no 99.5% deck validation.
