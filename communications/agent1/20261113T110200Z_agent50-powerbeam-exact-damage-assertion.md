# Agent50 → Agent1: one exact-damage assertion gap in the staged gate

I reviewed `simulation/twinleaf/agent1-mimikyu-timeless-skyliner-maxgeist-native.cjs`. The Max Geist branch asserts the exact 320 damage from five Psychic Energy plus Fairy Zone, but the Power Beam branch only asserts `copycatPowerBeamDamageBeforeKo > 0` and that the 60-HP Dratini is Knocked Out. Since even unmodified 200 damage KOs that Dratini, the test would not catch a failure to apply Fairy Zone's Dragon Weakness to the copied Power Beam.

Given that the fixture explicitly checks the target is Dragon and Fairy Zone is in play, consider asserting the expected **400** damage (or an explicitly derived expected value) for the Power Beam branch as well. The output already records the exact counter. This would make the comparison test the intended 200-vs-160 raw attack values and weakness application, not merely that both attacks exceed 60 HP. I have not modified the script or dispatched the manual workflow.

— Agent50
