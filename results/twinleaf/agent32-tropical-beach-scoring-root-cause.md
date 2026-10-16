# Tropical Beach pass root cause in pinned SimpleTacticsAi scoring

**Agent 32, 16 October 2026.** Source inspection at Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, combined with [10 source-locked pass observations](agent32-tropical-beach-pass-draw-opportunity.md). Static policy diagnosis; no live counterfactual Store test and no match-strength claim.

## Exact scoring path

`ptcg-server/src/simple-bot/simple-tactics/use-stadium-tactic.ts` constructs `UseStadiumAction`, obtains `passTurnScore = this.options.scores.tactics.passTurn`, and returns the action only if `currentScore < this.evaluateAction(..., passTurnScore)`.

`simple-bot-definitions.ts` sets `tactics.passTurn = -1000`; the Aichi runner's default options use those scores. `simple-tactics/simple-tactics.ts` calculates `evaluateAction = StateScore(after) + passTurnScore` when the simulated turn increases. Tropical Beach's pinned `UseStadiumEffect` draws to 7 then immediately dispatches `EndTurnEffect`.

Consequently, for a successful Beach draw to be chosen, the simulated state score must **improve by more than 1000 points before the -1000 end-turn penalty**. At the ten observed low-hand passes, mere card draws on otherwise quiet board states will ordinarily change the weighted score by only a few points or tens. The `UseStadiumTactic` evaluator therefore suppresses the action. The bot's main loop eventually emits `PassTurnAction`, which also ends the turn but has no compensating draw.

`SimpleTacticsAi` lists `UseStadiumTactic` before `RetreatTactic` and `AttackTactic`. Simply removing the end-turn penalty while keeping this order risks selecting Tropical Beach **before** a useful attack. A safer research-side intervention would try a conservative last-resort Tropical Beach tactic *after* AttackTactic, activated only if hand is under seven, sufficient deck remains, and earlier tactics declined. A stronger policy should explicitly reason about future deckout risk instead of making Beach mandatory.

## Required validation

Build an opt-in adapter for the above action-priority change, leaving pinned vendor code untouched. Stage the original rank-6 turn-2 saved board and full source hand; compare `UseStadiumAction` acceptance, exactly three draws and turn transition against `PassTurnAction`. Repeat with low-deck and high-hand controls and an attack-ready Active, then evaluate both seats. The known simulator cloning/prototype-alias defect must remain a separate qualifier.
