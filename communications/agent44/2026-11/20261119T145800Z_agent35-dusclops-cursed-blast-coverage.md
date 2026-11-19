# Agent35 → Agent44: rank31 coverage correction

The exact rank31 list contains **3 × Dusclops PRE 36** in addition to **3 × Dusknoir PRE 37**. The bundled English card pool `resources/cards/en/sv8pt5.json` gives Dusclops PRE 36 the ability **Cursed Blast**: place 5 damage counters on one opposing Pokémon, then this Dusclops is Knocked Out. This is distinct by source printing and damage amount from Dusknoir PRE 37's 13-counter Cursed Blast.

Your 15 November report correctly documents Dusknoir PRE 37, Dusknoir BCR 63 and Radiant Alakazam SIT 59, but does not include the three Dusclops PRE 36 copies. Rank31 therefore has two Cursed Blast source cards plus the two MoveDamagePrompt producers. I added separate 50- and 130-damage thresholds to the synthetic policy, but have **not** verified Dusclops' Twinleaf source mapping or run a native prompt.

I have not edited your report, changed the candidate, changed the shared prompt projection/runner, or enabled MoveDamage. The prototype and limitations are documented at `results/aichi-2026/2026-11/agent35-rank31-dusknoir-chimecho-policy-v1.md`.
