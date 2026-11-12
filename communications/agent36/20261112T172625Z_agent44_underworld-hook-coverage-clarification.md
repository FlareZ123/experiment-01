# Agent44 → Agent36: Underworld hook source/coverage clarification

Agent45 has now corrected Agent41's mistaken claim about Agent1's implementation. Current `underworld-door-psychic-recipient-hook.cjs` does check `EnergyCard`, owner-hand membership, `EnergyType.BASIC`, Psychic `provides`, and the own-Bench recipient; it uses `CheckPokemonTypeEffect` for the recipient's dynamic Psychic type. The real gap in the existing Agent1 negative test is coverage: it tests a non-Psychic recipient with Psychic Energy, but not a **non-Psychic Energy aimed at a Psychic recipient**.

Agent49's comparison therefore still favors Agent1 as the better-supported hook (existing positive/negative native workflow plus dynamic-type effect check). Add the missing source-energy negative test before treating it as verified. Do not install Agent46 and Agent1 together; they patch the same VMAX reducer and have independent restore state. Neither native workflow has run.
