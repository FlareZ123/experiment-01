# Agent 46: source-locked Electro Rain energy and Prize upper-bound audit

**16 October 2026. Evidence classes:** Japanese official rulings, card text, deterministic source-inventory arithmetic, and a bounded hypothetical-board calculation. No game has been played or evaluated here. [Manual statistical CI 38854289908](https://github.com/FlareZ123/experiment-01/actions/runs/38854289908) completed successfully at research commit `10adff9893efb2366b3e423f5773dbed1b0c387c`.

## Why this matters to the fixed-deck Aichi field

The [29-list source manifest](full-decklists.json) contains two published `Raichu Electrode Combo` decks, **rank 4 (Shu Hosoda)** and **rank 17 (Yuya Yamano)**. Both have 2 Alolan Raichu (UNM 57), 3 Electrode-GX (CES 48), and the same **12-card Special Energy inventory**: 4 Reversal Energy, 4 Counter Energy, 4 Unit Energy LPM. Rank 25 is an additional Raichu placement whose complete 60 is unavailable; nothing here assumes its contents.

Electrode-GX's `Extra Energy Bomb` can move five Energy **cards** from the discard to non-GX Pokémon and knocks out Electrode-GX. Alolan Raichu's `Electro Rain` selects one target per discarded Lightning **Energy unit** and deals 30 damage per selection, with repeated selections of the same target permitted. Counting five attached Energy *cards* as necessarily five selections is wrong.

## Primary rulings and card sources

- [Japanese official Alolan Raichu FAQ](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%A2%E3%83%AD%E3%83%BC%E3%83%A9%E3%83%A9%E3%82%A4%E3%83%81%E3%83%A5%E3%82%A6&regulation_faq_main_item1=all): with a Prize deficit, discarding **one Counter Energy** through Electro Rain permits **two target selections**. This directly verifies the energy-unit interpretation for a two-unit Special Energy.
- The same official FAQ states that targeting an Active GX three times with three basic Lightning Energy and **Choice Band** deals **120 damage** (90 plus a single 30 bonus). A damage modifier must not be added separately to every 30-damage selection against the same target.
- [Official Japanese card](https://www.pokemon-card.com/card-search/details.php/card/36550/regu/BW) and the bundled card snapshot's UNM 57 establish the attack text and repeated-target choice.
- The local [Advanced Player's Rulebook](../../resources/advanced-players-rulebook.md), section C-01, gives the analogous three-unit Ignition Energy discard ruling; the Reversal Energy three-unit extrapolation also follows that card's own text.
- Printed [Temple of Sinnoh](https://limitlesstcg.com/cards/asr/155) says all attached Special Energy supply Colorless and have no other effect. Both published Raichu source lists lack basic Lightning Energy.
- [Telescopic Sight](https://limitlesstcg.com/cards/viv/160) adds 30 attack damage against eligible Benched Pokémon. The exact application of this modifier to Electro Rain remains an engine-fixture question; the generic bound accepts a caller-supplied once-per-target bonus only when independently justified.

## Exact conditional source-inventory upper bounds

Assume the Energy are attached to a non-Rule-Box Stage 1 Alolan Raichu, all listed copies are accessible, and no other modifying effects apply. These are card-count ceilings, not estimated probabilities of setup or legal turns.

| Snapshot state | One 5-card Bomb | Two 5-card Bombs | All 12 source Energy |
| --- | ---: | ---: | ---: |
| Behind on Prizes, no Temple | **14 selections / 420 base damage** | **22 / 660** | **24 / 720** |
| Tied on Prizes, no Temple | 4 / 120 | 4 / 120 | 4 / 120 |
| Behind, Temple of Sinnoh active | 0 | 0 | 0 |

When behind, each Reversal contributes three Lightning units, Counter two, and Unit Energy LPM one. Five optimal cards are 4 Reversal + 1 Counter: `4×3 + 1×2 = 14`. Ten are 4 Reversal + 4 Counter + 2 Unit: `12+8+2=22`. Twelve add the remaining two Unit: **24**. When tied, Reversal and Counter produce no Lightning; four Unit Energy LPM remain. Temple removes all Lightning provision from these twelve Special Energy. With no other attack-cost changes, the published lists then cannot announce Electro Rain until Temple is displaced or its effect removed.

These conditional states should not be conflated. The first Electrode-GX self-KO awards the opponent two Prizes and can turn on Counter/Reversal. Taking Prizes later can switch those effects off. The ceiling ignores whether the five Energy are actually in the discard, whether the Stage 1 attackers were evolved in time, recovery and search resource contention, opponent attacks, Ability locks, available Bench positions, and Stadium responses.

## Prize allocation oracle (only after attack feasibility)

[Pure source-checked calculator](../../scripts/aichi-raichu-energy-capacity.cjs) also enumerates subsets of at most 12 abstract live targets to maximize Prizes taken within a fixed number of 30-damage selections. A target with remaining HP `h` and one applicable flat damage bonus `b` requires at least `max(1, ceil((h-b)/30))` selections under the deliberately simplified no-prevention model.

For a **hypothetical** board of 180-HP and 200-HP two-Prize targets plus a 60-HP one-Prize target, a 14-selection budget can take **four Prizes** using 6+7=13 selections against the two two-Prizers. Taking all five would require 15 selections. This example proves only the arithmetic and subset optimizer's behavior. Real damage prevention, target eligibility, simultaneous knockout timing, existing effects, Bench protection, card-specific Prize rules, attack sequence and opposing policy require separate adjudication.

The accompanying [regressions](../../tests/aichi-raichu-energy-capacity.test.cjs) validate both published 12-Energy identities, the two official FAQ examples, prize-state and Temple switches, five/ten/twelve-card upper bounds, and a hypothetical Prize allocation. The existing **manual-only** Aichi statistical workflow includes the test and passed. The checker does not claim Twinleaf implements Electro Rain correctly.

## Next action with high value

Stage an exact rank-4 or rank-17 board in pinned Twinleaf: evolved Alolan Raichu, Counter Energy, Reversal Energy, Unit Energy LPM, the relevant Prize deficit, active/Benched targets, and one clear attack. Assert **six target selections from three attached cards** (3+2+1), their legal damage allocation, and that the same card setup under Temple cannot announce Electro Rain. Repeat with Telescopic Sight on the correct eligible Bench target, checking one 30-damage modifier for the target rather than for each chosen Energy unit. Preserve full prompts/action history, pin engine and hook revisions, and ask a rules validator about any engine disagreement before treating rank-4/17 outcomes as realistic.
