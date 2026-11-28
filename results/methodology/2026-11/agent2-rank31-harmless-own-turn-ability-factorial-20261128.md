# Rank 31 Dusknoir–Chimecho: four independent own-turn Ability classes jointly mask direct final attack (28 Nov 2026)

**Agent:** 2. **Decision:** refuse an extra Energy attachment and take an already-offered, payable, game-ending Max Geist against the actual source-rank-31 Pokémon family. **Evidence class:** 448 matched V8 policy-function decisions in a constructed actor-visible state; **not** pinned Twinleaf/native, complete game, or competitive win-rate evidence.

## Exact source-deck scope and printed effects

The authenticated original rank 31 Aichi deck in `results/aichi-2026/full-decklists.json` (sha `ae773f6201d7aa69d31914dbfee66f3fba692200`) contains **3 Dusclops PRE36, 3 Dusknoir PRE37, 1 Dusknoir BCR63, 1 Radiant Alakazam SIT59, and 1 Bloodmoon Ursaluna ex TWM141**. Their catalog text is:

| Source family | Ability | Why harmless specifically to *opponent-turn direct attack KO* |
| --- | --- | --- |
| Dusclops PRE36, Dusknoir PRE37 | **Cursed Blast** | An optional Ability usable during their controller's turn to put damage counters and self-KO; no response to an incoming attack on the opponent's turn |
| Dusknoir BCR63 | **Sinister Hand** | Moves opponent damage counters as often as desired **during controller's turn**; cannot react to an already announced opponent direct attack |
| Radiant Alakazam SIT59 | **Painful Spoons** | Once during controller's turn, may move up to two counters; cannot alter an attack during its opponent's turn |
| Bloodmoon Ursaluna ex TWM141 | **Seasoned Skill** | Reduces this Pokémon's own Blood Moon attack cost per Prize its opponent has taken; no damage/HP/Prize/KO effect on incoming direct attacks |

The current `simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs` blob `813f22634f8f162d1da3659ad5c5d2d6da32103b` uses `cleanPublicTerminalView(view,true)`, requiring **every** opposing board Ability to be whitelisted as harmless. None of the above four are present in `directTerminalHarmlessAbility`. An otherwise guaranteed `Max Geist` KO with one Prize remaining is declined if even one of those source-real Ability classes is visible, and a multi-source rank31 board compounds the failure.

## Narrow source-printing-bound fix

Add four clauses to **`directTerminalHarmlessAbility(slot,name)` only**, not to `attackScore`, general ability suppression, retreat/pivot logic, or arbitrary Abilities:

```js
(name==='Cursed Blast' &&
  hasAnyName(slot.printing,['Dusclops PRE','Dusknoir PRE'])) ||
(name==='Sinister Hand' && hasName(slot.printing,'Dusknoir BCR')) ||
(name==='Painful Spoons' && hasName(slot.printing,'Radiant Alakazam SIT')) ||
(name==='Seasoned Skill' && hasName(slot.printing,'Bloodmoon Ursaluna ex TWM')) ||
```

These are warranted by exact English catalog printings and **only for direct attacks on the currently offered root**. Do not infer that they have no strategic effects on later turns or against other actions. A true reactive wall must continue to bar certification. `Max Geist` remains payable through three Basic Psychic (100 total attack damage) and its own remaining-HP computation; don't infer a guaranteed win if the attack cannot reach a KO.

## Exhaustive four-factor policy decision matrix

Fetched exact worker; compiled **16 independent worker variants** for the complete Boolean lattice of the four whitelist additions, leaving the rest of the worker unchanged. Executed all 16 against **seven actor-visible board cases × both source-bound candidate configurations (Hood Shield, Lockbridge) × both physical seats = 448 decisions**. Every request offered manual Psychic Energy, Max Geist, and pass; own Active VMAX has three Basic Psychic, one Prize remaining.

| Opponent board and exact remaining HP | Minimum needed whitelist bits | Baseline root | Complete fix |
| --- | --- | --- | --- |
| **Bloodmoon Ursaluna ex Active (70 HP), Dusknoir PRE + Dusclops PRE + Dusknoir BCR + Radiant Alakazam Benched** | All four | energy | **max** |
| Regidrago Active (80 HP), four rank31 Ability-bearing Pokémon Benched | Blast + Sinister + Spoons | energy | **max** |
| Bloodmoon Active (70 HP), Dusknoir PRE Benched | Seasoned + Blast | energy | **max** |
| Dusknoir PRE Active (70 HP), Bloodmoon Benched | Blast + Seasoned | energy | **max** |
| Bloodmoon Active + Cursed Blast + unknown on-KO blocker | Not certifiable | energy | energy |
| Full rank31 Ability panel but undamaged 260-HP Bloodmoon Active | Not lethal | energy | energy |
| Regidrago Active with ordinary Shadow Rider V Benched | Already certifiable | **max** | **max** |

For each positive row, exactly those whitelist factors appearing in the board must all be set before the decision becomes `max`; any missing necessary factor retains conservative `energy`. The checked outputs matched this prediction **448/448 with zero unexpected actions**. Among 28 full-fix profile/seat decisions, `max` increased from 4 (unblocked control) to 20 (all four true terminal opportunities), while the two negative scenarios remained blocked. This is **16 more selected immediate winning attack actions in the synthetic corpus**, not a rate or forecast.

## Scope and next action

The only authorized integration owner is Agent46 on the approved two-profile successor branch; this is a reproducible **source-bound local-policy finding** rather than an additional permission to edit the successor, dispatch CI, run a full game, merge, or select a champion deck. If integrated, put tests for both profiles and seats into the existing successor owner-root suite, preserving unknown on-KO blocker and nonlethal controls. Native Store evidence and opponent reply competence remain prerequisites for game-level claims.

The live fixed-60 decision stays undecided, 29/32 original sources authenticated, and 0/32 qualified matchups.
