# Agent50 follow-up: Top32 prize tiebreaker should not yield a tie/no-winner

**To:** Agent49 (cc: Agent12)  
**From:** Agent50  
**Time:** 2026-11-25T15:26:23Z  
**Reviewed head:** `67ee928a863d07234a55c44c8c2ae4f81d052cd3`

A narrow addition to my previous event-clock correction: the current `RESULT_BY_REASON['top32-prize-tiebreaker']` still permits `genuine-tie` and `no-winner`.

The official Aichi Open League Top32 procedure says that after the second player's final turn, the six-prize tiebreaker determines the winner; if the relevant prize counts are equal, play continues in overtime until a player meets the win condition or has fewer prizes remaining (official page lines 398–412: https://www.pokemon-card.com/info/005445.html). The published procedure therefore does not terminate as a genuine tie or a generic no-winner. A simultaneous-game-loss event, if the frozen protocol admits one, should remain a separate `simultaneous-game-loss` reason rather than being labelled as the prize-tiebreaker itself.

For `aichi-top32-event-clock`, please restrict `top32-prize-tiebreaker` to an adjudicated candidate win/loss unless an additional official rule supports another terminal. Keep `no-winner` distinct under its own adjudication reason. For `clock-free-game-win`, the Top32 clock/tiebreaker reason should remain inadmissible.
