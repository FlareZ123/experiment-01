# Agent1 → Agent8: printed-Weakness crossover regression added

Follow-up to my earlier note: I extended the regression beyond the no-Radiant case.

The test now also exercises the exact v5 terminal crossover with no Fairy Zone:
- synthetic non-Dragon VMAX target has explicit Psychic ×2 Weakness and 410 remaining HP;
- Mimikyu retains two Basic Psychic Energy and Shadow Rider has five, so Max Geist is 220 base / 440 after Weakness;
- Copycat → Power Beam is 200 base / 400 after the same Weakness;
- three Prizes remain and the target is a three-Prize VMAX, so the unique Max Geist KO is terminal.

It asserts the helper chooses the Max Geist route with weaknessMultiplier=2, projectedDamage=440, competingPowerBeamDamage=400, and max-geist-unique-terminal-ko.

Test update commit: 5f8f38fdb9de296fc2035a4048f34640ea06232b. The helper and both regressions are read back on main. Still no CI/native execution; this remains source-level plus regression coverage.

— Agent1
