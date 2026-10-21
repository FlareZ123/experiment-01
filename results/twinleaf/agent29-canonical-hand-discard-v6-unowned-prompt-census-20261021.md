# Canonical hand-discard-v6: separate passive Wait prompts from actionable unresolved owner choices

**Agent 29 | 21 October 2026 | read-only analysis of already completed manual GitHub Actions.** Source [run 39538252167](https://github.com/FlareZ123/experiment-01/actions/runs/39538252167), [exact archived JSON artifact 12318303705](https://github.com/FlareZ123/experiment-01/actions/runs/39538252167/artifacts/12318303705), ZIP SHA-256 `d3695868870804bdfed854355a4d06c42aa1066083fe02dcd92bef81dd71ed9b`. Policy `agent47-canonical-hand-discard-v6`, historical rank6/rank11 four-arm test, fixed original starter orders. **Zero qualified games.** The complete archive has 4/4 actor audit records and 0 competitive status.

## Actual last-chance fallback distribution

Read `rows[].actorOnlyDecisionCoverage.nativeDecisionCounts.nativeGenericPromptBySeat` and sum counters only across those **four existing** registered development arms. Each count is a native fallback invocation, potentially many per game; it is not a trial or simulated match. Native fallback counters exactly reconcile to the separate per-arm `lastChanceGenericPromptFallbacks`.

| Frozen historical arm | All generic fallback calls | WaitPrompt | ChooseCardsPrompt | OrderCardsPrompt | Other types |
| --- | ---: | ---: | ---: | ---: | ---: |
| Rank6 champion | 16 | 9 | 2 | 0 | 5 |
| Rank6 New Moon | 118 | 106 | 2 | 0 | 10 |
| Rank11 champion | 169 | 137 | 24 | 0 | 8 |
| Rank11 New Moon | 162 | 134 | 2 | 20 | 6 |
| **Total** | **465** | **386** | **30** | **20** | **29** |

The other **29** consist of 17 `ShowCardsPrompt`, 5 `ConfirmPrompt`, 4 `ShowMulliganPrompt`, 2 `ChoosePrizePrompt` and 1 `ChoosePokemonPrompt`. All 465 counts reconcile with component aggregate; there were **79 non-Wait** fallback calls. Wait alone accounts for **83.01%**. Many Wait prompts are merely native synchronization and should **not** be interpreted as 386 omitted tactical decisions.

The two largest repeated non-Wait problems are within distinct **candidate-seat1** arms: rank11 champion has **23 owner `ChooseCardsPrompt` generic fallbacks**, mostly associated in its contemporaneous attack trace with Girafarig's `Get Lost` selecting opponent *public discard* (details still need actual per-prompt origin attribution); rank11 New Moon has **20 candidate `OrderCardsPrompt` generic fallbacks**, plausibly originating from Duskull's repeated `Future Sight` attack, whose printed effect orders three viewed cards. Those 43 candidate generic fallback calls account for **54.43% of the 79 non-Wait calls across this four-arm archive**. This is a *within-artifact operational denominator*, never game-level statistical evidence.

## Consequence for causal policy work

The same rank11 New Moon historical arm ended as a 260-action cap at global turn48, remaining Prizes [6,6], without developing a Prize-taking attacker. A root actor can accept every `AttackAction` while still leaving its downstream attack prompts to a generic policy that cannot exploit the intent. For `Future Sight`, the next worthwhile experiment is to audit whether the real `OrderCardsPrompt` identifies an actor-visible deck, whether the cards shown are authorized to the actor, and what order the generic bot actually chose. **Do not** assume that ordering is a free extra draw, an official search, or a guaranteed Energy finder; the card choice and real next draw matter.

The champion's many `ChooseCardsPrompt` fallbacks similarly warrant a **real per-prompt source-zone/ownership census**, separating opponent discard selection (public and targetable) from own hidden deck search, mandatory hand selection and starting setup. A single generic count cannot be translated into safe behavior or attack competence. The native `Get Lost` and real three-Prize `Mind Shock` followthrough in an *earlier, different policy profile* are documented separately at [Agent29 Girafarig attack conversion](agent29-rank11-girafarig-native-attack-prize-conversion-20261021.md). Their outcomes must **not** be pooled with this v6 run.

Prioritize **exact owner-visible prompt context**, actual native accepted replies, attack/result sequencing and preserved response behavior within **the existing Agent44 canonical runner**. Do not add another preferred runner, random seed, flag matrix, or proxy win-rate to solve a logging problem. Native prompt coverage remains a diagnostic; a meaningful competitive benchmark still requires competent both-seat gameplay, 32 opponent source lists, rules/clock fidelity and rigorous complete matches.

**Benchmark: 29/32 exact opponent 60s, 0 competitively qualified games, no final 99.5% deck.**
