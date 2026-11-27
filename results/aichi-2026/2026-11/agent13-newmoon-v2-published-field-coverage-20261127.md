# New Moon Guzma/Sky v2 — published Aichi field policy-coverage map

**Agent 13 · 27 November 2026**

**Purpose:** verify that every authenticated Aichi Top-32 source list maps to at least one explicit actor-visible policy family before implementation. This is **coverage of decision classes**, not evidence that the matchup is solved.

Preferred fixed list: [New Moon Guzma/Sky v2](agent13-newmoon-lockbreaker-guzma-sky-v2.md)  
Policy gate: [v2 actor-visible acceptance contract](agent13-newmoon-guzma-sky-v2-policy-acceptance-v1.json)

## Coverage

| Rank(s) | Published archetype | v2 policy family / structural pressure | Status |
|---|---|---|---|
| 1 | Shadow Rider Calyrex | late-Klefki self-lock; asymmetric Path + Solrock/Lunatone; Marshadow board-only Stadium removal | Named cases |
| 2 | Vileplume Control | AOR Item lock + Active Stoutland Supporter lock; Full Moon Rondo in-lock attacker; Grand Tree pre-lock sequencing; pre-Sentinel Guzma window | Named cases (Agent1 delta integrated) |
| 3, 7 | Snorlax Stall | Block + repeated gust; narrow Bench; Escape Rope/Guzma scarcity and own-switch | Named cases |
| 4, 17 | Raichu Electrode Combo | Stage-1 Electrode survives Basic Klefki; Path/native Horror House; Electro Rain distributed Prize frontier; Prize-parity Cursed Blast | Named cases (Agent1 delta integrated) |
| 5 | Mew Genesect | Path suppresses Genesect V draw engine but not funded Mew VMAX attacks | Named case |
| 6, 24, 29 | Iron Thorns | native Gengar bypass; orientation-sensitive Horror House survival; Klefki buffer; Wondrous cost | Named cases |
| 8, 11, 16, 22 | Absol Garbodor | Field Blower must clear all Garbotoxin Tools; Blower → Horror House anti-retool window; Temple/TPE timing | Named cases |
| 9 | Absol Electrode | Silent Lab suppresses candidate Basics while Stage-1 Electrode remains; Lab → Path transition can restore candidate New Moon and suppress Electrode | Named case + Silent Lab cases |
| 10, 12, 13, 14, 18, 20, 21, 27, 32 | Regidrago | TPE target-count under Phantom Dive; Covert Flight protected Active; Budew Item lock; Silent Lab/Parallel City; Roadblock at ranks 14/18 | Named cases |
| 15 | Lopunny Vileplume | Bunnelby promotion trap; BUS Basic-attack lock + AOR Item lock; Hood; both-Dusclops-Prized Guzma escape; Silent Lab compound lock | Named v1 + v2 cases |
| 19 | Raging Bolt | Sudowoodo Roadblock Bench cap; Path can suppress Rule-Box acceleration but not an already-funded Bellowing Thunder | Named cases |
| 26 | Meloetta Donk | pre-attack setup survival; Klefki Active; TPE/search Bench construction; ahead-on-Prizes final Guzma | Named v1 + v2 cases; candidate-side states handed to Agent21 |
| 30 | Lillie's Clefairy | opponent Full Moon Rondo scales with both Benches; Empoleon V / Path continuous-effect cascade | Named cases |
| 31 | Dusknoir Chimecho | Bell of Silence blocks Tapu-Lele-from-hand Supporter access; opposing Cursed Blast punishes low-HP Bench bodies and changes Prize map | Named cases |

**Published source coverage: 29 / 29 authenticated lists.**

## What this does not mean

- It does not mean 29 matchups are won.
- It does not mean the 64 acceptance states are exhaustive game trees.
- It does not create any competitive-qualified game.
- It does not validate a native policy.
- It does not fill ranks 23, 25, or 28.

## Missing source lists

The repository still lacks exact published lists for ranks **23, 25, and 28**. They must remain explicitly missing. Do not impute archetypes or fabricate decks to claim 32/32 coverage.

## Implementation consequence

The next New Moon policy worker should begin from the fixed v2 hash and the 65-case contract, not from archetype-name heuristics. The contract now has a named state transition for every authenticated rank; failures should therefore be reported as **case-level policy failures or genuinely new mechanisms**, rather than another broad statement that a matchup is 'uncovered'.

Full-field competitive qualification remains **0 / 32** and the 99.5% target remains unproven.
