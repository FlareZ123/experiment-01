# Rank11 source-dealt first-turn Boost Shake counterfactual

**Agent 6, 18 October 2026 UTC.** A complete, source-dealt first-turn Garbotoxin setup succeeded using actual pinned Store actions and prompts in one published rank11 opponent starting hand. This is a **forced single-line weak-bot counterfactual**, not a qualified competitive game or matchup-win estimate.

## Reproducible source

Exact published **rank11 Wataru Yano Absol/Garbodor 60** in physical seat **0, actually first**, versus exact **rank1 Yasunori Kato Shadow Rider 60** seat1. Seed **1244180408**. Source manifest digest `653ed6620d742f1f011d729557265e6173902b5fa87c8b4830f886f7be585173`, rank1 digest `77d91942a34e18fe5dc076eddba2e54602004dede2b0bc44786eefa6ddc94086`, Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Strict prompt validation, Forest Seal Stone search correction, Battle Compressor correction, policy-RNG isolation.

The rank11 player began with Oranguru V Active, Crobat V Benched and both Tool-free, plus two Float Stone, Darkness Energy, Quick Ball, Battle VIP Pass and Secret Box in hand. See [first-turn K1 source audit](rank11-forest-stone-firstturn-connector-domination.md) for authentic deck-search availability.

[Source fork](../../simulation/twinleaf/rank11-firstturn-boostshake-fork.cjs) · [same-root paired runner](../../simulation/twinleaf/rank11-firstturn-boostshake-source-run.cjs) · [**passing compiled CI 39082057216**](https://github.com/FlareZ123/experiment-01/actions/runs/39082057216), head `85c11945f75cbafaf8e2b45e5822b0c22fc846d9`, JSON artifact **12118774706**, SHA256 `38c8be18c73dbeac290d253a76c447c289494b84d5f2e7f67f577a2bfdb7a64a`.

## Actual printed actions, first turn

1. Play own-hand **Battle VIP Pass**, selecting source-deck **Trubbish FST** onto open Bench.
2. Use Active **Oranguru V Back Order**, search **Forest Seal Stone SIT** from own deck.
3. Attach Forest Seal Stone to Tool-free Active Oranguru V.
4. Announce Tool-granted **Star Alchemy**, searching actual own-deck **Boost Shake EVS** and consuming VSTAR Power.
5. Attach held **Float Stone BKT** to Benched Trubbish.
6. Play Boost Shake, select source-deck **Garbodor BKP**, evolve the newly Benched Trubbish and end the turn.

These are **11 validated Store actions including selections**, not staged hand/board injections. The opponent's actual following global **turn 2** began with Benched Garbodor holding Float Stone and source player's `usedVSTAR=true`. This meets the physical first-turn Tool-equipped Garbotoxin prerequisite; live suppression of a later opponent Ability and response quality remain separate gates.

Under the unmodified generic bot, rank1's first response was **attach Psychic Energy, PassTurnAction**. Its observed own hand contained VS Seeker, Shadow Rider VMAX, Guzma, Unfair Stamp and Battle Compressor. Some moves may be unavailable or undesirable at that turn, so pass should be examined rather than automatically treated as an error.

| Arm from identical first deal | Engine winner | Actions | Last turn | Remaining Prizes (rank11 / rank1) |
| --- | --- | ---: | ---: | --- |
| Original generic rank11 path | rank11 | 129 | 19 | 0 / 6 |
| Forced first-turn VIP/Stone/Shake, generic continuation | rank11 | 321 | 63 | 0 / 3 |

The observed differences **cannot establish strategic improvement or deterioration**. They are related arms of one seed with different subsequent states and a weak opponent policy. Competitive win-rate ledger remains empty.

Next: test genuine Garbotoxin suppression at a relevant source rank1 Ability-use decision, an informed Tool-removal response, and independent source openings including rank11 going second. Use this opponent capability when benchmarking a **distinct 60-card challenger** against the rank1 reference. A human first-person rank11 opening plan motivated the test, but this exact VIP branch was constructed from its particular source hand.

**Field:** 29 exact Top32 lists, ranks 23/25/28 missing. **Zero** qualified competitive games.
