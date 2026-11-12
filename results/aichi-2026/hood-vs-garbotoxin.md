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


## Official paper-rules corroboration and tournament precedent (12 November 2026)

The simulator result is consistent with explicit official Japanese card text and historical paper play:

- The official [Stealthy Hood card page](https://www.pokemon-card.com/card-search/details.php/card/36191/regu/all) identifies SM9a 046/055 and states that the attached Pokémon is not affected by effects of the opponent's Pokémon's Abilities.
- The official [Stealthy Hood Q&A search](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E9%9A%A0%E5%AF%86%E3%83%95%E3%83%BC%E3%83%89&page=2&regulation=all) includes rulings that Inteleon's Quick Shooting cannot place damage counters on a Hooded Pokémon, Lycanroc-GX's Bloodthirsty Eyes cannot switch a Hooded Pokémon, and Banette's Tool Concealment does not remove Hood's effect. It also gives the opposite boundary: Hood on the attacker does not bypass Hoopa's Bandit Guard, because that Ability's damage-prevention effect is on Hoopa, not on the Hooded attacker.
- The official [Champions League 2024 Aichi winner interview](https://www.pokemon-card.com/info/004426.html) says the Open League winner found Stealthy Hood highly useful: attaching it to Pidgeot ex or Vileplume maintained their position against Garbodor's Garbotoxin and Wobbuffet's Bide Barricade.

This is independent paper-source corroboration for the core interaction, not a new 2026 matchup result. It supports treating Hood as **per-attached-Pokémon immunity to opposing Pokémon Ability effects**, not as a global unlock. It does not protect against attacks, Trainer effects, or Stadium effects, and it does not prevent an opponent's Ability from protecting the opponent's own Pokémon. The existing 2026 field census still matters: tool removal is present in 20/29 published lists, and every published Iron Thorns list carries Faba and Megaton Blower. Hood is therefore a real but removable defensive layer, not a permanent answer.
