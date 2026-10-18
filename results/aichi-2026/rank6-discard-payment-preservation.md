# Rank-6 source-dealt discard payments: conserve two disruption Supporters

**Agent 33, 18 October 2026.** Evidence class: published-source physical-deal inspection, existing compiled headless policy artifact, and a narrowly controlled new Store counterfactual. No competitive game, human policy validation or win-rate evidence.

## Frozen original archive

The prior [manual pinned CI run 39125114240](https://github.com/FlareZ123/experiment-01/actions/runs/39125114240), compiled at research revision `b25b83b9cfd859296ece114eff140e913cfbf3d0` and Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, passed and archived `rank6-broad-thorns-source` artifact `12134979629`. It contains all 24 preregistered `uint32` seeds for candidate rank 1 (Shadow Rider) and source rank 6 (Iron Thorns), with actual start-order data. One paired trial failed from a `ChooseCardsPrompt` engine error; 23 paired trials returned. Three prospective trials completed the policy's live turn-two Volt Cyclone declaration, while twenty marked `started:false`. All three attack starts occurred in physically verified rank-1-first openings. This is an observed finite panel, not a rate estimate for robust opponent play.

The retrospectively selected seed **1819063225** started candidate rank 1 first, opponent rank 6 second. Rank 6's owner's initial decision hand, recorded before the policy dispatch, was:

| Source-printed hand card | Strategic role under review |
| --- | --- |
| Faba LOT | Flexible Pokémon Tool / Special Energy / Stadium removal Supporter |
| Speed Lightning Energy RCL | Energy |
| Guzma & Hala CEC | Held required search Supporter |
| Eri TEF | Disruption Supporter |
| Tag Call CEC | Already redundant *for acquiring the held Guzma & Hala on this turn*, potentially valuable later |
| Captivating Poké Puff STS | Situational Item |
| Iron Thorns ex TWM | Pokémon |

The broad policy's declared priority used the **Eri + Faba** physical cards to pay the optional two-card discard, searched for Thunder Mountain Prism Star plus Double Colorless Energy from its real in-game owner deck prompt, played the Stadium, attached DCE, and announced Volt Cyclone at the 80-HP opposing Marshadow. The next public state showed five rank-6 Prizes remaining. Its saved damage observer returned `after:null` because the target was removed on Knock Out; this field must not be scored as missing damage. The generic champion policy later won the engine match; this does not establish a competitive result.

The original hand also contained **Captivating Poké Puff + Tag Call**, two distinct cards that can legally pay the same two-card discard *after Guzma & Hala has been played*. The alternative protects both disruption Supporters at the cost of spending the held Tag Call and Poké Puff. Discard opportunity cost is dynamic: Tag Call and Poké Puff retain possible future use, so protection is a tactical hypothesis rather than a universal ranking.

## Same-deal legal action comparison

The new [source payment fork](../../simulation/twinleaf/rank6-discard-payment-source-fork.cjs) replays seed `1819063225` under unchanged deck printings, root Store logic, source deal, policy random-isolation flags, support decisions, and attack intent. It compares:

1. **Original:** the default permitted discard priority, anticipated payment Eri + Faba.
2. **Protected:** alternate priority selecting Captivating Poké Puff + Tag Call from the owner's visible hand.

The [opt-in source policy extension](../../simulation/twinleaf/rank6-broad-thorns-policy.cjs) accepts `discardPriority` without changing default behavior. New pure [regression tests](../../tests/rank6-broad-thorns-policy.test.cjs) verify original and alternate selection, that the cards are physically distinct, and that a duplicate priority cannot spend the same physical card twice. The shared [manual-only workflow](../../.github/workflows/aichi-iron-thorns-first-attack.yml) compiles the real pinned Store and archives the same-deal pair.

The compiled test is specified to fail closed unless both branches share source-hand printings, six-Prize composition, print-aware deck hashes, genuinely verified start order, completed in-Store turn-two attack declaration, identical pre-discard source-zone/continuity digest, and a first genuine divergence at the `ChooseCardsPrompt` payment resolution. It also preserves the next public champion turn and actual terminal status without promoting either as evidence of optimal play.

## Interpretation and next decision

This experiment asks an exact DCI/AMR question: is an extra gust, control or recovery option worth preserving against rank 1 after spending two different search-payment cards? It does not presume that the alternate is better. After the mechanical fork is verified, a stronger study needs an autonomous policy that chooses among the two payments from its owner information set, independent physical seeds with both starting orders, and competent challenger responses. A differing weak-bot engine winner would remain diagnostic.

The full target is one unchanged legal 60-card list across all Aichi Top 32. Exactly 29 source 60s are available; no field-wide competitive game is qualified and no demonstrated 99.5% win rate exists.
