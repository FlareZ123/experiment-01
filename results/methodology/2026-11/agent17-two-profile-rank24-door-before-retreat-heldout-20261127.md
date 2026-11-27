# Two-profile successor held-out: rank24 requires Underworld Door before retreat into Tool-Jammer Active

Agent17 · 27 November 2026. **Decision affected:** two-profile candidate-policy sequencing against exact rank24 Iron Thorns. Static branch-code + exact card-scope review; not a native game or matchup result.

## Defect

Current successor branch `agent46/two-profile-policy-successor-20261127-v2`, worker blob `bda3de3608adbd19564d62e8b038002c52d89f28`, has this root ordering after deterministic final-prize lines:

1. score ordinary plays;
2. use Underworld Door first **only** when the best play is a hand reset or a nonterminal manual Psychic attachment;
3. take the best scored play;
4. call `chooseRetreat(...)`;
5. only **after retreat selection** consider general `Underworld Door`.

That ordering is unsafe against exact rank24.

Rank24 can have Active Iron Thorns ex with Tool Jammer. A Stealthy Hood on a **Benched** Shadow Rider VMAX remains effective because opposing Tool Jammer only suppresses the candidate Active's Tool. The Benched VMAX can therefore block Initialization and have a live Underworld Door.

If the policy then retreats/switches that Hooded VMAX into Active **before using Door**, opposing Tool Jammer turns off its Hood. Initialization can suppress Underworld Door immediately. The legal Door use that existed on the Bench is lost for the turn.

The already-derived paper sequence is therefore:
`Hooded VMAX on Bench → Underworld Door → promote/retreat into VMAX → attack`.

## Bounded public held-out

Construct a root with:

- opponent Active: exact rank24 Iron Thorns ex, Initialization live, Tool Jammer attached/effective;
- candidate Bench: Shadow Rider VMAX with Stealthy Hood, Underworld Door publicly live and unspent;
- candidate hand: at least one Psychic Energy;
- at least one legal Benched Psychic Door recipient (the source itself may qualify while Benched if represented by the frontier);
- candidate deck count >2;
- candidate Active can legally retreat/pivot into that VMAX and the pivot improves the attack;
- no deterministic final-prize line from the current Active;
- no scored hand reset/manual Psychic play that happens to trigger the existing `doorFirst` special case.

Current ordering can choose the retreat first. Correct ordering consumes the live Door before the position change.

For Max Geist, the Door attachment is additionally attack-relevant because its damage scales with Psychic Energy in play; the draw-two is also realized before the pivot. Once the VMAX becomes Active and loses Hood/Door, those completed effects are not undone.

## Repair shape

Do not globally move all Abilities before retreat. Add a narrow projected-suppression guard:

1. compute the retreat choice as today, but before returning it identify the incoming target;
2. if an available Underworld Door source is that incoming target (or another source whose live status will be lost by the same position change);
3. require Door is currently live/unspent, Psychic Energy is held, deck >2 and a legal recipient exists;
4. project the selected retreat/pivot and verify that the source's Underworld Door changes from `true` to `false` specifically because its Stealthy Hood becomes ineffective under opposing Active Tool Jammer / Initialization;
5. choose Door first, then allow the retreat on the next root.

This can be generalized as **consume a once-per-turn public Ability before a chosen position change that deterministically suppresses that Ability**, but only where the existing receipt can prove it is unspent and the effect is beneficial.

## Required negatives

- Door already used this turn → do not block the retreat.
- no Psychic Energy / no legal Door recipient / deck count <=2 → do not invent Door.
- Jamming Tower or another source already makes Hood/Door ineffective on the Bench → no special ordering.
- no opposing Tool Jammer / the Door remains live after projected retreat → preserve ordinary ordering unless another existing rule says Door first.
- current-state deterministic final-prize action → existing terminal priority remains above this sequencing rule.
- retreat into a different Pokémon that does not suppress the Door source → do not force an unrelated Door use.

## Evidence boundary

The worker already handles Stealthy Hood target effectiveness positionally and can distinguish Tool Jammer on Active from Bench Tools. The defect is the **root action order**, not the lock-resolution primitives.

No worker branch, candidate list, fixture, native runner, game or admission state was modified by this review.
