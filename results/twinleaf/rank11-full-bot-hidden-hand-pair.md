# Pinned full-bot decision noninterference: exact rank-11 hidden-hand pair

**Agent 23, 19 October 2026.** Compiled diagnostic at the entire original `SimpleTacticsAi.decodeNextAction` boundary, rather than invoking only an isolated AttackTactic or UseAbilityTactic.

## Reproduction and controlled comparison

- [Runner](../../simulation/twinleaf/rank11-full-bot-hidden-hand-pair.cjs) and [regression](../../tests/rank11-full-bot-hidden-hand-pair.test.cjs). [Manual-only workflow](../../.github/workflows/rank11-hidden-opponent-hand.yml), [successful pinned CI 39337838237](https://github.com/FlareZ123/experiment-01/actions/runs/39337838237), commit [`6a027a01`](https://github.com/FlareZ123/experiment-01/commit/6a027a01bb5e55887589b352d7868f940990c964). The test step was successful and the subsequent console run emitted all six paired rows. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- The opposing rank-11 Mega Absol/Garbodor card inventory remains the exact published 60. Each pair swaps four *unrevealed* Darkness Energy and four *unrevealed* Battle VIP Pass between its hand and deck. The synthetic attacking 60 has Mewtwo & Mew-GX Active, a legal-looking discarded Gengar & Mimikyu-GX copy payload, and a deliberately simple deck filled mostly with identical Basic Psychic Energy printings. No actual source-dealt game is claimed.
- The two variants in each pair have explicitly equal actor-observation projections, the same full source inventory and a newly reset common policy PRNG. Three public Mega Absol ex damage totals were tested: 0, 80 and 160. Each scenario was repeated with the synthetic owner's **identical-printing Energy copies** in reverse object order. That reversal does **not** test strategically distinct unseen card order or solve K0/K1.
- Test the **original complete bot**, repeat with reversible opt-in opponent-hidden-pool sampled scoring for native AttackAction and delegated Perfection (`includePerfectionAbility:true`, eight reproducible hidden-pool samples), then uninstall the hook and require the complete bot's original six decisions to return exactly.

## Compiled result

| Public damage on Mega Absol ex | Raw bot, four hidden Energy | Raw bot, four hidden Trainer cards | Partial blind sampler, either hand |
| --- | --- | --- | --- |
| 0 | Pass | Pass | Pass |
| 80 | Pass | Perfection | Pass |
| 160 | Pass | Perfection | Perfection |

Each damage row was reproduced in both identical-Energy-copy orders. The original complete bot therefore had **4/6 action reversals** between owner-observation-equivalent paired worlds. The partial sampler had **0/6 action reversals** on the *same six pairs*. Removing it exactly restored the raw behavior (**6/6 pairs matched their original actions**). These are actual selected full-bot root action objects, including their serialized targets, from the pinned compiled engine. The CI test took the actual default tactic priority through `decodeNextAction`, which also includes the bot's speculative validity checks.

## Qualification limits and next useful experiment

**This demonstrates an information-boundary defect in the unchanged whole bot and a bounded successful mitigation, not general full-bot information safety.** The sampled scorer still leaves Supporter/Item/Energy choices, prompt resolvers, source policy, and other speculative tactics untouched. It assumes a complete opposing hidden-card multiset, which is externally verified in this synthetic fixture and is not necessarily legitimately known to the actor in a closed-list tournament. There is no validated owner K0/K1 or known-top history here. The two owner-deck reversals exchange copies of the same printing, so this experiment cannot refute the separately documented [own-deck-order action reversal](hidden-information-policy-audit.md).

Next step: at a **genuine candidate root in the canonical Agent-41 bilateral v2 executable**, capture all visible observations and a detached counterfactual opponent hand/deck with the same owner knowledge; compare root actions under the complete installed common policy, without changing the physical game. Include delegated copied-attack prompt selection and early setup actions. Any proposed joint observer-constrained scorer must guard unknown-opponent roster assumptions and other tactics as well as native/Perfection. No fresh v2 outcomes qualify until the integrated decision boundary and gameplay policy pass the explicit evidence gate.

**Zero competitively qualified games. No empirical win-rate evidence; 99.5% remains unproven.**
