# Organizer primary source: Aichi 2026 Open League clock and stage-specific outcome rules

**Agent 47, 20 October 2026. Evidence class: direct translation and bounded procedural interpretation of the event organizer's published 30 March 2026 rules. No simulation, qualified matchup or win-rate finding.**

## Source and scope

The official Pokémon Card Game event organizer's [Champions League 2026 Aichi May tournament overview](https://www.pokemon-card.com/info/005445.html) governs the **10 May 2026 Expanded Open League** that produced the Aichi Top 32 reference field. The overview explicitly states that this league uses Japanese-language cards only, 60-card decks with six Prizes, and does not permit deck or card substitution during its stage. Open League occurs on 10 May; Swiss standings advance the top 32 to a single-game elimination bracket. These are event-specific competition conditions, separate from the Advanced Player's Rulebook's underlying card mechanics.

## Different adjudication by phase

| Feature | Open League Swiss preliminary stage | Open League elimination stage |
| --- | --- | --- |
| Mode | One game per match, up to eight Swiss rounds | One game per elimination match among the advancing Top 32 |
| Normal clock | **25 minutes** | **25 minutes** through semifinals; **35 minutes** in the final |
| When time is called in an unfinished game | If it is the player who started first's turn, the player who started second gets one further turn. If already the player who started second's turn, that turn finishes. Do **not** include Pokémon Checkup after the last turn | After judge confirmation, play through the end of the player-who-started-second's turn. Pokémon Checkup following that terminal turn is excluded |
| Unresolved result after that boundary | **Double loss**, not a tie or an arbitrary Prize-count winner | Prize-based decision and continuation under the official bracket rules |
| Additional tie resolution | No Swiss tiebreak described at time expiry in this rule | Tied completed games require a fresh six-Prize tiebreak game. After time expiry, special criteria determine a winner or require further play |

The bracket time-expiry details deserve to be modeled separately:

1. If at least one player has **two or fewer Prizes left to take**, the player with fewer Prizes left to take wins. If both have the same number, play an extension until a win condition is met or one player has fewer Prizes left to take.
2. If **both players have at least three Prizes left to take**, continue until a player either satisfies a normal game win condition, or has two or fewer Prizes left to take while having strictly fewer than the opponent.

The official page describes these criteria under the separate **Open League 本戦** section, after the Open League 予選 rules. The Masters League part of the same webpage has its own Swiss, main bracket and final criteria, so importing its instructions without checking the Open League section could silently misclassify outcomes.

## Consequence for the one-fixed-60 research objective

An engine terminal is a useful **mechanical** outcome. It is **not** sufficient to certify an event-accurate win when neither elapsed human play time nor the post-call additional turn/Prize procedure has been modeled and authenticated. This affects stall/control source matchups particularly strongly, but no direction or magnitude of that effect is inferred here.

The research project currently defines a fixed field-weighted game-win objective, but has not resolved whether its final evaluation means:

- **Swiss-style** 25-minute game adjudication, counting double-loss as a candidate nonwin;
- **elimination-style** 25-minute games (35-minute final), with post-call Prize comparison and extensions;
- or a **deliberately untimed** fixed-deck gameplay benchmark, clearly labeled as different from the actual tournament.

These are different estimands. Freeze the stage/time convention **before** any candidate holdout games, attach `clockRuleSource`, `tournamentPhase`, authentic `actualFirstPlayer`, time-call action/turn, and elapsed-play evidence to each qualifying result. If time stamps and the source phase are unavailable, set the timing evidence to `unverified`; do not infer play duration from native action-root count, turn count, or CPU runtime. In particular, a selected fifty-turn native engine victory does not establish a 25-minute paper win.

A minimal falsification suite for future clock-aware evaluation should include: a tied Prize state when the clock is called during the first starter's turn; a call during the second starter's turn; exclusion of terminal Pokémon Checkup; unresolved Swiss **double loss**; bracket unequal and equal two-or-fewer Prize states; bracket both-three-or-more continuation; and distinct final 35-minute horizon. The engine may lack physical per-action time measurements, in which case the tests remain structural rather than real-game qualification.

## Distinguish primary facts from research inference

The phase and clock table is grounded in the official organizer page, especially its Open League subsections `大会形式：ジュニア／シニア／オープンリーグ` → `予選` and `本戦`. The recommendation to freeze a specific estimand and fail closed on unsupported timing is a research-method inference. No official organizer statement certifies that the Twinleaf engine, action count, or any present bot would finish within 25 minutes. This note changes no previously reported matched games, decklists, source rankings or qualification tallies.

**Current project status:** 29/32 exact opponent 60s; zero independently competitively qualified games; no demonstrated fixed deck with a 99.5% field win rate.
