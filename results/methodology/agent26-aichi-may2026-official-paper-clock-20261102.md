# May 2026 Aichi paper clock: Swiss timeout and Top 32 knockout have different outcomes

**Agent 26 | 2 November 2026 | official event rule extraction and conservative pure adjudicator.** No native games, new original opponent lists, simulated physical clock or competitively qualified matches were produced.

## Source and why it matters

The [official 2026 Aichi May event regulations](https://www.pokemon-card.com/info/005445.html) distinguish the May 10 eight-round Open League Swiss and the Top 32 single-elimination knockout. The round limit is 25 minutes in Swiss and Top 32 through semifinals; the final is 35 minutes.

**Swiss, at time expiry:** finish until the end of the second-starting player's turn. If the time call was during the first-starting player's turn, the second-starting player receives one extra turn. If the time call was already during the second-starting player's turn, that current turn finishes. The Pokémon Checkup after that final turn is excluded. If ordinary paper game victory has not happened, **both players lose**, even if one player has taken more Prize cards.

**Top 32 knockout, at time expiry:** also finish through the second-starting player's turn, excluding the subsequent Checkup. If neither player naturally won:

- If either player needs **two or fewer Prize cards** to win, whoever needs **strictly fewer** wins. If the counts are tied, continue an extension until a natural win or strict Prize lead.
- If both players need **three or more Prize cards** to win, continue the extension until a natural win, or one needs **two or fewer** and **strictly fewer than the opponent**.

In the knockout, a natural draw calls for a new six-Prize tiebreak game until one player naturally wins or needs fewer Prize cards. The event's Swiss excerpt does not specify an equivalent new-game procedure for a natural tie, so our model leaves that case unverified.

The Japanese regulations use the number of Prizes **needed to win**, rather than an arbitrary turn count or an early first-Prize advantage. An ordinary six-Prize game generally equates needed Prize cards with face-down remaining Prizes; variants or special effects altering that requirement must be interpreted separately.

## Decision table after the required second-player final turn

| Round | Needed Prizes player A / B | Actual official disposition if no natural victory | Incorrect shortcut |
| --- | --- | --- | --- |
| Swiss, 25 min | 2 / 6 | **Both lose** | Award A the game from a Prize lead |
| Swiss, 25 min | 3 / 3 | **Both lose** | Call it a draw without checking Swiss loss rule |
| Top 32, 25 min | 2 / 6 | **A wins** | Require complete six-Prize finish |
| Top 32, 25 min | 3 / 6 | **Extension required** | Award A the game from a Prize lead |
| Top 32 extension | 3 / 2, hypothetical later Prize state | **B wins** | Preserve A's provisional 3/6 lead as an already-final winner |
| Top 32, 25 min | 2 / 2 | **Extension required** | Select a winner from a tie |
| Top 32, 25 min | 3 / 3 | **Extension required** | Conclude a tie |
| Top 32 extension | 2 / 6, reached in extension | **A wins** | Reject permitted special extension winner |
| Final, 35 min | 3 / 5 | **Extension required** | Apply simple 25-minute Prize cutoff |
| New six-Prize knockout tiebreak | 5 / 6 | **A wins immediately** | Demand a normal six-Prize victory in tiebreak |

Each disposition assumes a verified actual time call, correct starting seat, completed final second player's turn, independently verified normal paper-game terminal status, correct Prize accounting and the excluded final Pokémon Checkup. None of those full prerequisites has been witnessed for a competitively qualified simulation result.

## Reproducible pure rule helper

[CommonJS oracle](../../simulation/evaluation/agent26-aichi-may2026-paper-clock-adjudicator.cjs) accepts the round, cutoff/extension phase, physical first-player and last-completed-turn seats, required Prize counts and optional independently verified natural paper win/tie. It returns official clock minutes, required physical final seat, the conditional disposition and any winner. The separate tiebreak phase can also identify the first strict Prize lead in a freshly initialized six-Prize knockout tiebreak. Every result explicitly has paperClockMeasured false and competitiveGameQualified false. Zero Prize with no verified natural paper result fails closed. The oracle cannot infer human-time minutes from the simulator's computer execution duration.

[Twelve pure regressions](../../tests/agent26-aichi-may2026-paper-clock-adjudicator.test.cjs) test Swiss both-loss and missing second-player turn; low-Prize knockout threshold and ties; midturn continuation; 35-minute final; precedence of natural victories and knockout tiebreaks; undefined Swiss natural tie; unverified zero-Prize and invalid input.

**Limitations:** This helper neither times an actual paper match nor validates full printed Pokémon action resolution. It does not qualify a Twinleaf terminal or establish a matchup result.

## Next research use

Attach a trusted event phase, actual physical time-call evidence, verified final-turn clock, full original source and candidate printed 60s, source-deal fingerprint and complete native action/payment/effect ledger before applying its disposition. Without those prerequisites, all outcome records remain competitively unqualified.

The shared field remains **29 authenticated original sixties out of 32**, with ranks 23,25,28 missing, zero qualified games and no demonstrated 99.5% win rate.
