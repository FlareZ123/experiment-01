# Official Aichi May 2026 Open League: stage-specific match clock and finish-of-time rules

**Agent 1 | 3 November 2026 | primary-source rules extraction and bounded implementation specification.** This is an official tournament-rule baseline for the original Aichi Open League Top32 benchmark. It supplies **no simulated game result**, verified opponent competence, or fixed-deck win-rate estimate.

## Primary tournament source

The Japanese Pokémon Card Game organizer's official [Champions League 2026 Aichi May event outline](https://www.pokemon-card.com/info/005445.html), specifically **`大会形式：ジュニア／シニア／オープンリーグ`**, `オープンリーグ` event day **10 May 2026**, and the `予選`/`本戦` rules in that section. The Open League is a distinct event group from the page's separate `マスターリーグ`; do not cite the Master's 35-minute day-one timer as the Open field rule.

Official page observations, paraphrased:

| Competition stage in the relevant Open League | Official match clock | If the clock expires without a resolved game |
| --- | ---: | --- |
| Open League Swiss qualifying, 10 May 2026 | **25 minutes** | Finish the necessary last turn of the player who started second. Skip Pokémon Checkup after that final turn. If no winner, **both players receive a loss**. |
| Open League Top32 through semifinal, 10 May 2026 | **25 minutes** | After judge inspection, continue to end of the player-who-started-second turn. Exclude subsequent Pokémon Checkup, then apply specific Prize/extra-turn rules below. |
| Open League final, 10 May 2026 | **35 minutes** | Same knockout finishing and Prize/extra-turn rules as the Top32 rounds. |

### Exact knockout clock-resolution contract

1. A game that already has a normal winner should resolve as a normal win. An ordinary tie in the knockout event triggers a separate new game, with **six Prize cards**, whose winner is the first to satisfy an ordinary win condition or hold fewer Prizes still needed to win.
2. At the end-of-time announcement, let the current turn finish through the **end of the player-who-started-second turn**. When the call occurs during the first player's turn, the second player receives an additional turn. When it occurs during the second player's turn, that current turn is finished. **No Pokémon Checkup occurs after that final turn.**
3. At that cutoff, if **either player has two or fewer Prizes still needed to win**, the player who has *strictly fewer* remaining wins. If tied, overtime continues until an ordinary win condition or one player has fewer Prizes still needed.
4. If **both players still need at least three Prizes** at that cutoff, overtime continues until an ordinary win condition or **one player has two or fewer Prizes remaining and strictly fewer than the opponent**. A lead at three versus four before reaching two does not settle that branch.
5. The two overtime branches have different thresholds. A simulator must preserve the branch recorded **at cutoff** rather than recomputing the branch after each Prize.

The official page provides the clock and end-of-time *adjudication*. It does not supply a probabilistic **wall-clock action-duration model**. Match duration depends on actual human play, shuffles, checks, announcements, judge interruptions and other unobserved factors. A hard `maxActions` in Twinleaf remains an action censor and is **not** a lawful substitute for the tournament's wall clock.

## Exact bounded reference implementation

The pure deterministic decision helper [`simulation/evaluation/aichi-open-official-clock.cjs`](../../simulation/evaluation/aichi-open-official-clock.cjs) labels stages `open-swiss`, `open-top32` and `open-final`. Its `timeCall` determines the required second-player final turn; `regulationDecision` produces the appropriate cut decision after that turn; and `overtimeDecision` maintains the already-selected overtime branch. It does not convert 180 native actions to 25 minutes or claim to observe actual time. **Twelve table-driven pure tests** cover normal win priority, Open Swiss dual loss, 25/35-minute distinction, both last-turn cases, both Prize thresholds, ordinary tied-game tiebreak, branch conservation and invalid-state rejection: [`tests/aichi-open-official-clock.test.cjs`](../../tests/aichi-open-official-clock.test.cjs).

The reference helper requires a normal game-end report when remaining Prizes become zero; do not assign a time-win from a zero-Prize state with missing terminal metadata. A Swiss simultaneous ordinary tie is marked as separately unresolved rather than assigned a guessed winner or dual loss, because the cited Swiss rule is specifically about **time expiry without a winner**.

## Required future integration

A competitively qualified original Open Top32 game needs authentic original source sixties, a paper-valid competent policy for both actors, an actual validated action-time model, the official stage and cutoff state, and fully observed remaining Prize values plus normal game conditions. The existing action-capped native results are developmental **censors**, not official end-of-time wins, even when one side has a Prize lead.

As of this finding, exact original opposing 60s for ranks **23,25,28 remain missing**, no match is paper-competitively qualified, and no candidate is demonstrated to meet the target 99.5% game win rate.

**Primary source:** [Pokémon Card Game official, CL2026 Aichi May outline](https://www.pokemon-card.com/info/005445.html), Open League sections `予選` and `本戦`, published before the event. This source is stronger for event-specific adjudication than assumptions from generic Expanded rules or native end-of-action labels.
