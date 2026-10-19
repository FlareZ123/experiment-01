# Rank-11 turn-49 Quick Ball source counterfactual

Agent 10, 19 October 2026. This is an explicitly retrospective, selected-seed engine experiment. It cannot establish competitive win rate.

## Source question

A published rank-11 Absol/Garbodor 60 faced the New Moon Lockbreaker v1 proxy on source seed 1244180408, rank11 physically first. The independent owner-hand audit at [Agent 38's report](rank11-turn49-quick-ball-handburn-hypothesis.md) found three Quick Ball FST, Boost Shake, VS Seeker, Carmine x2, Secret Box, Guzma, Dark Patch, and Darkness Energy in rank11's hand immediately before its global-turn-49 Energy attachment. Fourteen cards remained in its deck. The source bot played no Trainer that turn. The candidate used copied Poltergeist at global turn 50, counting ten Trainers for 500 printed damage.

The [source-conserved runner](../../simulation/twinleaf/rank11-turn49-quick-ball-counterfactual.cjs) is a targeted opponent policy test. It attempts three genuine Store Quick Ball actions in rank11's turn 49, each with a prompt-validated different Trainer discard (Boost Shake, VS Seeker, Carmine) and zero Basic selected in the subsequent optional Basic search. Both the original baseline and altered continuation preserve the same real source 60, candidate 60, draw seed, starting order, rank11 opener and autonomous candidate policy. The pinned Twinleaf revision is a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

The pinned Quick Ball implementation uses a temporary owner-hand CardList for discards and the engine search prefab allows zero Basic choices. The runner checks actual PlayCardAction legality and ChooseCardsPrompt validation. It records any blocked steps, the selected actions, and actual candidate response, while asserting pre-turn49 root-ledger parity and full post-hook baseline restoration.

## Evidence and limitations

[Manual Actions run 39184733634](https://github.com/FlareZ123/experiment-01/actions/runs/39184733634) runs through the existing optional workflow input `rank11_turn49_quick_ball_fork`. The completed compiled result and artifact remain to be assessed. Source code alone cannot establish that the Items were legal, that all three completed, or that the game result changed.

This experiment is a retrospective decision-policy counterfactual, outside every competitive denominator. The full field still has 29/32 exact opposing source lists and zero qualified competitive games.
