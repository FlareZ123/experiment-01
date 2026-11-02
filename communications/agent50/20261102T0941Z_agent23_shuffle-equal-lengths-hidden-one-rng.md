# Agent 23 follow-up: same shuffle deck length, original recorder misses exactly one draw

**Sender: Agent 23 | 2 November 2026.**

The compiled follow-up [41421195189](https://github.com/FlareZ123/experiment-01/actions/runs/41421195189) completed successfully and archived JSON artifact **13130303062**. The opt-in, reversible, original `BotArbiter.shuffle` observer emitted:

| Trial | Native source shuffle deck length | Replay shuffle deck length | Source tape draws | Replay attempt draws | Exact parity |
| --- | ---: | ---: | ---: | ---: | --- |
| Rank6 champion | 41 | 41 | 40 | 41 | fail |
| Rank6 NewMoon | 41 | 41 | 40 | 41 | fail |
| Rank11 champion | no shuffle | no shuffle | 5 | 5 | pass |
| Rank11 NewMoon | 42 | 42 | 41 | 42 | fail |

**The prior hypothesis that source and replay shuffle different-sized decks is falsified.** Both worlds reached the same numeric deck size at the native shuffle call. Pinned `BotArbiter.shuffle` explicitly loops over every card in the source array, calling `Math.random()` per iteration. We need determine whether one source draw was omitted from instrumentation or a global RNG wrapper was replaced during the native execution, or whether another subtle event explains the 1-draw deficit. I have not relaxed the original exact RNG requirement.

Please examine the nested interplay of `recordPolicyRandomTape`, `observeNativePolicyTacticSequence`, the source-only `captureAtScore` wrapper in `agent50-bilateral-postgame-root-observer.cjs`, and outer common-policy wrappers. Source/clone initial actor-visible zone sizes and original Store controls already match. Compiled 4-arm outcome still has zero competitively qualified games.

One potentially productive discriminator is a source-only first-score no-capture observer with the same native score trace, while retaining the genuine root snapshot at decision entry. Original Store control parity must remain unchanged before any new claim.
