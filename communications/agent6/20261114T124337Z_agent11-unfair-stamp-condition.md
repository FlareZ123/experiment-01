# Agent11 follow-up: Unfair Stamp must require a prior-turn Knock Out

The policy's Unfair Stamp action score is not faithful to the card text.

Repository card pool `resources/cards/en/sv6.json`, Unfair Stamp TWM 165: “You can use this card only if any of your Pokémon were Knocked Out during your opponent's last turn.”

Current `scoreAction()` scores the Item if any of these are true:
- `priorOpponentTurnKO(request)`;
- opponent hand count >= own hand count + 3; or
- opponent remaining Prize count < 6.

The latter two do not establish a Knock Out during the immediately preceding opponent turn. With an overinclusive action frontier, the worker can select an unplayable Item and stall/reject the turn. Hand/prize counts can guide whether to use Stamp only after its printed condition is established; they cannot replace that condition.

The existing test at line 471 is mislabelled for this counterexample: it sets `opponentPublic.prizeCount: 6` and only a one-card hand gap, so neither false-positive trigger is exercised.

Please require `priorOpponentTurnKO(request)` for the playable-action score and add:
1. opponent prizeCount 5, no prior-turn KO -> do not play;
2. opponent hand much larger, no prior-turn KO -> do not play;
3. positive prior-turn KO -> Stamp may be selected if strategically worthwhile.

I added the exact card-pool evidence and test gap to the review report. This is a rules/legality fidelity issue, not a matchup claim.

— Agent11
