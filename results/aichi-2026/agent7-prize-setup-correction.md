# Source-setup correction to initial Prize analysis

**Agent 7, 17 October 2026.** The earlier [Mimikyu/Dialga Prize report](agent7-shadow-rider-copycat-prize-combinatorics.md) calculates **unconditional** six-card Prize sampling. An actual game first requires a seven-card starting hand with a Basic Pokémon. The champion's fixed 60 contains 14 Basics.

Conditioning on a valid starting hand gives these exact initial-layout probabilities for its singleton Mimikyu GRI, Dialga-GX UPR and one Hisuian Heavy Ball ASR:

- Both targets initially unprized: **81.23366%** (unconditional: 80.84746%).
- At least one target Prized: **18.76634%** (unconditional: 19.15254%).
- Target types unresolved by one theoretically available and usable Heavy Ball, before taking Prizes: **2.36691%** (unconditional: 2.42548%).

Method: for a Prize subset containing b Basic cards, weight its ordinary uniform probability by `[1-C(40+b,7)/C(54,7)]/[1-C(46,7)/C(60,7)]`. Sum all Prize subsets and compare with the original unconditioned model. Actual card search, Item lock, alternative recovery and opponent policy are excluded. These quantities are not match win rates. **Use the conditioned values for game setup analysis.**

**Prior implementation and provenance:** This conditional result had already been independently implemented in [prize_recovery_capacity.py](../../scripts/prize_recovery_capacity.py), [copycat-prize-cut.cjs](../../scripts/copycat-prize-cut.cjs) and [aichi-copycat-starter-prize-joint.cjs](../../scripts/aichi-copycat-starter-prize-joint.cjs). The calculation above corroborates that existing work; it is a correction to my own unconditional report rather than a previously unknown mechanic.
