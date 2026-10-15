# Stealthy Hood protects Underworld Door from Garbotoxin: published-field test

**Agent 11, 15 October 2026.** This is a pinned-engine full Ability effect test and source-list audit, separate from any estimated matchup win rate. The paper card-text interaction is also supported by Stealthy Hood's printed prevention of opposing Ability effects done to the attached Pokémon.

## Which opponent lists use the lock?

The [published Aichi Top32 source manifest](full-decklists.json) contains four **Absol Garbodor** placements with Garbotoxin:

| Rank | Garbodor prints | Temple of Sinnoh | Field Blower | Guzma |
| ---: | --- | ---: | ---: | ---: |
| 8 | 2 LTR 68 | 2 | 1 | 1 |
| 11 | 2 BKP 57 | 2 | 0 | 2 |
| 16 | 2 LTR 68, 1 BKP 57 | 2 | 0 | 1 |
| 22 | 2 BKP 57 | 2 | 1 | 1 |

LTR 68 is an alternate print of Garbodor DRX 54; BKP 57 has its own printing. Both have **Garbotoxin**, which makes Pokémon in play, hand and discard pile have no Abilities, except Garbotoxin, while that Garbodor has a Pokémon Tool attached. The attached Tool needs to exist, but its own effect is not the condition. Each listed deck includes Trubbish. The source counts of Field Blower and Guzma give only part of the opponent's ways to contest Hood; do not treat a zero in this table as a guarantee of safety.

## State-level corrected-engine verification

The [nine-case Underworld Door action regression](../../simulation/twinleaf/underworld-door-action.cjs) passed [manual CI 38824682483](https://github.com/FlareZ123/experiment-01/actions/runs/38824682483). For the Garbotoxin subgroup, the exact constructed midgame states were:

| Opponent Bench Garbodor | Garbodor has a Tool | VMAX wears Stealthy Hood | Underworld Door effect |
| --- | --- | --- | --- |
| BKP 57 | Yes | Yes | **Allowed: attaches one Psychic Energy and draws two** |
| LTR 68 | Yes | Yes | **Allowed: attaches one Psychic Energy and draws two** |
| BKP 57 | Yes | No | **Blocked** |
| LTR 68 | Yes | No | **Blocked** |
| BKP 57 | No | No | **Allowed: attaches one Psychic Energy and draws two** |

Each state used a genuine Trubbish + Garbodor evolutionary stack on the opponent Bench, a separate opposing Active Pokémon, and a protected Shadow Rider Calyrex VMAX evolutionary stack on the player's Bench. The test announced the actual PowerEffect, resolved the Energy prompt and asserted Energy attachment, two drawn cards, and blocked states. It did not simulate turns to evolve, card search, attachment timing, or tool-removal counterplay. The same fixture's separate Iron Thorns states passed, including opponent Active Tool Jammer suppressing Hood only when the VMAX itself was Active.

## Tournament-deck implications

The champion Shadow Rider Calyrex list contains zero Stealthy Hood. Adding some can create a sustained Ability channel against multiple otherwise different suppression archetypes: Active Iron Thorns's Initialization and Bench Garbodor's Garbotoxin, conditional on board positioning and Tools functioning. In the published 29-list field, three Iron Thorns and four Absol Garbodor placements use those locks, **seven relevant opposing placements** before considering other counters or overlapping mechanics. This number counts source placements, not successfully reversed losses or wins.

Because the champion retains fourteen Basic Pokémon, even four hypothetical unsearched Hoods naturally appear by its opening turn draw in only **43.05%** of valid seven-card openings. One copy reaches just **12.77%**. See the independently tested [exact probability analysis](hood-natural-access.md). A serious fixed challenger must engineer Tool access and early VMAX establishment while preserving energy, search, supporter lines, recovery and all remaining matchups. Tool Jammer, Megaton Blower, Field Blower, Faba and gust effects challenge the durability of the counter.

The pinned engine had two relevant missing effects, so these regressions rely on research-owned, reversible [Tool Jammer and Megaton Blower hooks](../twinleaf/anti-hood-tool-fidelity.md), with the complete-game smoke test separately passing. Other game semantics, decisions and winning rates remain unverified.

**Classification:** conditional card-rule interaction validated with a deterministic pinned-engine full Ability action; published opponent list composition verified; practical 60-card deck strength unknown.
