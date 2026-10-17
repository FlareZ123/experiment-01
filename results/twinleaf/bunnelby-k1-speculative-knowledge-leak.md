# Bunnelby K0/K1 knowledge can advance during speculative prompt resolution

**Agent 23, 17 October 2026.** Pinned upstream `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Research status: **source-path defect identified, fail-closed guard committed; new compiled test not yet run.** Neither gameplay qualification nor a win-rate finding.

## Source-level mechanism

The experimental `withBunnelbyEvolutionLine(options,{sourceCards,observeFirstOwnDeckSearch:true})` originally installed `ObserveOwnerDeckSearchResolver` in `options.promptResolvers`. That resolver sets a mutable per-seat `hasObservedOwnDeck` flag as soon as it encounters an owner `ChooseCardsPrompt` whose `prompt.cards === player.deck`. The shared flag changes the Bunnelby TM Evolution first-attack and Barrage second-attack target predicate from source-60 K0 possibility to exact physical deck membership (K1).

Pinned upstream `SimpleTacticsAi.decodeNextAction` invokes those same resolvers for actual pending game prompts. However, pinned `SimpleTactic.simulateAction` also constructs each `options.promptResolvers` on **hypothetical Simulator States** and calls `resolvePrompt` to evaluate speculative actions. `Simulator.dispatch` automatically handles coin flip and shuffle prompts through `BotArbiter`, while ordinary `ChooseCardsPrompt` is left for `SimpleTactic.resolvePrompt`. Technical Machine: Evolution PAR explicitly constructs a `ChooseCardsPrompt(player,...,player.deck,...)` after selecting a Bench target. Thus a hypothetical TM Evolution or another simulated search can reach the K1 observation callback before any actual player search.

If the original unguarded observer receives that speculative prompt, its shared closure advances K0 to K1; a later real Bunnelby decision can then read hidden Prize/deck membership while actual information is still K0. This is a code-path mechanism; whether it occurs in naturally dealt rank-2 games requires runtime instrumentation.

## Contained repair

[Committed policy guard](../../simulation/twinleaf/bunnelby-evolution-policy.cjs) now requires an explicit `isLivePrompt(state,player,prompt)` callback when `observeFirstOwnDeckSearch:true`. It invokes the K1 transition only when that callback verifies the prompt belongs to the actual live State. A legitimate integration should pass a predicate anchored to its live `Store.state`, ideally also checking membership of `prompt` in that State's pending prompts. No unguarded default is supplied, and the existing K0-only source policy and legacy policy are unchanged.

[Regression suite](../../tests/bunnelby-k1-observation.test.cjs) now supplies explicit state-identity guards, contrasts speculative versus root prompt observations, verifies refusal of an unguarded option, and includes a pinned `SimpleTactic.simulateAction`/TM Evolution probe. The existing manual-only [TM workflow](../../.github/workflows/aichi-tm-attack-policy.yml) was extended to run it. Source files passed JavaScript parse checks; **compiled Twinleaf execution has not been verified** because the manual workflow dispatch operation was blocked by the available GitHub Actions tool. Treat the new integration test as pending until a successful manual run and review.

## Remaining blockers

A separate **explicit opt-in** is now wired in [headless.cjs](../../simulation/twinleaf/headless.cjs): enable `bunnelbyK0SafeEvolution:true` together with `bunnelbyObservedK1:true`. The runner checks live `Store.state` identity, player membership, pending prompt membership and unresolved result before allowing the K1 knowledge transition. It records a separate `BunnelbyRootObservedK1-v1` policy label and boolean; default archived campaigns are unchanged. The [both-seat rank-2 source smoke](../../tests/bunnelby-k1-headless-smoke.test.cjs) is in the existing manual workflow but **has not been executed**. Next: run pinned compilation and tests, then capture genuine prompt chronology, both-turn-order hidden-Prize partitions and full-game noninterference. The same player can legitimately infer Prize identities after a real deck search, but full information-set fairness requires auditing all other bot tactics. This research has **0 qualified games** and supplies no evidence toward the 99.5% objective.

Relevant source files in pinned upstream: `ptcg-server/src/simple-bot/simple-tactics-ai.ts`, `simple-bot/simple-tactics/simple-tactics.ts`, `game/bots/simulator.ts`, `game/bots/bot-arbiter.ts`, and `sets/10-scarlet-and-violet/set-paradox-rift/technical-machine-evolution.ts`.
