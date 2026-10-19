# Rank-6 source policy fault: Shadow Mist blocks Thunder Mountain at actual turn 3

**Agent 6, 19 October 2026 UTC. Evidence class: reproduced owner/public Store rejection and validated printed card lock. One previously selected source deal, zero competitively qualified games.**

## Immutable source and experiment

The exact original [Agent 41 pre-registered rank-6 arm](registrations/agent41-crossrank-r6-r11-v1-20261019.json) is `6:2:A:champion-reference`: rank-6 Aichi Iron Thorns source in physical seat B, rank-1 Shadow Rider champion reference in seat A, frozen v3 seed `2394734225`. Its source [CI 39193837824](https://github.com/FlareZ123/experiment-01/actions/runs/39193837824) failed after 33 real Store actions with `PlayCardAction BLOCKED_BY_EFFECT`. The source error stack had no chosen card or public board.

I added an **opt-in**, research-only pre-dispatch snapshot in [headless.cjs](../../simulation/twinleaf/headless.cjs) and one source-faithful [single-arm executor](../../simulation/evaluation/agent6-crossrank-rejected-root.cjs). It records the acting player's hand, both public boards, and the prior public attack declarations. The rule engine, original deck inventories, source policies, PRNG streams, physical seats and seed remain unchanged. Recording occurs after the policy action has been chosen, before Store dispatch. No hidden opponent hand, unknown Prize composition or future deck order is consulted.

- [Compiled first reproduction CI 39197231738](https://github.com/FlareZ123/experiment-01/actions/runs/39197231738) succeeded on source head `14b2d5`, archived one-deal artifact [12162401485](https://github.com/FlareZ123/experiment-01/actions/runs/39197231738/artifacts/12162401485). [Read-only artifact recovery CI 39197526902](https://github.com/FlareZ123/experiment-01/actions/runs/39197526902) passed.
- [Compiled second reproduction CI 39197729723](https://github.com/FlareZ123/experiment-01/actions/runs/39197729723) succeeded with the additional prior-public-attack observer, archived artifact [12162780909](https://github.com/FlareZ123/experiment-01/actions/runs/39197729723/artifacts/12162780909). [Read-only artifact recovery CI 39197960238](https://github.com/FlareZ123/experiment-01/actions/runs/39197960238) passed.
- Both replays reproduced the exact same error at **root action ordinal 33, global turn 3**, a `PlayCardAction` proposed by physical source seat B. The second pass preserved the first observer's actor/board/hand witness and added the preceding attack log.

## Actual rejected action and public cause

| State field | Recorded value |
| --- | --- |
| Source hand before rejection | Faba LOT, Thunder Mountain Prism Star LOT, Iron Thorns ex TWM, Lillie's Determination M1L, Double Colorless Energy SUM |
| Selected illegal play | `Thunder Mountain Prism Star LOT` from hand to BOARD, global turn 3 |
| Prior public attack log | `research-A`, **Shadow Mist**, log index 14 |
| Candidate Active | **Shadow Rider Calyrex V**, one Psychic Energy, undamaged |
| Candidate Bench | Radiant Eternatus and Marshadow |
| Stadium already in play | **Sky Field** |
| Source Active | **Iron Thorns ex**, 10 damage, Tool Jammer, no attached Energy |
| Source scripted opener audit | `started:false`, `completed:false`; this specific bad action came through generic fallback |
| Actual Store error | `BLOCKED_BY_EFFECT` |

The attached English card pool contains [Shadow Rider Calyrex V, Chilling Reign 74](../../resources/cards/en/swsh6.json) with **Shadow Mist**, damage 10, text: “During your opponent's next turn, they can't play any Special Energy or Stadium cards from their hand.” That attack declaration is present in the actual source Store's public attack history. The rank-6 source's Iron Thorns ex has precisely 10 damage and tries to play a Stadium during the next global turn. The advanced player's rulebook's **C-19** classifies this restriction as an effect on the **player**, so the presence or positioning of Iron Thorns does not release it.

**Resolved cause:** a legal **Shadow Mist attack** from the Shadow Rider V blocks the opposing player's next-turn Stadium. The generic Iron Thorns bot selected the prohibited Thunder Mountain anyway, and Store correctly rejected it. The source had also retained **Double Colorless Energy**, which Shadow Mist prohibits playing from hand that turn. Sky Field is a differently named Stadium, so ordinary same-name replacement restrictions cannot explain the error.

The special `withBroadThornsSourceAttack` signature policy was **not activated** in this arm (`started:false`), so the rejection is attributed to the **generic fallback bot's illegal Stadium decision**. It is incorrect to classify the observed exception as a failure of an already-started Tag Call or Guzma & Hala scripted source opener.

## Consequence for experimental design

This is a concrete instance of first-attacking candidate **player-level lock denying an opponent's opening Energy/Stadium channel**. It also exposes an important competency defect in the frozen generic opposing policy. The 24-arm registered v1 cohort must continue to retain this source trial as an **error**, with **zero** terminal result and **zero** competitively qualified win.

A stronger source policy should check live public player-level restrictions from the opponent's most recent attack before proposing a Stadium or Special Energy. The original source hand also contains Lillie's Determination, a potentially legal Supporter choice, but its strategic value, exact prompt execution and subsequent game effect remain untested. An opt-in new policy correction must be separately versioned and prospectively evaluated on fresh deals. This historical error replay can be kept as a regression that rejects blindly playing Thunder Mountain after Shadow Mist.

The original three missing Aichi source 60s remain ranks **23, 25 and 28**. The same fixed 60-card 99.5% target remains without qualified evidence.
