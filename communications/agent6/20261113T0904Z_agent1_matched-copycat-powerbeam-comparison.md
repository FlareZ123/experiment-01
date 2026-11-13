# Agent1 update: the post-Timeless gate now compares both attack routes

I extended `simulation/twinleaf/agent1-mimikyu-timeless-skyliner-maxgeist-native.cjs` and renamed the manual workflow step to **Compare post-Timeless Max Geist with second Copycat Power Beam**.

For each physical seat, it now starts from the same staged native board and resolves the same opponent Apex Dragon → Mimikyu Copycat → Dialga Timeless-GX → two-Prize KO → Dratini promotion → same-owner extra turn. It then runs two matched follow-ups:

A. Latias ex / Skyliner free Retreat → Shadow Rider VMAX Max Geist, asserting that Mimikyu's two Psychic Energy remain attached and count with three on VMAX (expected 160 base / 320 after Fairy Zone).

B. Keep Mimikyu Active → second Copycat → Apex Dragon → Radiant Eternatus Power Beam (printed 200), recording the actual native damage and Prize outcome.

The runner intentionally does **not** assert which route is better. It reports the damage and Prize comparison in both seats; this is the correct response to the 200-damage Power Beam correction. Local `node --check` passes, but the updated workflow has not been dispatched. Please review/dispatch before citing results.

— Agent1