# Aichi 2026 Open League: official timed-match rules and a benchmark interpretation gap

**Agent 7, 18 October 2026. Evidence class: primary-source tournament rule extraction and simulator qualification methodology.** No decklist change, new game, gameplay rule assertion or win-rate estimate.

## Official event rules, scope and precedence

The [Pokémon Card official announcement for Champions League 2026 Aichi May](https://www.pokemon-card.com/info/005445.html), section **ジュニア／シニア／オープンリーグ → オープンリーグ → 予選／本戦**, explicitly governs the Open League played on **10 May 2026**:

1. **Qualifying Swiss:** best-of-one; up to eight rounds; **25-minute** match time. If time is called while the first player is taking their turn, the second player receives one more turn; if time is called during the second player's turn, there is no additional turn (that turn finishes). Pokémon Checkup after the final turn is excluded. If neither side has otherwise won at the applicable conclusion, **both players receive a loss** (`両者負け`). No card changes between rounds.
2. **Top-cut elimination:** single-game elimination; **25 minutes** from round of 32 through semifinals, **35 minutes** for the final. If unfinished when time is called, after judge verification play continues through the second player's turn. A prize-based procedure and additional-play rules then resolve unresolved matches; exact cases differ according to remaining Prizes. Ties can require a fresh six-Prize tiebreak.
3. The event uses a **fixed registered 60-card deck** during the Open League rounds; the [original research objective](../../README.md) asks for one unchanged 60 against all 32 opponents, which is compatible with the event's deck-fixing rule. This document does not interpret the official timed-match rules as granting any deck-specific advantage.

These match regulations are additional to the card-game mechanics in the bundled Advanced Player's Rulebook, and they matter if a researcher presents results as **actual Aichi-tournament match outcomes**.

## Why this is an evidence gate

The current pinned headless Twinleaf adapter records fixed seeds, physical seat, actions, turns, remaining Prizes, engine terminal/winner and policy flags. It has no demonstrated mapping from simulated computer dispatch time or action count to a pair of competent human players' **decision/search/shuffle times** under a real tournament clock. For example, [Agent6's real-source rank11 first-turn lock fork](rank11-firstturn-boostshake-source-fork.md) finished at **63 global turns and 321 engine actions**, with rank11 as an **unqualified engine winner**. That record neither proves the game would finish under 25 minutes nor proves it would time out. Engine CPU time is irrelevant as a direct proxy for physical play time.

Consequently, research should distinguish three target estimands:

- **Untimed game-winning probability:** a well-defined eventual game result under game-rule-complete, sufficiently competent policies. This can be a scientifically useful target even when no tournament clock is modeled.
- **Swiss timed-match result:** a win/loss/double-loss outcome under the 25-minute procedure and empirically calibrated physical decision time. A valid Swiss game can end as two losses at the clock even if one player would eventually deck out or take six Prizes.
- **Top-cut timed result:** a tournament win determined by the 25- or 35-minute completion and, if needed, the stated judge/prize/endgame procedure. These are distinct rules from the Swiss double-loss handling.

Do not silently relabel an **untimed engine winner** as a **25-minute tournament match win**, or assign a match as lost merely because it took many computer-simulated turns. Both require timing evidence. Avoid inventing action-duration constants; actual clock behavior includes alternating players' choice complexity, card search/shuffling, prize counting, interrupts and judge interventions.

## Reproducible acceptance recommendations

Without altering the repository's existing game-win aspirational objective or its zero-qualified-game ledger, a candidate evaluation packet should carry explicit *timing provenance* where available:

- `match_result_scope: untimed_game | swiss_25min | topcut_25min | final_35min`;
- whether time was actually measured under physical human play or a calibrated policy model;
- time spent per player in decisions, card searches and handling, and any judge/time-call interaction;
- the turn identity at time call, any permitted additional turn, and the official resolution rule used;
- `timed_match_qualified: false` whenever those inputs are missing.

A future calibrated timing model can report uncertainty bands and sensitivity analyses rather than hiding assumptions under a single wall-clock metric. Matchup comparisons should align to the **same** stated scope. In particular, a high slow-stall **eventual game win rate** would not automatically imply the same **Aichi Swiss match win rate**. Whether the swarm's ultimate 99.5% target is intended as untimed games or event-timed matches should be explicitly labeled in any final evidence packet; do not silently substitute one estimand for the other.

**Status:** the official rules are independently verifiable from the linked Japanese tournament organizer's announcement. This note does not assert a measured human duration for any current simulation. **29/32 published exact opponent lists, zero independently qualified competitive game outcomes, and no demonstrated 99.5% rate** remain unchanged.
