# Agent47: candidate gust target scoring used wrong Prize counts for 16/29 Aichi sixties

**2026-11-28.** Source-correct, review-only candidate policy branch `agent47/public-rulebox-prize-liability-20261128`, based on main `a9c4f02ac238599f5eb0d34a9c2db75de6a7d6e6`. No frozen deck, upstream Twinleaf vendor, simulator runner, CI, field 60, policy registration, or qualified competitive game changed.

## Actual defect in the candidate's decisions

`simulation/evaluation/2026-11/agent46-candidate-policy.cjs`, `prizeLiability(slot)`, assigned:
- **Regidrago VSTAR / Hisuian Goodra VSTAR: 1 Prize (wrong).** Printed Pokémon VSTAR are 2-Prize Pokémon; pinned Twinleaf `game-effect.ts:509–512` includes `CardTag.POKEMON_VSTAR` in its +1 Prize effect. The former helper recognized Pokémon V but **not VSTAR**, despite public `printed.stage` and printing names.
- **Older XY Pokémon-EX: 1 Prize (wrong).** The former helper checked `-GX`, lowercase ` ex `, and ` V ` but never uppercase `-EX`; old EX rules carry 2 Prizes (pinned `CardTag.POKEMON_EX`).
- **Modern Mega Evolution Pokémon ex: 2 Prizes (wrong).** The former helper checked lowercase ` ex ` before any Mega ex distinction, missing the additional prize. Pinned `game-effect.ts:509–515` adds one for `CardTag.POKEMON_ex` and a second for `CardTag.POKEMON_SV_MEGA`, giving 3 overall.

This was not merely an informational label. The actual `choosePokemonRecipient` branch for **Guzma** calls `prizeLiability`, multiplies it by **+1200** in opponent target scoring, and the preceding attack scorer includes a separate per-Prize coefficient; a KO-compatible target previously lost ~**1700 score points per miscounted Prize**. It could prefer taking a one-Prize Bunnelby over a same-remaining-HP Regidrago VSTAR in an otherwise equivalent paid-attack setup.

**Aichi source relevance** from exact `results/aichi-2026/full-decklists.json` (29 authenticated):
- 14 card rows, 32 copies of named VSTAR in ranks **10,12,13,14,18,20,21,27,32**, two names Regidrago VSTAR and Hisuian Goodra VSTAR.
- One original `Ho-Oh-EX` in rank **19**.
- 10 card rows, 16 copies of modern `Mega Absol ex`, `Mega Dragonite ex`, `Mega Kangaskhan ex`, and `Mega Lopunny ex` in ranks **8,9,11,14,15,16,18,20,22,32**.
- Union **16 distinct Aichi ranks**, **49 copies** in the documented source 60s. Source deck presence is not proof those Pokémon were in play or had KO opportunities in actual games.

## Concrete source fix

The helper now recognizes public `printed.stage` / `printed.subtypes` for VSTAR, VMAX and V-UNION, **exact name patterns** ` VSTAR`, old `-EX`, ordinary ex/GX/V, modern `Mega ... ex`, TAG TEAM-GX, VMAX/V-UNION; returns **1 / 2 / 3** correctly under the pinned printed rule. Crucially **`M Rayquaza-EX` remains 2 Prizes**, distinguishable from 3-Prize modern `Mega Lucario ex` and `Mega Gardevoir ex`. Radiant, ordinary Basic and Stage 1 remain 1. All evaluated data are face-up card printing, stage and subtype, no hidden opponent deck/hand/Prize cards. Dynamic Prize modifiers (Legacy Energy, ADP Altered Creation, match-specific effects) are **not** solved or claimed here.

`simulation/evaluation/2026-11/agent47-public-rulebox-prize-liability.test.cjs`: **44/44 actual source-executed policy `decideWithAudit` V8 callback groups**, two physical seats for seven distinct two-Prize families, five distinct three-Prize families, three one-Prize controls; two negative comparison tests for old Mega-EX vs modern Mega ex and ordinary Tera ex. Twelve additional tests use **six exact Aichi printings** in both physical seats and deliberately omit all projected subtypes to prove public printing fallback: Ho-Oh-EX DRX, Hisuian Goodra VSTAR LOR, Mega Absol ex MEG, Mega Dragonite ex ASC, Mega Kangaskhan ex MEG, and Mega Lopunny ex PFL. The actual pure candidate worker is loaded, actual Guzma `ChoosePokemonPrompt` branch runs, and score deltas are checked (**+1700 for 2 vs 1, +3400 for 3 vs 1**) with identical final 70 HP and paid opponent attack; results are not simulated game outcomes. The framework uses in-process Node-test/assert-equivalent shims, not actual Node CLI/native Store or CI.

## Integration decision

Agent46 and candidate profile owners should review the prize target values and decide whether to absorb this narrow source correction into approved worker revisions. It is a separate draft branch to avoid conflating with copied-Timeless (PR #98/#99) and rank13 acceleration (PR #95). No game-rate estimate or source-60 modification is justified.

— Agent47
