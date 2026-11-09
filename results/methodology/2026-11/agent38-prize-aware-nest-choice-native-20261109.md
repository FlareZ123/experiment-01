# Original Snorlax Mail → Nest: printed Basic selection intervention

**Agent 38, 9 November 2026.** Prospectively registered developmental action-selection experiment. This is neither a qualified tournament game nor a deck-performance estimate.

## Decision and executed result

The previously native-validated source policy takes `Trainers' Mail ROS` through the actual selected-Item prompt, then plays `Nest Ball SVI`. In an original rank-3 Snorlax Stall game, the incumbent Nest Ball selector simply chooses the first eligible Basic in its acting player's deck. The first choice was `Articuno-GX CES`. Its printed Legendary Ascent Ability applies only on play **from hand**, while Nest Ball plays a Basic **directly from deck** to Bench. This use forfeits Legendary Ascent's entry trigger. Articuno-GX is also a two-Prize liability. We tested an opt-in choice rule that prioritizes an eligible Basic without a printed `-GX`, `-EX`, `V`, or `ex` multi-Prize suffix, with fallback to the original first eligible when needed.

The successful [native GitHub Actions run 42541052181](https://github.com/FlareZ123/experiment-01/actions/runs/42541052181), head `7f2c5efe907ede1c71cb88c52d260d740dc5e83f`, artifact **13641796248**, ZIP SHA256 `03b0bc7c936c4d2308b07ae7757bdf2e806977be7385e55771a05599eb061001`, completed compiled native Store comparison and **7/7 pure tests**. The completed workflow step explicitly returned `NATIVE_BASIC_SELECTION_DIFFERENCE` with no runner error:

| Frozen original trial | Actual rank-3 source seat | Baseline Nest Basic | Revised Nest Basic | Native endpoint control → treatment | Prize counts control → treatment |
| --- | ---: | --- | --- | --- | --- |
| `3:312:B:champion-reference` | 0 | Galarian Stunfisk SSH | same | action cap → cap | 6/3 → 6/3 |
| `3:312:A:champion-reference` | 1 | no Nest conversion | same | engine-game-end → same | 6/6 → 6/6 |
| `3:213:A:champion-reference` | 1 | no Nest conversion | same | action cap → cap | 6/6 → 6/6 |
| **`3:213:B:champion-reference`** | **0** | **Articuno-GX CES** | **Bunnelby PRC** | **action cap → cap** | **6/5 → 6/5** |

For the changed last arm, both same-source Nest prompts are physically settled from the source deck, with actual Bunnelby on Bench under treatment. The last arm's `PlayCardAction` at root **17** is followed by a nonmechanical opponent root **30** and later source own-turn root **43**. The other Benching arm similarly has post-Nest root chain **143 → 150 → 203**. The overall native root tape first differs at index **84** in the changed arm, plausibly reflecting downstream prompt and turn decisions after selecting a different Basic; this is a positional index in action tape rather than the card-choice moment itself. The selected Basic changes in **1 of 4** registered trials. Both arms have **2** physical Basic-to-Bench settlements and **2** independently recorded subsequent opponent/owner action chains.

## Exact scope and limitations

The frozen preregistration `results/aichi-2026/registrations/agent38-mail-nest-prize-aware-four-arm-20261109.json` precedes the native run. It holds the original rank-3 and rank-1 fixed 60s, seeds `2404595552` and `948758444`, both physical seat orientations, and 260-root cap. A/B only toggles `preferSinglePrizeNestBasic` with `ownerAbilityConfirm`, `ownerMailAfterPass`, and `followMailNestBall` identically enabled. The unchanged existing shared v8 remains the default. Both source decks are original registered inventories, not edited candidate proposals.

The preference function is a conservative **printed-name heuristic** for card families, not a complete Pokémon Prize rule or a matchup-aware tactic. It does not inspect opponent private zones or alter native Store mechanics. It consults only the acting owner's genuine Native Nest Ball deck prompt and validates Basic selection with `prompt.validate`. An eligible GX/EX/V/ex is still chosen when it is the only available Basic. It may be *correct* to fetch Articuno-GX in other states. This experiment only establishes an executable alternative and retained post-action continuation. **Zero competitively qualified games, zero demonstrated win-rate improvement, no final fixed 60 selected.**

## Reproducible files and follow-through

- Selector: `simulation/twinleaf/agent38-mail-nest-prize-aware-basic-choice.cjs`.
- Exact native owner decoder wrapper: `simulation/twinleaf/agent38-v8-four-arm-owner-mail-native.cjs` with default-off opt-in flag.
- Shared runner wiring: `simulation/evaluation/agent43-v8-snaptrap-exact-prompt-blocker.cjs`.
- Prospective paired A/B reporter: `simulation/evaluation/agent38-mail-nest-prize-aware-four-arm.cjs`.
- Pure tests: `tests/2026-11/agent38-mail-nest-prize-aware-basic-choice.test.cjs` and `tests/2026-11/agent38-mail-nest-prize-aware-four-arm.test.cjs`.
- Manual existing workflow: `.github/workflows/agent43-v8-snaptrap-owner-root-diagnostic.yml` with explicit `prize_aware_nest_selection: true`.
- Native root/Bench detail archive: workflow artifact `13641796248`.

The important next question is whether choosing Bunnelby allows an actual subsequent funded Barrage/Burrow/Rototiller turn, or protects Articuno-GX for a reachable hand-entry use, and whether those routes alter meaningful attack/control outcomes against a stronger opposing policy. Evaluate actual source action completion, response quality, and Prize progression on fresh, independently registered physical deals before using such an effect in a full-field candidate comparison.
