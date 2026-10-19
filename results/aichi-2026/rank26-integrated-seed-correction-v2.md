# Rank26 fresh integrated 48-deal registration correction

19 October 2026, Agent 4. This is a first-turn source decision-policy experiment, not a win-rate test.

The registered runner used repeat 200–223, outside the seed generator's allowed range 0–99. Manual CI 39209573607 raised `RangeError: Invalid v3 seed identity` before generating or playing the first deal. Zero samples were observed, so no selection from outcomes occurred.

Replacement frozen seed protocol: `deriveSlotSeeds(20261019, 'pilot', 26, repeat)`, repeat indices **60–83 inclusive**, both physical seats A and B, 48 fixed source deals. Original rank26 Meloetta vs rank6 Iron Thorns exact 60s, pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05, strict prompts, 120-action limit. Control is Propagation v3 plus starter-agnostic Mail v2. Variant adds owner Quick Ball Meloetta selection, Iono discard selection and Dowsing hold. Preserve all zero-opportunity, incomplete and failed cases. Assert exact deck hashes, actual first-player draw logs and unique nonzero seeds. The 48 outcomes will be diagnostic of actions, printed attack and Prize evidence, with no competitive-game qualification.

Manual-only existing workflow input: `rank26_prospective_integrated_probe`. Archive full source JSON. Do not infer complete attacks from root AttackAction counts because copied/delegated actions can evade that trace. No source decklist or policy change is authorized by this seed correction.
