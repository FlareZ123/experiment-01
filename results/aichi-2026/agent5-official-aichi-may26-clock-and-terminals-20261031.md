# The actual CL Aichi 2026 May Open League clock changes the meaning of a “win”

**Agent 5 · 31 October 2026 · official event-source benchmark qualification contract.** Source of truth: Pokémon Card Game official [**Champions League 2026 Aichi May event rules, posted 30 March 2026**](https://www.pokemon-card.com/info/005445.html), specifically the separately labeled **ジュニア／シニア／オープンリーグ** (Junior/Senior/Open League) sections. This source applies to the Aichi Expanded **Open League held Sunday 10 May 2026**. Do **not** confuse it with the same webpage's different **Master League** timetable or with the December 2025 Aichi event.

## Event and opponent-field consequences

The original Top32 field and 99.5% one-unchanged-60 target use source-dealt paper Expanded (official Japanese term エクストラレギュレーション, Extra Regulation). The May event explicitly required a **60-card deck, six Prize cards and Japanese-language legal cards**. The Open League ran **one-game Swiss up to eight rounds**, then took the top 32 to a **single-game elimination bracket**; deck and card swapping during the event was forbidden.

**Crucial clock differences by phase:**

| Event phase | Nominal game time | Unfinished at the official end-of-time resolution |
| --- | --- | --- |
| Open League Swiss | **25 minutes** | **Both players receive a loss**, even if one has fewer Prizes left |
| Top32 elimination, round of 32 through semifinals | **25 minutes** | Resolve after the full second-starting player's turn, then use specific Prize-based award/overtime conditions |
| Final | **35 minutes** | Same elimination Prize/overtime protocol |

The official time-call protocol grants the **second-starting player** their finishing turn: if the call happens during the first-starting player's turn, that player finishes and the second starter receives one extra turn. If the call happens during the second starter's turn, that turn finishes without another turn. **Pokémon Checkup after the final second-starting player's turn is excluded** from the cutoff.

### Elimination Prize-based decision after that final turn

Assuming neither side has already achieved a normal game win:

- **At least one player needs two or fewer remaining Prizes:** the player with **fewer** remaining Prizes wins at that cutoff. If the counts are equal, continue overtime until a natural win or one side has fewer remaining Prizes.
- **Both need three or more remaining Prizes:** continue overtime until a natural win or one side reaches two or fewer Prizes **and** has fewer remaining Prizes than the opponent.
- Normal simultaneous game ties are handled with a fresh **six-Prize tiebreaker**, whose first decisive reduced-Prize state determines the winner under the event rules.

These outcomes can disagree strongly with a simulator that simply waits an unlimited number of turns for a natural Prize or deck-out terminal. A slow control/LO candidate that is eventually winning in an untimed engine can **lose its Swiss trial on clock (along with the opponent)**. In the Top32 bracket, the same turn- or Prize-sequence strategy may be subject to an additional cutoff adjudication. A raw native winner is therefore insufficient evidence for the original event's **timed** win rate.

## Minimal standalone, fail-closed qualification adapter

To expose the missing behavior without altering the pinned upstream engine or declaring a new simulated win, I added:

- [`simulation/evaluation/agent5-aichi-open-time-adjudication.cjs`](../../simulation/evaluation/agent5-aichi-open-time-adjudication.cjs), a pure, CommonJS, source-labeled reference with `CLOCK_MINUTES`, `endCallPlan`, `classifyAfterTime`, and `overtimePrizeWinner`.
- [`tests/agent5-aichi-open-time-adjudication.test.cjs`](../../tests/agent5-aichi-open-time-adjudication.test.cjs) checks both physical starting-seat orders, Swiss double loss even at 1 versus 5 Prizes, Top32 early Prize-lead resolution, final's 35-minute limit, tied 2-vs-2 overtime, 3-vs-4 overtime threshold, true natural terminal, and unmeasured-clock failure.

**Verified CI:** All these standalone clock-adjudication tests and the unchanged pinned native regression suite passed [manual workflow 41169113147](https://github.com/FlareZ123/experiment-01/actions/runs/41169113147), head `5e70f2cd2ce64754383b7c4be2af296ba14a6243`, [artifact 13030023841](https://github.com/FlareZ123/experiment-01/actions/runs/41169113147/artifacts/13030023841), SHA-256 `7078d8d2f6dd2c34db60dacbaf03e5ad6c34917fb9198ca8749ed13aa8c7f7ba`. This verifies rule *classification of supplied scenarios*, and deliberately does **not** verify paper-paced game time.

**Example terminal table**, assuming a *credible* observed time call, all required turns settled, and no prior natural win:

| Phase, cutoff public Prizes (physical seat 0, seat 1) | Correct outcome |
| --- | --- |
| Swiss, (1, 5) | Both lose; a Prize lead does not rescue the result |
| Top32, (2, 4) | Seat 0 wins on cutoff |
| Top32, (3, 4) | Overtime; seat 0 must reach at most two remaining or secure a natural win |
| Top32, (2, 2) | Overtime; next strict Prize lead or natural win determines winner |
| Final, (5, 1) | Seat 1 wins on cutoff |
| Any phase, reliable clock unavailable | **Unqualified**. Return no claimed event winner |

### What this adapter deliberately cannot certify

The existing two-player Twinleaf development drivers do **not** currently supply an authenticated wall-clock measurement, durable time-call snapshot, paper-faithful end-call continuation, official duration semantics, or opponent reaction-time evidence. The adapter requires its caller to pass both a **reliable clock witness** and an **already settled last second-player turn**; without the former it returns `unqualified-clock-not-measured`. These are caller assertions today, **not proof** that the environment generated credible clock evidence.

It does not modify the native Store, measure elapsed human thinking time, infer opponent pace, simulate a complete tiebreaker game, implement judge discretion, resolve simultaneous natural ties, or support other event seasons. For real tournament-strength claims, the call provenance must include start-time, total time, per-player end-call ownership, all resumed turns and settled Pokémon Checkups, any tiebreaker seeds, and an immutable audit trail. Seat-symmetric policies remain mandatory. The existing **action-cap counts** are neither ordinary engine game wins nor tournament-end losses automatically; each must be qualified or censored explicitly.

This official source changes the **definition of eligible win evidence**, and therefore the evaluation of a single fixed deck against all 32 Top32 lists. It does not establish a better candidate deck or certify any of the current 29 source-opponent game samples. **Still 29/32 exact published 60s, 0 competitive-qualified games, and no observed 99.5% win rate.**

## Source

Pokémon Card Game official website, [「チャンピオンズリーグ2026 愛知 May」大会概要](https://www.pokemon-card.com/info/005445.html), dated **30 March 2026**. Review the **Open League** clauses rather than the nearby distinct Master-League clauses. Any tournament season or rule revision needs a separate published source and an explicitly versioned adjudicator.
