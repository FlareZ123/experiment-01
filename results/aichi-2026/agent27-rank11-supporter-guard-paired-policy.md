# Exact-deal rank11 versus New Moon: the Supporter guard changes both autonomous sides

**Agent 27, 18 October 2026.** One paired source-dealt research-policy diagnostic, with matched printed decks, engine inputs, seed and true first player. No qualified competitive games or causal estimate of the value of an individual card.

## Why this pair was run

Twinleaf's pinned `PlaySupporterTactic` prematurely sets `player.supporterTurn` during **hypothetical proposal**, and its own action-legality screen can consequently reject a legally proposed Supporter. The existing reversible `SupporterDecisionGuard-v1` restores the predecision turn marker and leaves the actual reducer responsible for consuming the play. The [staged test](../../tests/supporter-decision-hook.test.cjs) demonstrates this defect with printed `Guzma & Hala`; the [earlier six-game field audit](agent25-rank6-six-game-audit.md) also found zero Supporters on either side of all six default-policy source matches.

The manual campaign already knew the opt-in `simple-supporter-guard-v1` profile internally but omitted it from its choice list. Agent 27 added the existing profile name to the [manual campaign workflow](../../.github/workflows/aichi-source-locked-campaign.yml) in [commit 5dfa7145dd4c6235518a762e11d71195c9ee2546](https://github.com/FlareZ123/experiment-01/commit/5dfa7145dd4c6235518a762e11d71195c9ee2546). No upstream card, engine or tactic algorithm was changed.

## Controlled source deal

Both compiled manual runs executed **the identical scheduled trial** `pilot:11:0:new-moon-lockbreaker-v1:B`, printed New Moon candidate in **physical B**, published Aichi rank-11 Absol/Garbodor in **physical A**, engine seed **83934472**, and independently verified that candidate B **actually played first**. Twinleaf pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both input hashes matched in each run and across the pair:

- Source rank-11 resolved card-array SHA256 `ca1a7ce02983c438146f30bf01f303cf8210836f9e442e0d21a2513850ffcb18`.
- Frozen New Moon resolved card-array SHA256 `99969539010abfa11c4e671a5744ed4d97f23cf2f7f275399ac35f5bc1013c0f`.
- Candidate printing digest `012f774efb2fd5452cc3a46019edc41d5f8aececbd59815ed0af618aa3373184`; opponent `967308cd60e92348d8069a348174d816efcaa06f3825a3cf45b64886facb1273`.

| Condition | Rank11 autonomous profile (untriggered) | Supporter guard profile |
| --- | --- | --- |
| Run | [CI 39106804578](https://github.com/FlareZ123/experiment-01/actions/runs/39106804578), [artifact 12129175438](https://github.com/FlareZ123/experiment-01/actions/runs/39106804578/artifacts/12129175438) | [CI 39107220132](https://github.com/FlareZ123/experiment-01/actions/runs/39107220132), [artifact 12128494832](https://github.com/FlareZ123/experiment-01/actions/runs/39107220132/artifacts/12128494832) |
| Rank11 autonomous Boost Shake opportunity | 0; its source-first condition was ineligible | Not installed |
| Candidate Supporters actually played | **0** | **1 Lillie's Determination** |
| Source rank11 Supporters actually played | **0** | **3 Guzma** |
| First choice divergence | Source turn 8 would `PassTurnAction` | Source turn 8 selects `PlayCardAction('Guzma')` |
| First 25 normalized decision events | Identical | Identical |
| Source actual Store attack declarations | 20 | 16 |
| Candidate actual Store attack declarations | 0 | 0 |
| Terminal root actions / global turns | 274 / 54 | 287 / 48 |
| Untimed simulator outcome | Rank11 win, Prizes [0,6] | Rank11 win, Prizes [0,6] |
| Competitively qualified games | **0** | **0** |

The source `cardsPlayedBySeat[0]` ledger confirms **three** actual Guzma plays in the guarded arm; this count is from the complete game, rather than the first-turn excerpt.\n\nThe first action difference occurred at **decision event 25**, after an identical 25-event prefix, while the source side still occupied the same physical seat. The observed source Guzma intervention changes later action timing, so the candidate Lillie play cannot be interpreted as an isolated candidate-side treatment. Opposing opportunities and available actions can change after the first divergence. The printed `Lillie's Determination` was actually held through many default-policy candidate Passes, and is played once in the guarded continuation.

The default arm used `rank11-autonomous-boostshake-v1`, while the corrected arm used `simple-supporter-guard-v1`; **these are distinct bot profiles**. The ranked source's autonomous Boost Shake policy had `opportunityDetected:false` in the default arm because rank11 started second, so the sample shows a particularly clean early comparison of the generic and Supporter guard behaviors. It does *not* prove the two profiles have identical non-Supporter behavior in all other situations.

## Interpretation

This pair provides source-dealt evidence that a concrete legal-action decision defect changes actual play on both sides, along with staged mechanics evidence explaining why. It also illustrates why engine win-rate comparisons under different bot profiles are not isolated estimates of deck strength. Further validation needs actual candidate-first and opponent-first strata with **one fixed combined profile containing the Supporter correction and any necessary source-specific policy**, exact action replays, and demonstrably competent threat and reply sequences. The user-supplied rulebook limits ordinary Supporters to one per player turn, but does not justify suppressing a legal held Supporter merely because the AI *considered* it.

The opponent source inventory is one of 29 recovered out of 32, and no bot-policy-competent or clock-qualified Aichi full-field win rate has been demonstrated.
