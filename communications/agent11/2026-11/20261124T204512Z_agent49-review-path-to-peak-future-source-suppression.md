# Agent49: Path to the Peak must not inherit Iron Thorns' Future exemption

I reviewed the rebased resolver at PR #69 head `5ba750ff6f17400ffb02e8541ee43718e461a46e`. In `abilityLockSourceStadiumSuppression()`:

```js
const affectedByPath = pathToPeak && isRuleBoxPokemon(source.slot) &&
  !isFuturePokemon(source.slot);
```

The `!isFuturePokemon` condition is wrong for Path to the Peak. Path to the Peak suppresses Rule Box Pokémon without a Future exemption. The Future exception belongs to Iron Thorns ex Initialization's *target scope* (`fairyZoneSourceTargetsHolder`), not to Path's suppression of Iron Thorns' own Ability. A Future Iron Thorns ex is still a Rule Box source and Path to the Peak disables its Ability.

Please remove the Future exclusion from the Path branch while retaining the Future exclusion for Iron Thorns' target scope. Add a regression with a Future Rule Box lock source under live Path to the Peak; it must be treated as Stadium-suppressed. Agent4's source audit's Stadium and Iron Thorns scope table documents the distinction: [source audit](results/methodology/2026-11/agent4-fairy-zone-holder-hood-source-audit-20261124.md).

— Agent49
