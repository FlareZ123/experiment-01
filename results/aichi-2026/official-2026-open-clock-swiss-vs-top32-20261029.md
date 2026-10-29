# Aichi 2026 May Open League: original stage-specific clock and resolution rules

**Agent 41 | 29 October 2026.** First-party documentary evidence for the *actual* 10 May 2026 Japanese paper Expanded Open League (Aichi). This is a rules/source audit; **no simulated game passes clock qualification yet**.

**Official primary document:** [Pokémon Card Game, “Champions League 2026 Aichi May: Event Overview,” published 30 March 2026](https://www.pokemon-card.com/info/005445.html). The operative sections are `大会形式：ジュニア／シニア／オープンリーグ`, `予選`, `本戦`, specifically source lines 420–501. Do not import Masters League’s separate time and progression rules.

## Actual Open League configuration

- The **Open League used Expanded regulation**, 60-card decks and six Prizes, with **Japanese-language physical cards only**, per lines 74–96. The event specifies May 10 as Open League's single competition day, expected capacity 950, top32 advances after up to eight Swiss rounds; lines 143–160 and 420–442.
- **Open Swiss rounds:** one game per match, **25 minutes**, original list registered by the morning cutoff with **no deck/card swapping** throughout the competition. At the time-over announcement, finish the then-current turn. If that is a turn by the player who **started the game first**, give the second-start player one more turn; if the announcement occurs on the second-start player's turn, finish that turn with no additional turn. **Exclude Pokémon Checkup after the last turn**. If no winner has been determined after that resolution window, **both players receive a loss**. Source lines 428–456.
- **Top32 single-elimination main bracket:** one game per match, **25 minutes** from first round through semifinal; **35 minutes in final**; cards/deck unchanged. If the game is drawn, a fresh six-Prize tiebreaker decides on victory or earlier reduction in necessary remaining Prizes. On time-over, after judge check, finish play through **the second-start player's turn**; exclude Checkup after that final turn. If no normal winner, evaluate remaining Prizes needed to win: (1) if either player needs **two or fewer**, the player needing fewer wins, or play an extension if equal; (2) if **both need three or more**, play an extension until one wins normally or reaches two-or-fewer needed Prizes and leads the opponent. This is **not the Swiss double-loss rule**. Source lines 470–501.
- The engine's `actionCount`/260-root stop is a computational censor and contains no paper clock, move-duration, judge call-time or after-call resolution model. A 260-root cap must remain a **censored/clock-unverified** game, never a loss, win, draw, extension victory or forced Prize lead based on its raw last state.

## Why this matters to this repository

The target is explicitly the **Top32 field**, but interpretation of the objective matters: a fixed deck's hypothetical game win chance **versus** a field deck is different from an actual May Open League Top32 elimination match judged with time and prize-leading extensions. Future reported outcomes should state their estimand and stage-specific termination rules, and avoid pooling Swiss double-loss, normal game-engine KO, prize lead after time and tiebreakers as if all were interchangeable `winner` events.

A paper-clock calibration must observe physical move time including required setup and judicial time-over announcement, identify each actual player's original starting order, track post-call action/turn completion, exclude last Checkup where the event says, and preserve *separate* result categories for Swiss double-loss, bracket Prize-lead resolution, extension/tiebreak and normal win. A decision policy may change time consumption, so an arbitrary fixed root cap is not an adequate replacement. The official rule text does **not** specify a deterministic seconds-per-engine-action mapping, so any such mapping requires separately disclosed empirical assumptions.

## Explicit nonclaims

- The official page establishes the tournament's **2026 May Open League** rules, without proving every possible ruling on tournament disputes.
- The supplied `advanced-players-rulebook.md` describes ordinary Pokémon TCG mechanics, and does not itself certify this special event's timed after-call progression. Keep the original official event source distinct.
- These tournament procedures are distinct from any older **Master League**, other tournament, Pokémon TCG Live or international 2026 event time rules.
- We have **29/32 exact original opponent 60s** and **zero competitively qualified games**, with ranks 23,25,28 missing. This rules finding does not change that status.

**Research priority:** before certifying any Aichi Top32 gameplay win rate, implement a stage-parameterized game clock and event-resolution witness, validate against these distinct official criteria, and calibrate actual turn/decision durations or explicitly restrict the claim to untimed games. 

## Executable event-only adjudicator, with explicit witness boundary

Implemented the reusable, source-specific [`aichi-open-time-adjudication.cjs`](../../simulation/evaluation/aichi-open-time-adjudication.cjs) and [unit tests](../../tests/aichi-open-time-adjudication.test.cjs). The pure rules module exports `timeLimitMinutes`, `afterCallTurnWindow` and `adjudicateAfterTimeCall`. It distinguishes Swiss both-players-loss at unresolved timed expiry, actual normal game wins before remaining extra turns are consumed, bracket Prize-lead outcomes, bracket extensions, and separately authenticated bracket drawn-game six-Prize tiebreakers. Actual draw under Swiss is flagged unverified because the cited official passage only specifies unresolved clock termination, and does not resolve all possible native simultaneous-KO ties. It rejects impossible cases and **never** converts accepted game roots into an elapsed paper time. Caller must independently prove the real time call and end-of-turn/Checkup observations before a stage result can be scored; outputs retain `paperClockCertified:false` until external timing validation exists.

The module's first eight tests passed the repository's real Node CI manual workflow [40893787492](https://github.com/FlareZ123/experiment-01/actions/runs/40893787492). Subsequent drawn-game and early-normal-win cases added two more tests and passed isolated exact-source JS harness checks, pending their next ordinary compiled pipeline validation. These tests are deliberately a rule boundary, **not an estimate of physical decision seconds or actual competitive strength**.
