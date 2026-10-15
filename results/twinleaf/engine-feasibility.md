# Twinleaf headless feasibility and experimental validity

**Researcher:** Agent 2, 15 October 2026. **Evidence type:** repository source inspection and manual CI smoke test. **Engine:** `twinleafgg/twinleafgg` at pinned commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, checked out as `vendor/twinleaf`. No upstream modifications.

## Tested achievement

The [manual-only Twinleaf smoke workflow](https://github.com/FlareZ123/experiment-01/actions/workflows/twinleaf-smoke.yml) built the pinned TypeScript server under Node 20.19.0 and ran `simulation/twinleaf/smoke-test.cjs` successfully on [run 38818486134](https://github.com/FlareZ123/experiment-01/actions/runs/38818486134). It reproduced identical aggregate game-state results twice from an identical seed and identical decks: seed 20310317, 100 actions, 12 turns, 5 remaining Prize cards on each side, active `PLAYER_TURN` phase. The game **did not finish** at the 100-action bound. This is a repeatability and engine-execution smoke test, **not** evidence of matchup strength or a completed game.

The smoke deck is upstream's `HEDRICK_DRAGAPULT_WORLDS_2026`, a curated Standard-format deck; its use here only tests the mechanism of executing cards through an Expanded-configured engine. It is **not** an Aichi Top 32 list.

The runner `simulation/twinleaf/headless.cjs` supplies 60-card fully qualified upstream names to `AddPlayerAction`, resolves setup prompts and turn actions through the engine's `Store` and `SimpleTacticsAi`, supplies shuffled deck permutations with Fisher-Yates, replaces actual coin flip responses with seeded fair coin flips, and reports a bounded machine-readable outcome. It also seeds process-global `Math.random` for the duration of one sequential game, restoring it in a `finally` block. Concurrent match execution within the same process is unsafe.

## Critical semantics risks

1. **Upstream bot evaluation assumes deterministic favorable events.** `ptcg-server/src/simple-bot/simple-bot-definitions.ts` sets default `BotFlipMode.ALL_HEADS` and `BotShuffleMode.NO_SHUFFLE`. The research runner resolves actual prompts randomly. However, `SimpleTacticsAi.isValidAction` creates a bare `new Simulator(state)`, whose arbiter retains all-heads and no-shuffle assumptions for candidate validation. This gap needs a research-side hook before using the policy to rank decks.
2. **Turn rules depend on explicit settings.** `Rules.firstTurnUseSupporter` defaults to `true`. The research runner explicitly sets `false` along with `attackFirstTurn=false` and `firstTurnDrawCard=true`, modeling contemporary first-player restrictions, rather than relying on defaults.
3. **Advanced bot is archetype-specific.** `advanced-bot/action-search-ai.ts` constructs a Dragapult-specific `DragapultPlaybook`, and `advanced-bot/advanced-bot.ts` registers a curated Standard list. Its action-search code alone does not demonstrate competence on Expanded combo, control, or lock decks.
4. **Card definition does not prove semantic support.** `CardManager.defineSet` indexes concrete card instances, while `DeckAnalyser.isValid` primarily checks deck construction rules and card existence. Neither constitutes an audit of Japanese Expanded print legality, bans, errata, or accurate behavior under matchup-specific locks. The `simulation/twinleaf/card-coverage.cjs` script records exact printing availability and weak implementation signals; a valid card entry can still have an incorrect or incomplete effect.
5. **Bias and stopping rules.** Trials must vary first-player selection, seed, opponent archetype, and policy; explicitly report timed-out, unresolved, or aborted games rather than silently discarding them. A seeded smoke game alone is inadequate. The runner's output is intentionally labeled with the engine revision and policy.

## Experimental statistics and objective

The 99.5% **game** win-rate goal is far beyond the evidence currently available. Even with zero observed losses in independent, unbiased games, the one-sided exact binomial 95% lower confidence bound only exceeds 99.5% after **598 consecutive wins** for a *single specified matchup* (`0.05**(1/598) = 0.99500294`). For simultaneously valid one-sided 95% lower bounds on each of 32 separately tested matchups using a conservative Bonferroni correction, at least **1,290 wins per matchup without a loss** are needed. The independence, opponent-policy representativeness, and card/rules accuracy assumptions would remain essential.

## Next validation milestones

- Complete the full-published-list coverage audit and preserve the summary, missing names, alternate printings, and unsupported/untested effect classifications. The current manifest has 29 published decks and 3 unavailable.
- Exercise a complete game, prove bounded termination or classify stalled policies, and verify statistical randomness rather than relying only on repeated seed identity.
- Add high-value rules regression tests for Regidrago attack copying, first-turn rules, Item/Supporter locks, ACE SPEC restrictions, Prize handling, and card interaction timing, using authoritative rulebook cases.
- Create stronger Expanded-specific decision policies and reproducible paired-seat fixtures before estimating field win rates.
- Improve card-ID resolution, legality checks, and match reporting with actual 29 published 60-card opponent lists; retain unknown lists as missing rather than fabricating them.

## Sources

- [Pinned Twinleaf implementation](https://github.com/twinleafgg/twinleafgg/tree/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src)
- [Exact source of SimpleTacticsAi](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics-ai.ts)
- [Default simulation arbitration](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/bots/bot-arbiter.ts)
- [Headless research code](../../simulation/twinleaf/headless.cjs), [repeatability test](../../simulation/twinleaf/smoke-test.cjs), [card coverage audit](../../simulation/twinleaf/card-coverage.cjs)
