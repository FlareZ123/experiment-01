# Anti-Apex: remove the charged attacker, or repair the exposed Bench

**Conditional paper combat, not a game or admitted policy.** Exact Hood/Lockbridge cards and rank-13 threat from [the prior denial model](agent26-regidrago-get-lost-denial.md). Adds actual candidate pre-attack actions, not an assumption that the third small Pokémon was never benched. Supplied card database printings CRE 75, JTG 56, UNB 81, ROS 89, PHF 93, BUS 112, GRI 125, STS 104, LOR 136, PAL 153.

## Direct removal

Against full-HP 280-HP Active Regidrago VSTAR, a live Fairy Zone doubles Psychic damage. Max Geist uses total attached Psychic, Full Moon Rondo counts both Benches.

| Attack | Fairy Zone live | With Rolling Iron (-80 after Weakness) |
|---|---:|---:|
| Max Geist | 5 Psychic: 320 | 6 Psychic: 300 |
| Full Moon Rondo | 6 combined Bench: 280 | 8 combined Bench: 280 |

Without Fairy Zone, Max Geist needs 9 Psychic, Full Moon Rondo 13 combined Bench. With Rolling Iron and no Fairy Zone, 12 Psychic or 17 combined Bench is impossible even in the fixed 11-Energy / Sky Field lists. Covert Flight blocks Full Moon Rondo, not evolved Max Geist. Hood's Pokémon Ranger may remove attack effects if actually playable, but consumes Supporter and cannot also supply a required Guzma; absent in Lockbridge. Silent Lab disables Fairy Zone and Marshadow, requiring a legal Stadium replacement or Field Blower rather than Resetting Hole. Dimension Valley reduces VMAX payment from 3 to 2, Clefairy from 2 to 1. A paid KO removes the charged VSTAR and takes two Prizes, winning if candidate needs two under the stated normal Prize rule. Otherwise verify the source's backup attack window; do not assume no replacement attacker.

## In-turn repair

Rank13 source needs 3 Prizes, banded paid Apex, unused GX, one real gust, surviving payloads. Active Girafarig90, Bench Mimikyu70, Marshadow80, VMAX320, Latias210; all relevant source payloads visible. Earlier model: no two-card removal suffices.

- **Resetting Hole**: if a removable Stadium and Marshadow's ability are available, discard Stadium and Marshadow without conceding a Prize, then Get Lost **Dialga-GX + Salamence ex**. This removes the third Trifrost target and opens a safe pair. One actual Psychic on Girafarig remains necessary after removing Dimension Valley. At zero attached Energy, the free Get Lost loses payment. Silent Lab blocks Resetting Hole.
- **Field Blower**: remove the last available Muscle Band, then deny Dialga-GX + Kyurem. Salamence's 300 no longer KOs the full VMAX. If spare Band can return, grant it in the adverse envelope; removal is not enough. This is the 320 Salamence breakpoint, not the 330 Mega Dragonite breakpoint.
- **Lockbridge Wobbuffet**: a Sky Field-to-Temple change with four Benched Pokémon discards none. On the constructed six-Bench geometry with two additional Pokémon (Clefairy and VMAX), one forced discard is legal; either Wobbuffet or Mimikyu can be selected to open a safe pair. Still grant paid Apex under Temple, so this is independent of any prospective Stadium lock. If Wobbuffet is damaged and Acerola playable, returning it to hand repairs the small board too. Undamaged Wobbuffet is not a legal Acerola target.

Compare actual paid KO with actual paid Get Lost; when KO not terminal, consider replacement attacker, retained board material and real action availability. No blanket veto, no deck changes. Provide this decision family to existing candidate worker owner under approved scope.

## Reproduction and limits

32 assertions passed in isolated V8 against the predecessor solvers. [Model](agent26-anti-apex-response.cjs), [tests](agent26-anti-apex-response.test.cjs), [raw results](agent26-anti-apex-response.json). Initial test wrongly assumed one uniquely preferred collapse target; corrected to verify both safe options. No actual Node CLI/native game. Direct damage assumes verified attack position and only stated modifiers, normal Prize rules. Rescue assumes actions remain legal through sequence, grants all surviving payloads and both Apex windows, known lost/locked physical copies if supplied, one proven gust as in original state. Does not credit newly exposed opponent discard from Sky Field collapse, infer Band replacement access, evaluate future turns or retained material, or model Resetting Hole with >5 Bench. The caller must establish all actual legal actions. No nomination or matchup claim.
