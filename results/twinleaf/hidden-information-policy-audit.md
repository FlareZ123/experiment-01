# Information-set fidelity: speculative knowledge of private draw order

**Agent 50, 16 October 2026.** Pinned upstream Twinleaf commit: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is an audit of the research **policy**, not a paper card-legality assertion or a game-win result.

## Why it matters

A player can infer the *membership* of their remaining deck from ordinary deck search (the K0/K1 observation in `resources/human_concepts.md`), but normally cannot see its randomized physical order. A sound pre-draw policy can know that seven particular cards remain yet must treat their top-to-bottom order as hidden. Likewise, an opponent's hand, deck order, and facedown Prizes should not be accessible to a decision policy absent a card effect revealing them.

The pinned [`SimpleTacticsAi.decodeNextAction`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics-ai.ts) receives the **entire unmasked `State`**. Its [`SimpleTactic.evaluateAction`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/simple-tactics.ts) constructs a [`Simulator`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/bots/simulator.ts) that deep-clones the full state and dispatches a hypothetical action. After the hypothetical action, `StateScore.getScore` evaluates the resulting board and hand, including types of **newly drawn cards**. The [`PlaySupporterTactic`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/play-supporter-tactic.ts) explicitly compares such prospective Supporter scores.

This forms a source-level information leak: a hypothetical draw can reveal which currently face-down cards the real engine placed on top, and the bot may use that future knowledge when selecting an action. This is a different failure mode from shared bot/game PRNG usage. Isolating RNG streams prevents speculative samples from shifting the real shuffle, but does not itself hide the realized shuffle ordering already present in the state.

## Pinned-engine reproduction

[`hidden-draw-forecast.cjs`](../../simulation/twinleaf/hidden-draw-forecast.cjs) constructs two otherwise identical injected turn-four states with a `Professor's Research` Supporter available, identical deck multiset, identical visible cards, and equal deck size. The only difference is which of two seven-card groups occupies the physically hidden top positions. A real `PlayCardAction` is speculatively evaluated by `PlaySupporterTactic.evaluateAction` in both states; the expected result is that the prospective score changes with the unseen top cards. [Compiled-engine test](../../tests/twinleaf-hidden-draw-forecast.test.cjs) uses the pinned revision, and [manual CI](../../.github/workflows/twinleaf-hidden-information.yml) builds the engine before running it.

**Observed compiled-engine result:** [manual CI 38834175094](https://github.com/FlareZ123/experiment-01/actions/runs/38834175094) passed the focused test. The actual prospective Supporter scores were **30** with seven Energy on top and **47** with seven Pokémon on top. The code asserts identical full deck multisets, hand cards, and board conditions and assigns distinct test card IDs before the simulation. This establishes a real hidden-order influence on speculative scoring in the pinned engine. It is independent of any source matchup win outcomes.

The fixture uses duplicated Pokémon/Energy cards for controlled contrasts and is **not** a legally constructed 60-card deck or an actual completed game. Its purpose is to isolate an information-set dependency of a bot scoring function. Even if score sensitivity is confirmed, an additional multi-action experiment is needed to show when the bot's eventual *selected action* changes. No winning-performance inference is warranted.

## Proposed response

1. Treat generic-bot estimates as informationally uncalibrated until an information-set boundary is tested. Existing completed matches remain mechanics/feasibility fixtures.
2. Define the candidate's legal observation at each decision. Preserve public zones, own hand, available count/known information, and legitimately revealed information; represent unknown deck/Prizes/opponent hand as uncertainty rather than true physical order.
3. For action scoring, sample hidden-state determinizations **from the observation-consistent distribution**, and average or otherwise robustly aggregate action values. Protect against illegitimate future-draw clairvoyance and avoid leaking unknown positions through prompt-resolver indices.
4. Regression-test invariance: changing unrevealed card order without changing observable information should not systematically change a deterministic policy decision or its estimated action value. Treat stochastic policies with distributional/statistical invariance tests. Match engine-side legality separately against the real state.
5. Pair any policy correction with independent RNG streams, a pinned engine revision, exact policy ID, complete traces, and at least one realistic replay where competing actions matter.

These are design requirements, not an implementation claim. In particular, simply shuffling the supplied actual engine state immediately before every real decision could corrupt prompt indices or legitimately remembered information. The fix should be implemented at the research-owned policy/evaluation boundary and validated against replayable scenarios.
