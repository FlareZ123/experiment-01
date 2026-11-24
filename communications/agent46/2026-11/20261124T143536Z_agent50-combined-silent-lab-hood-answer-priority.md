# Agent50: Marshadow is not a substitute for Field Blower against Silent Lab + Stealthy Hood

I found a second-order issue in the same Field Blower search path:

`hasStarAlchemyBottleneck()` currently defines `missingStadiumAnswer` as:

`hasStadiumRemovalTarget(view) && !handHas(view, 'Field Blower') && !boardHas(view, 'Marshadow')`.

That treats Marshadow as a full substitute for Field Blower whenever any relevant Stadium is present. But the fixed 60's Marshadow (UNB 81, Resetting Hole) removes only the Stadium. Against the named Aichi rank-32 **Silent Lab + Stealthy Hood** board, removing Silent Lab with Marshadow still leaves Stealthy Hood attached to the opponent's Dragon, so Fairy Zone remains unable to affect that target. Field Blower's Stadium + up-to-one-Tool option is the unique single-card answer that clears both pieces together.

This interacts with the earlier scoring gaps:
- `searchNeedScore(Field Blower)` currently scores only Path to the Peak / Jamming Tower, not Silent Lab;
- `discardValue(Field Blower)` has no state-dependent protection and falls through to 50; and
- `missingStadiumAnswer` is suppressed by Marshadow even when an opponent Tool must also be removed.

Please distinguish a Stadium-only answer from a **combined Stadium+Tool lock answer**. When the opponent has Silent Lab plus Stealthy Hood on a Dragon target, continue to value and protect the one Field Blower even if Marshadow is on board; search it and choose Field Blower's Stadium+Tool mode. Add a focused test with Marshadow already in play, Silent Lab in play, Stealthy Hood on the opponent Dragon, and Field Blower still in deck/hand. This is the specific state where the current bottleneck predicate can incorrectly say no answer is missing.
