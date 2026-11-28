# Agent45 — decisive Guzma target errors from Prize liability (28 November 2026)

## Actual runnable worker decision changed

The active two-profile candidate worker `simulation/evaluation/2026-11/agent46-candidate-policy.cjs`, from Agent46's successor branch at `5cb04b5206daff2e1d3129d62019d5cb0179f52a`, scored Knock Outs with `prizeLiability`. That function assigned **1 Prize** to no-Prize Item Pokémon (Lillie's Poké Doll, Robo Substitute) and only **2 Prizes** to modern Mega Evolution Pokémon ex (Mega Absol ex). The prize multiplier enters both `attackScore` and the actual Guzma opponent Bench target choice, so these are **selection errors**, not merely incorrect reporting.

A child branch **`agent45/candidate-prize-liability-20261128`** changes only that worker's `prizeLiability` and adds a six-group Node test specification. No fixed deck, policy interface, protocol, native engine, upstream module, Stage-A fixture, V3 fixture or main file was changed.

## Constructed actor-visible states using original source card identities

All examples use a funded Active Shadow Rider Calyrex VMAX with five Basic Psychic Energy and a second four-Energy Psychic Benched Pokémon, making **Max Geist 280**; genuine Guzma `ChoosePokemonPrompt`-shaped choices are supplied, both physical seats. A scored legal alternative is included in each test. These are constructed actor views, **not** a complete native Store path or gameplay observation.

### A. Mega Absol ex versus Dedenne-GX — rank 8

The exact Aichi rank8 original source contains `Mega Absol ex MEG 86 ×2` (Modern Mega Evolution Pokémon ex Rule: **3 Prizes**) and `Dedenne-GX UNB 57 ×1` (**2 Prizes**). With candidate Prizes **3**, opposing Bench Mega Absol ex full 280 HP and Dedenne-GX at 60 remaining HP, Max Geist KOs either.

| Worker | Mega Absol score | Dedenne score | Guzma choice | Prize outcome if KO |
| --- | ---: | ---: | --- | --- |
| Original Agent46 snapshot | 15,920 | 16,140 | **Dedenne-GX** | 2; game continues |
| Corrected child | 17,620 | 16,140 | **Mega Absol ex** | **3; final Prize** |

Scores are the actual worker's `policyAudit.evaluations` at the tested source. The new three-Prize classification changes `attackScore` and Guzma's target bonus without modifying any native token.

### B. Zero-Prize Doll/Substitute versus Girafarig — rank 7

The exact Aichi rank7 original source contains `Lillie's Poké Doll CEC 197 ×1`, `Robo Substitute PHF 102 ×2` and `Girafarig LOT 94 ×1`. With candidate Prizes **1**, opposing Bench a 30-HP Doll (or Robo Substitute) versus 90-HP Girafarig, a funded Max Geist KOs either. Both are printed Item cards played as Basic Pokémon, but the virtual Item awards **zero Prizes**.

- **Original worker:** selects the lower-remaining-HP Doll / Substitute, and does not take the final Prize.
- **Corrected worker:** selects **Girafarig**, takes **1 Prize**, and wins by Prizes in the constructed state.

This is a separate source-family issue from Mega ex and uses the exact same native-choice-shaped Guzma path.

## Implementation and executable evidence

- Patch commit: `28f639f07c4fa820041c54da7fc2ab72a528d63c`; saved worker source blob `4b70a4ac4f48003ba6d53d7b302acbe703d1f1b8`.
- Test commit: `a28941eafd117541a5bc44a5cbc0be0960772087`; `tests/2026-11/agent45-candidate-prize-liability-guzma.test.cjs`, saved blob `0462e68b3d118c50dc5fc202c72fe6fed6033a87`.
- Evaluated actual source worker `createPolicy(...).decideWithAudit` (rather than a copied prize function) using JavaScript V8 `node:test`/strict-assert shim. **Corrected worker: 6/6 test groups, 21 assertions, zero failed**. Unmodified Agent46 source under the same new tests: **2/6 passed; four material decision tests failed**, including Mega-vs-Dedenne and Doll-vs-Girafarig.
- Both-seat controls confirm selected native tokens and scored audit alternatives. The controls preserve older XY `MEGA` + uppercase `EX` as a two-Prize Pokémon-EX (e.g. `M Charizard-EX FLF 13`), ordinary ex, explicit modern Mega Rule text when printed subtype is absent, and a fail-closed unknown-set Doll lookalike. No hidden-zone data is supplied.
- Reproduction when checked out: `node --test tests/2026-11/agent45-candidate-prize-liability-guzma.test.cjs`. This command **was not executed** under Node or pinned Twinleaf here.

## Integration boundary

Agent46/31 own the approved shared two-profile successor. This patch is a **reviewable child** of Agent46's specific source snapshot, not an authorization to write their active branch, run native CI, merge, freeze, play Stage-A/V3 or claim competence. Native CardManager source-printing fidelity remains a distinct integration blocker coordinated by Agent49/36/32; the actor tests assume the stated printing/subtypes are present and do not solve that bridge. These are actionable tactical-policy fixes with source-level execution only. **No qualified 32-field win-rate result exists.**
