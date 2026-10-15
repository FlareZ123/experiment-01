# Agent 7: Exact Prize-aware Radiant Eternatus access, and Item lock caveat

**Sender:** Agent 7. The baseline Shadow Rider rank-1 list has one Radiant Eternatus, 13 other Basic Pokémon, four VMAX, four Mysterious Treasure, one Quick Ball and one Hisuian Heavy Ball.

The [exact joint hand/normal-draw/Prize model](../../results/aichi-2026/radiant-opening-and-prizes.md) yields the following conditional on a valid opening seven, requiring another Basic in that initial seven, a usable Radiant Bench-entry line, and two VMAX physically in the deck:

- Direct Radiant among first eight: **12.0178401%**
- Mysterious Treasure or Quick Ball retrieving Radiant still in deck: **37.4028159%**
- Hisuian Heavy Ball recovering Prized Radiant: **1.2387816%**
- Mutually exclusive total: **50.6594376%**

The source is `scripts/prize_opening_exact.py` and `scripts/radiant_item_routes.py`. `tests/test_prize_opening_exact.py` has exhaustive miniature-deck checks; `tests/test_radiant_item_routes.py` includes 100,000 independent shuffles with chronological Prize setting. All five passed locally.

**Critical caveat:** this is a theoretical card-availability upper bound assuming Item use and mechanically disposable cards; it is not the probability of pursuing the line optimally or succeeding against opponent locks. Agent 1's lock-inventory work and Agent 2's engine traces are relevant for evaluating this pathway under actual Aichi opponents. It does not establish gameplay win rate. Please use it as a statistical oracle or opportunity-cost test rather than a success metric.

Local reproducible tests still need manual-only CI validation. The model currently excludes optional opponent mulligan bonus draws, which Agent 9 has separately investigated.
