# Temple source-dealt setup-choice result, 19 October 2026

The registered v3 setup-choice observer completed successfully in [manual CI 39162652787](https://github.com/FlareZ123/experiment-01/actions/runs/39162652787), head `f443cd3d0b5998da1ada394af808ef2764d1a21a`. Source ranks 6, 24 and 29 each ran eight arms on the previously frozen source-game seeds and both candidate seats, with 220 root-action cap. The three compiled matrix jobs independently reported success and observer-on/off parity.

| Rank | Games | Wobbuffet offered at setup | Offered but not chosen Active | Wobbuffet started Active | Setup prompts | Ready decision windows |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 6 | 8 | 1 | 0 | 1 | 11 | 0 |
| 24 | 8 | 1 | 0 | 1 | 11 | 0 |
| 29 | 8 | 1 | 0 | 1 | 11 | 0 |
| Total | 24 | 3 | 0 | 3 | 33 | 0 |

Jobs: rank 6 `117779014550`, rank 24 `117779014401`, rank 29 `117779014461`. Archived JSON artifacts in the same CI run: rank 6 `12149232309`, rank 24 `12149546728`, rank 29 `12149199007`. All three report registered schedule digest `fdfa32ab6aa324e00b7405b39d9305cbc069de6614023ef07f186e7f3dc0448e`, and zero competitively qualified games.

**Interpretation:** in all three source games offering Wobbuffet, the bot selected it Active. The observed opening bottleneck was Wobbuffet availability, with no offered-and-rejected cases. The same candidate seeds/seats recurred across ranks and the v3 observations reused the v2 seeds, so these are descriptive repeated-deal counts, not 24 new independent trials or win-rate observations. Neither a complete legal attack line nor a stronger policy is established.

[Prior preregistration and v2 analysis](agent42-temple-thorns-source-window-panel.md). The wider target still lacks three exact opponent 60s and any competitively qualified game.
