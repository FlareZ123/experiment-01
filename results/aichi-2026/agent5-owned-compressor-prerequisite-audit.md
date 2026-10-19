# Authentic candidate owner-root audit: the late Compressor cutoff hides available actions

**Agent 5, 19 October 2026. Evidence class:** fully compiled observation-only four-arm **retrospective historical** Store diagnostic. It preserves the original candidate and source decisions exactly, cannot qualify competitive match wins, and is not a new opponent cohort.

## Reproducible source and proof of noninterference

The [read-only actor resource observer](../../simulation/twinleaf/owner-compressor-opportunity-audit.cjs) wraps the pinned `SimpleTacticsAi.decodeNextAction` temporarily and restores the original method in `finally`. It samples the actor's own hand, Active/Bench, discard, Item-lock flag, own deck **length only**, global turn and unresolved-prompt state. It does **not** query opposing hidden hand/deck, unsearched owner-deck identities or unknown Prize identities. The read-only actor summary compares the *current* `shouldSeekPayload` predicate with the separate Benched-Mewtwo-enabled form, without changing the chosen action.

[Manual CI 39335868134](https://github.com/FlareZ123/experiment-01/actions/runs/39335868134) passed **19/19** focused tests, executed all four canonical historical source-dealt games, and asserted each full original root-action ledger SHA-256 exactly matches the previously published no-observer baseline. There were no engine exceptions. [Artifact 12225768792](https://github.com/FlareZ123/experiment-01/actions/runs/39335868134/artifacts/12225768792), ZIP SHA-256 `3519a91464a5962cc67ac22ecdb75ff7c5318926b935ba41664b2539b1fafa2c`, preserves `agent5-fourarm-own-compressor-opportunity.json` with every sampled root. Engine pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

**Caution:** decisions repeated within the same global turn are correlated; the table deduplicates turn-based tallies. The snapshots are the candidate's actual normal-turn root decisions; they are not fully exhaustive information-set states of all hypothetical actions, and no prompt-only callback is treated as an independent action.

| Original source stream and frozen candidate | Candidate root decisions | Distinct observed candidate turns | Turns with held Compressor | Mewtwo Active turns | Mewtwo Benched turns | Eligible turns, Active-only / Bench-enabled | Candidate attack declarations |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Rank6, champion reference | 25 | 4 | 0 | 0 | 0 | 0 / 0 | 3 |
| Rank6, New Moon | 43 | 18 | 0 | 0 | 0 | 0 / 0 | **0** |
| Rank11, champion reference | 51 | 15 | 3 | 0 | 0 | 0 / 0 | 1 |
| Rank11, New Moon | 48 | 24 | 2 | 24 | 1 | **0 / 0** | **0** |

Both source streams actually started with the candidate going first, so this artifact supplies no balanced start or competitive inference. New Moon capped at 260 roots in both streams; champion reference engine-terminal statuses remain unqualified.

## A concrete overlooked Item opportunity in the rank11 New Moon

In the original **rank11 New Moon seed `623585882`, candidate physical B**, global turn 11 contained two owner root decisions and turn 13 contained one. On all three actual pre-choice states:

- **Mewtwo & Mew-GX UNM was Active**, Battle Compressor PHF was in the owner's hand.
- The engine's public Item-lock flag was **false**; no unresolved prompt was outstanding.
- The owner's deck contained **33 cards** (turn 11) or **32 cards** (turn 13).
- Gengar & Mimikyu-GX was **neither on the owner's Bench nor in its discard**.
- The **current** `shouldSeekPayload` predicate returned false, and enabling just `allowBenchedMewtwo` did not change the answer.

The direct discriminator was `state.turn <= 6` in the prior default predicate. **The turn cutoff, rather than Active positioning or held-Item availability, blocked the native setup proposal at these particular real decision roots.** A separately observed first live owner deck-search in this same game showed one Gengar in deck earlier, but the identities of the still-unsearched owner cards at turns 11/13 have not been confirmed; the subsequent legal owner-deck prompt must determine what can actually be chosen. This is an **observable decision-policy miss**, and it remains unproven that playing Compressor leads to a viable copied attack or improved opponent outcome.

In the rank6 New Moon deal, *zero observed own-turn decisions held Compressor and zero had Mewtwo anywhere in play*. Increasing the cutoff alone cannot create the card or Pokemon availability absent in those snapshots. This distinction prevents overgeneralizing the rank11 proposed correction to rank6 or the 29 published opponent lists.

## Decision

Preserve the original six-global-turn gate in historical controls and prior published cohorts. A separately flagged development treatment can widen the owner-visible window to 14 **specifically to exercise the observed turn11/13 opportunity**, while retaining fixed printed inventories, original physical deals, source response policy, error/cap accounting and whole-game evidence. This is post-hoc mechanistic hypothesis testing, never a preregistered candidate superiority comparison. Verify an actual `PlayCardAction` for Compressor, closed `ChooseCardsPrompt` identifying owner-deck GX donors, a Store-accepted copied attack when possible and subsequent source response. A successful discard is only one step toward an attack and remains far from a win-rate qualification.

Existing full Aichi opposing 60s: 29/32, ranks 23/25/28 still unpublished. Competitively qualified games: zero.
