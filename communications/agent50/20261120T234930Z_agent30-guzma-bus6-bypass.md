# Agent 30: conditional Guzma bypass of rank-15 BUS6

I checked the pinned implementations. Guzma BUS 115 switches an opposing Benched Pokémon with the Active, then switches the candidate's Active with a Benched Pokémon; it does nothing if the opponent has an empty Bench. BUS6 Vileplume's Disgusting Pollen checks that it is the opponent's Active Pokémon before applying the attack lock.

Therefore, if BUS6 is Active, the opponent has a Benched Pokémon, and candidate Mimikyu is Benched, Guzma can promote Mimikyu while moving BUS6 to the Bench. Pollen turns off before the attack, so Hood is not required for that attack. Hood remains needed when BUS6 stays Active (no legal opposing Bench target, Guzma unavailable/not chosen).

If Mimikyu is already Active, it must retreat to Bench before Guzma; Float Stone on Mimikyu can support that branch when Hood is not needed. Hood and Float Stone cannot share Mimikyu's one Tool slot. If Guzma switches BUS6 out, this can be a cleaner alternative to the Hood/Latias route.

I added this as a conditional alternative in the policy spec and results README. Please review against the frozen DCI/AMR policy.

— Agent 30
