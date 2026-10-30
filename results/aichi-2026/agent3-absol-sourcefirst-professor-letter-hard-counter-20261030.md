# Original rank-11 Mega Absol can preload Darkness before Jellicent Item lock

**Agent 3 | 30 October 2026 | printed-card counter and exact source-first accessibility, no native or qualified-game evidence.**

## Threat beyond opponent Ability and Item denial

The authenticated original rank **11 Absol Garbodor** plays three **Mega Absol ex MEG86** (Basic Darkness, 280 HP), four **Professor's Letter BKT146**, eight Basic Darkness Energy, three Dark Patch, two Garbodor BKP57, two Guzma, two Temple of Sinnoh and two Shopping Center. The last four are Stadiums which may replace Silent Lab. Unlike rank8's distinct Absol Garbodor list, rank11 deliberately plays four Energy-search Items.

Mega Absol's **Claw of Darkness** costs two Darkness plus one Colorless, does **200 Darkness damage**, and discards one card from the opponent's revealed hand. **Jellicent ex WHT45** is a **270-HP Psychic Stage1 with Darkness ×2 Weakness**. Absent Weakness removal, damage prevention or another modifier, a legal Claw does **400 damage**, Knocking Out the otherwise protected Active Jellicent in one hit. **Stealthy Hood** prevents effects of opponent **Abilities**; **Silent Lab** removes Basic **Abilities**. Neither alone prevents ordinary Darkness attack damage. A correct early dual lock can therefore lose to previously assembled Dark Energy without any opponent Item action.

## Exact source-first prelock Energy availability

[BigInt evaluator](../../scripts/agent3-absol-source-prelock-dark-energy.cjs), [pure tests](../../tests/agent3-absol-source-prelock-dark-energy.test.cjs), and independent Python `math.comb` enumeration agree. The original source has **11 Basic Pokémon** (3 Mega Absol and 8 others), 4 Professor's Letter, 8 Basic Dark Energy, and 37 other cards. Its opening seven is conditioned Basic-valid; it draws one ordinary source-first card and has six random Prizes. A held Professor's Letter played **before candidate Item lock** searches up to two Basic Dark Energy from the remaining deck. Multiple held Letters are allowed, with all searched Energy required to survive Prizes.

| First source-turn opportunity among Basic-valid original sevens | Exact probability |
| --- | ---: |
| At least one Professor's Letter in first eight | **42.572155%** |
| Three Darkness naturally in first eight without Letter search | **5.388393%** |
| At least three Darkness accessible via hand and held Letters | **34.258047%** |
| At least two Darkness accessible | **59.503949%** |
| Mega Absol naturally in initial seven | **40.565606%** |
| Mega Absol in initial seven **and** three Darkness accessible | **12.929354%** |

These are resource-location events. They do **not** establish an actual turn-three Claw, native source choices, survival, or win probability. The opponent must retain the Energy, attach three over successive turns, maintain Mega Absol Active, and avoid candidate disruption. Other first-turn Items, Ball search, Dark Patch, later draws and candidate mulligan bonuses are excluded. The last row is a narrow original-Mega-opener opportunity rather than complete attacker access.

## Concrete counter-ALS requiring native resolution

One conditional **source-first** line: source starts Active Mega Absol, plays Professor's Letter on turn1 and attaches first Darkness; candidate going second plays **Arven → Secret Box (discard three) → Hood + Silent Lab + Boost Shake**, ending the turn with Active Jellicent. The source cannot play further Items under Oceanic Curse but can still manually attach its **second and third Darkness** on later turns. Source turn3, if it has retained the Mega and all resources, a legal **Claw of Darkness** against a still-Active Jellicent does 400 weakness-adjusted damage. A candidate anti-Dark tool or Energy, faster attacking, disruptive Supporter, alternate Active, KO or Stadium intervention could change the outcome.

This is especially adversarial for a player going second against source-first rank11. Source rank8 plays **five Darkness Energy and no Professor's Letter**; its Dark Patch dependency and other Trainer choices need a separately modeled opponent policy. Never transfer this rank11 source-first percentage to rank8 or other opponents.

**Decision:** Require the common native policy to demonstrate the source first-turn **Professor's Letter search receipt and saved Darkness**, subsequent two natural attachments, Claw damage and candidate actual response. Do not credit an Active Item lock as matchup success until a later-source attack/Prize trajectory is also tested. Bench-management/Guzma and source Temple of Sinnoh countering Weakness Guard Energy remain important.

Shared benchmark: **29/32 exact original Aichi opposing sixties, zero competitively qualified games, no validated 99.5% rate**, and no Agent3 fixed final 60.
