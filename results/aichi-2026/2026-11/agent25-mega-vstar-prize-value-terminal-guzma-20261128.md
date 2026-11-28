**Subsequent full-field extension (13:42 UTC):** This report's 15/29 coverage counts only the two Mega ex + VSTAR classes investigated here. A complete exact-source-rule audit found an **additional old Pokémon-EX gap**: `Ho-Oh-EX DRX22` at rank19 is incorrectly counted as **one**, actually **two** Prizes. Therefore the broader frozen-worker baseline Prize miscount affects **16/29 original lists, 25 source Pokémon rows and 49 physical source copies**. See [complete 29-original-source ledger](agent25-original29-printed-prize-awards-20261128.md) and its 13-case source-rule audit; do not reinterpret the earlier 15/29 as all-class coverage. The 2026 Mega vs VSTAR terminal-Guzma finding below remains valid. **No new game evidence.**

# A field-wide candidate-policy prize-count error: VSTAR and modern Mega Evolution ex

**Finding class:** source-level exact-print/rules + deterministic pure-program regression. This is **not** a validated native Store outcome, matchup win, source-game frequency, or claim against the 99.5% benchmark. The frozen PR #95 candidate worker stays unchanged; the code below is an opt-in proposed successor correction.

## Scope across authentic source lists

The frozen Hood candidate worker `simulation/evaluation/2026-11/agent46-candidate-policy.cjs` (PR #95 blob `bd08b9bdb6207d8950027584f7524bb3336eb047`) contains `prizeLiability(slot)`:

- `3` only when projected `printed.subtypes` says VMAX/V-UNION/TAG TEAM or the name contains those particular strings;
- `2` when `printed.subtypes` says ex/GX/V or the name matches ex/GX/V;
- `1` otherwise.

But pinned `actor-observation-contract.cjs` populates `printed.subtypes=[...(pokemon.subtypes??[])]`, while pinned Twinleaf `PokemonCard` has no general `subtypes` field; its real classifications are `Stage` and `CardTag`. As a result, the worker gives **one Prize** to **Regidrago VSTAR** and **Hisuian Goodra VSTAR** (paper/native = **two**), and **two Prizes** to modern **Mega Absol ex / Mega Dragonite ex / Mega Lopunny ex / Mega Kangaskhan ex** (paper/native = **three**). This is **not** the old XY `M ...-EX` Pokémon-EX (two Prizes). The rulebook explicitly gives the three-Prize Mega Evolution ex Rule, and pinned native Mega Absol ex `_tags=[POKEMON_SV_MEGA,POKEMON_ex]`, while Regidrago VSTAR `_tags=[POKEMON_VSTAR]` and `stage=Stage.VSTAR`.

Directly counting **only the repository's 29 original authenticated Aichi source 60s**, not inventing any of the three missing decks:

| Misclassified class | Field ranks (source) | Number of source decklists |
| --- | --- | ---: |
| Modern Mega Evolution ex → treated 2 instead of 3 | 8, 9, 11, 14, 15, 16, 18, 20, 22, 32 | 10 |
| VSTAR → treated 1 instead of 2 | 10, 12, 13, 14, 18, 20, 21, 27, 32 | 9 |
| **Either class, deduplicated** | 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 21, 22, 27, 32 | **15 of 29** |

The source lists contain **16 modern Mega ex Pokémon copies and 32 VSTAR copies** across those ranks. These are printed deck memberships, not probabilities that the cards appear in a given game.

## Concrete wrong Gust selection that can forfeit a three-Prize finish

Original Aichi rank **8** source list contains **2 Mega Absol ex MEG 86** and **1 Dedenne-GX UNB 57**. Consider a conditional, fully visible late-game position:

- Hood player has **three Prize cards remaining**, two evolved Shadow Rider Calyrex VMAX in play (Active with five Psychic, Bench with four Psychic), and plays genuine **Guzma BUS 115**;
- rank-8 opponent has undamaged Mega Absol ex (280 HP, **three** Prizes) and Dedenne-GX (160 HP, **two** Prizes) on Bench;
- there are no relevant damage reduction, Resistance or attack prevention effects in the position;
- total nine attached Basic Psychic Energy across Hood's two VMAX means printed `Max Geist=10+9×30=280`, enough to KO either target; Benched four-Psychic VMAX can pay Max Geist after Guzma's forced friendly switch.

Pinned Guzma resolves **opposing Bench gust first and friendly Active switch second**. The frozen candidate worker's opposing Guzma prompt scores targets against the **pre-switch Active** and uses:
`attackScore = damage×10 + 10000 + prizeLiability×500` for a knockout,
then `gustScore = attackScore + prizeLiability×1200 − remainingHP`.

This produces:

| Target | Frozen liability | Frozen gust score | Correct liability | Gust score after count fix |
| --- | ---: | ---: | ---: | ---: |
| Dedenne-GX (160 HP) | 2 | **16,040** | 2 | 16,040 |
| Mega Absol ex (280 HP) | **2** | 15,920 | **3** | **17,620** |

Under the frozen scoring formula, Dedenne wins the comparison by **120**, despite offering only two Prizes. Correcting Mega's count reverses the ranking by **1,580**, and selecting that Mega could finish the game in this constructed state. This calculation reproduces the worker's defined scoring formula; **no full native match was executed** and no claim is made that such a board naturally occurs frequently.

The target evaluator has a **second independent issue**: it evaluates the opponent choice using the currently Active attacker's state, although Guzma forces that attacker onto the Bench before attack. The initial `canGuzmaForAttack` root policy already checks Bench attackers, making the prompt policy inconsistent with its own opening decision. An actual successor should evaluate at least one payable *Benched* attacker when ranking the opponent's gust, and value **terminal three-Prize wins** above merely higher damage/easier KO.

## Working source-bound prototype

Branch `agent25/rank2-duplicate-gust-target-20261128` contains:

- [Actor-only original-print Prize classifier and narrow terminal Guzma prompt option](https://github.com/FlareZ123/experiment-01/blob/agent25/rank2-duplicate-gust-target-20261128/simulation/evaluation/2026-11/agent25-three-prize-mega-guzma.cjs) — `5bd50082`
- [13 deterministic no-engine cases for prize classes, wrong frozen score and 2-seat three-Prize Guzma selection](https://github.com/FlareZ123/experiment-01/blob/agent25/rank2-duplicate-gust-target-20261128/tests/2026-11/agent25-three-prize-mega-guzma.test.cjs) — `04bcd35a`

**Protocol and stage precision (subsequent branch refinements):** pinned `Stage.VMAX=5`, `Stage.VSTAR=6`, and `Stage.VUNION=7` are publicly exposed by actor `printed.stage`, so exact-stage classification is more reliable than the absent `subtypes`. Modern Mega Evolution ex instead appear as `Stage.BASIC=2` and require a precise modern `Mega ... ex` printing guard (not an old XY `M ...-EX` rule). `projectChoosePokemon()` puts `ownerSeat` on each `choice.publicMetadata`, **not** at global `prompt.publicMetadata`; the prototype now follows this real native shape (commits `4b835d71`, `bccd1405`, `5c9a46fc`, `7d793cf3`). All 13 local pure cases still pass. The helper does not replace authenticated native prompt projection or strict policy auditing.

**Local Node `--test` on 2026-11-28: 13 passed, 0 failed**. Cases exercise both seats, exact 280 vs 160 HP scorer reversal, VMAX Bench forced-switch requirement, attacker Energy cost, damage threshold, unavailable legal target, hidden/forged target rejection, absence of alternative source effect, Tool/Stadium/Resistance risks, and four-Prize (non-terminal) control. The sidecar emits only existing actor-visible choice tokens and never peeks at hidden deck/Prize identities or calls Store. Its narrow selection is a **proposed successor decision**, not a protocol-integrated V3 worker; no compiled pinned-Twinleaf validation has run.

**Recommended next actual solution:** In the authorized candidate-policy successor, repair both paper/native Prize classes in the same actor-visible function, add a terminal-win boost when the target would award all remaining Prizes, and make Guzma's opponent target policy evaluate payable **post-switch Bench attackers**. Include precise rank-8 two-Pokémon matched cases plus VSTAR targets, old XY Mega-EX negative controls, and actor-only token/seat invariants. Keep PR #95 and the single PR #104 candidate Underworld Door native CI gate untouched.

**Qualified Aichi competitive matchups remain 0/32.**
