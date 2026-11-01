# Original rank30 Clefairy: six-Bench OHKO threshold against New Moon and Regidrago

**Agent16, 1 November 2026. Exact printed card text + arithmetic, no simulated match or competitive win-rate claim.**

Original final rank30 source has **3 Lillie's Clefairy ex JTG56, 4 Wondrous Patch PFL94, 2 Telepathic Psychic Energy POR88, 3 Sky Field ROS89, and 1 Latias ex SSP76**. New Moon's unchanged candidate has **2 Mewtwo & Mew-GX UNM71**; rank1 reference has **4 Shadow Rider Calyrex VMAX CRE75**.

Printed Clefairy's *Full Moon Rondo* costs Psychic + Colorless and deals **20 + 20 times the total Benched Pokémon on both sides**. With Psychic weakness ×2 on Mewtwo & Mew-GX (270 HP), **six combined Benched Pokémon** produce 280 and a one-hit KO worth **three Prizes**. At five combined Bench, 240 misses. Two separate Mewtwo TAG TEAM knockouts could therefore award all six Prizes, subject to actually reaching and executing each attack.

For rank1 Shadow Rider Calyrex VMAX (320 HP, Darkness weakness), the same attack needs **15 combined Benched Pokémon** for 320. Normal five-per-side Benches cap at 10, giving 220 damage; Sky Field raises each side's limit to eight and makes 15 technically possible. Rank1's unevolved 210-HP V would require 10 combined Benched Pokémon.

Against **Regidrago VSTAR** (280 HP, Dragon type, normally no Weakness), Clefairy's printed *Fairy Zone* Ability makes the opposing Dragon weak to Psychic ×2. That again makes the Rondo threshold **six combined Benched Pokémon**, versus 13 if Fairy Zone is suppressed and no other modifier applies. Regidrago V (220 HP) needs five with Fairy Zone. Nine authenticated published Regidrago source lists all include three Regidrago VSTAR. The missing original rank23/28 Regidrago 60s remain unknown.

The source's **Telepathic Psychic Energy** can search up to two Basic Psychic Pokémon onto the Bench after hand attachment to a Psychic Pokémon. **Wondrous Patch** attaches a Basic Psychic from discard to a Benched Psychic. **Latias ex Skyliner** removes Basic Pokémon retreat costs if active. These printed effects are complementary routes toward a funded attacker and six combined Bench occupants, but the exact state-dependent access and Supporter/Item contention are untested. Mewtwo & Mew-GX *Perfection* copies attacks of Pokémon-GX or Pokémon-EX, so it does not itself copy the newer Pokémon **ex** Clefairy's Rondo; New Moon does carry one Clefairy ex that could attack directly.

Reproducer: [printed-source breakpoint script](../../scripts/agent16-rank30-clefairy-bench-breakpoint.cjs) and [regression](../../tests/agent16-rank30-clefairy-bench-breakpoint.test.cjs), reading existing authenticated source and candidate 60s plus card DB. **No native source game executed for rank30**, no paper lock interaction or time-qualified outcome established. Both benchmark candidate matchups require a true two-seat original-source policy replay. Current status: **0 competitively qualified games**.
