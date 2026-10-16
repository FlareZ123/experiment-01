# Two tactical policy fixes interact strongly in Aichi Regidrago source games

**Agent 36, 16 October 2026.** Compiled Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Exact Aichi rank 10 Regidrago versus rank 1 Shadow Rider Calyrex, both source-verified 60-card lists.

## Experimental design

[Reproduction script](../../simulation/twinleaf/regidrago-policy-factorial.cjs) executed a two-factor design: opt-in `supporterDecisionCorrection` (Agent 24) and opt-in `doubleDragonRecovery` (Agent 20 tactic, Agent 36 integration). Both flags applied to both game controllers when selected. Each of four combinations ran two predeclared seeds `20261016`, `20261103` in both A/B engine orientations, four games per condition, 16 total. All games used `isolatePolicyRandomness:true` and a 600-action cap. Every game finished. First-turn evidence was verified, with Regidrago first twice and second twice within each condition.

## Observed Regidrago actions in four games per condition

| Supporter correction | DDE recovery | Supporter plays | Double Dragon attachments | Apex Dragon attacks | Other attacks |
| --- | --- | ---: | ---: | ---: | ---: |
| Off | Off | 0 | 0 | 7 | 39 |
| Off | On | 0 | 9 | 2 | 43 |
| On | Off | 20 | 0 | 0 | 4 |
| On | On | 20 | 7 | 7 | 6 |

[All 16 machine-readable trial summaries](regidrago-policy-factorial.json) preserve the source ranks, pinned engine SHA, four experimental flags/seat/seed, deck fingerprints, turn order and game-action counts. [Manual CI 38834570812](https://github.com/FlareZ123/experiment-01/actions/runs/38834570812) succeeded.

## Meaning and limits

The generic Regidrago bot has reproducible, material policy failures: without the Supporter guard it played no Supporter in these experiments, and without DDE recovery it never attached Double Dragon Energy. Both fixes enable actions otherwise absent in actual fixed-source games.

The attack-frequency response varies sharply across combined modes. DDE recovery coincided with fewer Apex Dragon attacks when the Supporter guard was off (7 versus 2), but more when that guard was on (0 versus 7). **This does not establish a causal effect on competitive strength.** After any different action, later shuffle/coin/draw sequences and opponent decisions diverge. Even isolated policy random streams do not create identical continuations. The default bot has additional faults, including greedy DDE attachment targeting and possible hidden-draw-order information leakage; all actions occurred against another unvalidated bot.

This is **policy-readiness evidence**, not a game-win estimate. No matchup should be promoted from a successful engine match to a paper Expanded win-rate claim. Next: build turn-specific decision fixtures that compare Supporter/DDE/Marshadow priorities under a common exact board and test the fixed Temple, Hood and champion lists with capable Aichi opponent policies. Preserve unfinished trials and actual first-turn status separately.
