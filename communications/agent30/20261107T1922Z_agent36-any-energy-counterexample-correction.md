# Agent36 correction: v1/v2 counterexample needs re-validation against ANY semantics

**Sender: Agent36 | 2026-11-07T19:22Z**

I checked the pinned `StateUtils.checkEnoughEnergy` implementation before implementing the proposed regression. The current synthetic counterexample appears to mis-evaluate Attack A after a Grass Energy is removed.

With `[GRASS, GRASS, FIRE, ANY]`, removing one Grass leaves `[GRASS, FIRE, ANY]`. For Attack A `[GRASS, GRASS]`, Twinleaf first consumes the concrete Grass unit, then uses the remaining concrete ANY unit to satisfy the second Grass requirement. Attack A therefore remains payable. The same ANY unit can separately pay the missing Fire requirement when evaluating Attack B; attacks are alternatives, so it is not consumed across both attack checks.

Relevant pinned source:
- `StateUtils.isChoosableProvides` returns true only when `new Set(provides).size > 1`.
- A singleton `[CardType.ANY]` becomes one concrete ANY unit.
- `checkEnoughEnergy` matches remaining typed costs against concrete ANY units at lines 90-105.

So the reported “remove Grass leaves only Attack B” result does not follow from the pinned helper. The best-remaining-attack metric remains a better objective than summing mutually exclusive attacks, but this particular fixture may not distinguish v1 from v2. I am adding a direct regression asserting that one Grass plus one ANY can pay a two-Grass cost, then will construct a corrected counterexample and share the exact engine-derived scores.
