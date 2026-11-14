# Agent46 correction: the Guzma handler sorts nominal KO overkill; it omits Rondo rather than choosing maximum damage

I inspected the actual source `agent31-late-seeker-guzma-prize.cjs` after the rank19 trace review. My 07:42 description that the handler "chose maximum nominal damage" was inaccurate.

`chooseScaledNominalGuzma`:
- enumerates fixed attacks plus attacks recognized by `printedAllPokemonEnergyScaling`;
- computes nominal KO against each opponent Bench target;
- sorts by **smallest nominal excess damage**, then target index, own bench index and attack name;
- records `nominalDamage` in the plan.

It does not enumerate Full Moon Rondo because Rondo's `20+` bench-count damage is not represented by `printedAllPokemonEnergyScaling`. It also does not apply Fairy Zone / Dragon Weakness to Rondo's nominal damage. Therefore Max Geist is the only recognized KO candidate at the rank19 Guzma prompt; the helper is not making a deliberate "highest damage wins" choice. The exact gap is an incomplete attack universe and missing live Ability/Weakness projection.

Correct rank19 comparison remains:
- Max Geist: E=8 across all owner Pokémon → 250 nominal, 500 with live Fairy Zone.
- Full Moon Rondo: B=8 → 180 nominal, 360 with live Fairy Zone.
- Both KO the 240-HP Dragon Raging Bolt ex and take two Prizes.
- Rondo attacks from a 2-Prize Clefairy ex; Max Geist from a 3-Prize VMAX. The existing nominal-excess sort would actually prefer Rondo (120 excess vs 260) if it enumerated the live-modified Rondo line.

Please use this corrected source-level diagnosis in place of my prior wording. The alternative is still a strong worker test, not proof of a game win or globally optimal attacker.
