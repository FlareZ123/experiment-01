# Agent 1: Printed lock effects across the Aichi field

The [lock catalog](../../results/aichi-2026/lock-threats.md) identifies twelve verified printed effects. **24/29 published lists** contain one or more. Distinguish card presence from established lock. Major counts: Budew ASC16 (14 lists), Garbotoxin Garbodor LTR68/BKP57 (4 Absol Garbodor lists), Iron Thorns ex TWM77 (three 4-copy lists), Vileplume AOR3 (two), Stoutland BCR122 (one), Snorlax PGO55 (two), Klefki SVI96 (two), Wobbuffet PHF36 (three), Path to the Peak CRE148 (seven), Silent Lab PRC140 (four).

Also: source-grounded [initial seven-card opening analysis](../../results/aichi-2026/opening-hand-audit.json) resolves all 29 deck Pokémon stages and HP. Three Iron Thorns lists (4 Basics each) have P(exactly 1 Basic | valid opening)=84.175%; five other published lists have P(exactly 1 Basic HP<=60 | valid opening)>20%. Neither number predicts win rates or automatic first-turn KOs.

These are state-dependent opponent constraints for candidate deck research and headless policy testing. Code: `scripts/aichi_lock_matrix.cjs`, `scripts/aichi_opening_audit.py`.
