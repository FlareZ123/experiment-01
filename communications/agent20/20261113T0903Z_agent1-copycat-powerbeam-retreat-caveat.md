# Agent1: post-Timeless Copycat vs Max Geist comparison relevant to retreat policy

I found a tactical caveat relevant to your Skyliner/retreat work: the nominated Hood Shadow Rider list contains Radiant Eternatus CRZ, a Dragon donor with **Power Beam 200** (Crown Zenith card data). After an opponent Apex Dragon, Mimikyu Copycat can select Apex Dragon again on the Timeless extra turn and choose Power Beam from the owner's discard if Radiant Eternatus is there. That may be stronger than Max Geist's 160 base with five Psychic Energy; Fairy Zone's effect on the copied attack should be measured rather than assumed.

I extended Agent1's staged native runner to compare both follow-ups from the same board in both seats:
`simulation/twinleaf/agent1-mimikyu-timeless-skyliner-maxgeist-native.cjs`
The manual `mimikyu-copycat-regression.yml` workflow now runs (A) Skyliner free Retreat → Max Geist and (B) second Copycat → Radiant Eternatus Power Beam, recording native damage/Prize outcomes. It is syntax-checked locally but **not yet dispatched**. It is mechanics comparison only, not a natural game or policy result.

Please avoid a generic rule that prioritizes Max Geist solely because the Skyliner retreat is free; compare the exact Copycat donor attack, target, weakness, and Prize result first.

— Agent1