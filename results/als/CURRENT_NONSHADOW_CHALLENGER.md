# Current non-Shadow-Rider challenger — New Moon Tool Jammer v2

**As of 27 November 2026 — Agent1 paper recommendation**

**Status:** preferred current non-Shadow paper challenger; **not competitively qualified**; no native/full-game result; no 99.5% claim.

Canonical manifest:
`results/als/new-moon-tool-jammer-v2-60.json`

Identity/count SHA-256:
`aebe9a142e8492be929316bff4b871375e3e478945e01f8c5844037332634fe6`

## Exact 60

### Pokémon — 19

- 2 Mewtwo & Mew-GX UNM 71
- 1 Gengar & Mimikyu-GX TEU 53
- 1 Trevenant & Dusknoir-GX SMP SM217
- 1 Tapu Lele-GX GRI 60
- 1 Galarian Articuno V CRE 58
- 1 Latias ex SSP 76
- 1 Lillie's Clefairy ex JTG 56
- 1 Squawkabilly ex PAL 169
- 3 Unown AOR 30
- 2 Dusclops SFA 19
- 2 Duskull VIV 69
- 1 Solrock CES 62
- 1 Lunatone OBF 92
- 1 Klefki SVI 96

### Trainers — 35

- 4 Battle VIP Pass
- 4 Fog Crystal
- 2 Mysterious Treasure
- 2 Hisuian Heavy Ball
- 2 Rescue Carrier
- 2 Battle Compressor Team Flare Gear
- 1 Adventure Bag
- 1 Escape Rope
- 1 Counter Catcher
- 1 Secret Box
- 2 Powerglass
- 1 Forest Seal Stone
- **1 Tool Jammer**
- 2 Lillie's Determination
- 2 Ace Trainer
- **1 Sky Field**
- 2 Path to the Peak
- 2 Field Blower
- 2 Canceling Cologne

### Energy — 6

- 3 Telepathic Psychic Energy
- 3 Basic Psychic Energy

## Why v2 replaced v1

Parent New Moon Lockbreaker v1 used 2 Sky Field and no Tool Jammer.

Rank-15 adversarial work found a structural current-rules failure:

- AOR Vileplume locks **Items**;
- Pokémon Tools are now a separate Trainer type;
- the source can therefore attach Stealthy Hood through its own Item lock;
- Hood blocks Cursed Blast on Active BUS Vileplume;
- v1's Field Blower and Canceling Cologne are themselves Item-locked.

Tool Jammer survives that lock and suppresses the opponent Active's Hood while its holder is Active.

v2 pays by reducing Sky Field from 2 to 1. That raises the pre-K1 no-Sky-Field-through-Prizes risk from 0.84746% (both of two copies Prized) to 10% (singleton Prized), but preserves one neutral Stadium while adding an action class the parent did not have.

## Rank-15 forcing fork

With Active Dusclops + Tool Jammer, second Dusclops, two Psychic on the Active and Hooded BUS Vileplume Active:

`Bench Cursed Blast 50 -> Active Will-O-Wisp 50`.

If BUS stays Active, next-turn Active Cursed Blast supplies the final 50 and KOs the 140-HP Vileplume; Special Condition does not prevent that Ability.

If BUS leaves Active through Guzma / Jet Energy / retreat, the Basic-attack lock is removed for New Moon's next turn, but rank 15 may later re-promote BUS. This is a **forcing temporary unlock**, not a solved matchup.

## Paper policy gate

Parent policy surface:
`results/aichi-2026/2026-11/agent1-newmoon-candidate-policy-acceptance-v2.json` — **135 cases**.

v2-specific delta:
`results/aichi-2026/2026-11/agent1-newmoon-tool-jammer-v2-acceptance-delta-v1.json` — **12 cases**.

Combined current paper target: **150 actor-visible cases**.

Core policy:
`results/strategy/2026-11/agent1-newmoon-tool-jammer-v2-policy-core.md`.

## High-value lines discovered

- Iron Thorns: TPE -> Solrock+Lunatone -> Path removes Initialization asymmetrically; native Gengar Horror + Powerglass can survive one clean Volt Cyclone and arrive at a funded follow-up.
- Rank 2: Item+Supporter lock still permits FSS, TPE, Tools, Stadiums and direct attacks; Clefairy Rondo KOs 140-HP Stoutland at six total Bench bodies.
- Raichu: narrow Bench; exact 14-packet six-Prize Electro Rain frontier exists; two pre-Bomb Dusclops self-KOs can restore Prize parity after the first Bomb.
- Rank 19: no Ranger; prevent unfunded Altered Creation when possible, then use Fairy Zone Dragon breakpoints (Bolt at five total Bench, ADP at six).
- Rank 31: Dusknoir self-KOs simultaneously gift Prizes and cheapen Bloodmoon Ursaluna; Bell of Silence does not stop TPE direct deployment.
- Rank 26: corrected 17-Basic shell is 91.6563% initial-seven valid; exact conservative 'still lone with no second Basic or VIP/Fog by first turn' bound is 3.8750% before Treasure/TPE.

## Important policy invariants

- New Moon has **17 Basics**, not 19.
- Hisuian Heavy Ball can recover Prized Basics while Items are legal; it cannot recover Dusclops, FSS, Tool Jammer or Sky Field.
- Perfection copies exact Pokémon-GX/Pokémon-EX attacks, not modern lowercase ex/V.
- TPE direct-to-Bench does not trigger Tapu Lele-GX Wonder Tag.
- Horror House blocks hand plays, not attacks, retreat, in-play Abilities or existing Stadium effects.
- Prize transitions must settle before Ace Trainer / Reversal / Counter Energy / Ursaluna calculations.
- Optional Bench access must enumerate 0/1/2 TPE targets and score opponent reply exposure.

## Current stop conditions / reopen conditions

Do not call v2 final until:

1. the 147-case paper gate is implemented/passed or intentional failures are explicitly reviewed;
2. the rank-15 temporary-unlock fork is shown to convert reliably enough against strongest source re-lock play;
3. the singleton Tool Jammer / singleton Sky Field Prize and access costs are evaluated in actual policy games;
4. later-permitted native/full-game evidence covers the authenticated field rather than selected favorable decks.

Reopen the 60 again only for another **structural** action-class failure, not a cosmetic one-card preference.

Detailed rationale:
`results/als/new-moon-tool-jammer-v2-rationale-20261127.md`

Rank-15 counterplay stress test:
`results/aichi-2026/2026-11/agent1-tool-jammer-v2-rank15-counterplay-stress-20261127.md`