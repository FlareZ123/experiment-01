# Rank-6 Stadium-search choice can threaten the very Volt Cyclone it enables

**Agent 33, 17 October 2026.** Evidence classification: exact published card-text and rulebook derivation, combined with the previously verified source-dealt first-attack branch. **No new live Store branch has been tested for these alternative Stadium decisions; zero qualified competitive games.**

## Source turn and strategically discrete choice

[Compiled source seed 20367160](rank6-source-dealt-guzma-hala-fork.md) verifies Iron Thorns ex attacking for **140** on its first turn with `Double Colorless Energy` (SUM 136) attached and `Thunder Mountain ◇` (LOT 191) played from the opening hand. No Iron Thorns Pokémon occupy the Bench, so Volt Cyclone's instruction to move an attached Energy to a Benched Pokémon cannot move that card in this source state.

The tested `Guzma & Hala` (CEC 193) line also searches `Wondrous Labyrinth ◇` (TEU 158) into hand, alongside the DCE. It is **not** played before that attack. With Thunder Mountain already played as this turn's Stadium, the rulebook's one-Stadium-per-turn rule prevents playing the searched Wondrous Labyrinth on the same turn.

These two Prism Star Stadiums have diametrically opposed attack-cost consequences for Iron Thorns. Their printed text matters more than a search graph showing two available Stadiums.

## Exact energy-cost state from the source DCE

Iron Thorns ex (`TWM 77`) is Lightning and Volt Cyclone's printed Energy cost is **Lightning + Colorless + Colorless**. The sole attached DCE provides two Colorless Energy. The source-attacker's status is:

| Stadium after the opening turn | Effective Volt Cyclone cost | Missing beyond attached DCE | One normal attachment enough? |
| --- | --- | --- | --- |
| Thunder Mountain ◇ remains | Colorless + Colorless | Nothing | Already attack-ready |
| Thunder Mountain is removed; no new modifier | Lightning + Colorless + Colorless | One Lightning | Yes, with a valid Lightning-providing Energy |
| Wondrous Labyrinth ◇ replaces Thunder | Lightning + Colorless + Colorless + Colorless | One Lightning plus one Colorless | **No**, using any single Energy card available in the published rank-6 source list |

For the last row, the actual published rank-6 Energy inventory is 4 Speed Lightning Energy, 2 Capture Energy, 1 Spiky Energy and 1 Double Colorless Energy. The last is the DCE already attached in this source line. Speed Lightning supplies one Lightning; Capture or Spiky supplies one Colorless, and another Speed Lightning can pay a Colorless requirement. **Two additional one-unit Energy-card attachments are necessary** while Wondrous remains, barring card effects or later change of attacker or Stadium.

This is a resource lower bound for the exact board, not a claim that a normal future turn can always draw or attach the required Energy. It also assumes the already attached DCE stays put, which is supported by the observed empty-Bench source turn. If Iron Thorns develops a Bench and Volt Cyclone moves Energy, the calculation must be redone.

## Prism Star replacement permanence

Under standard Stadium replacement, playing a different Stadium sends the previous one toward the discard. Thunder Mountain's own **Prism Star rule** sends it to the Lost Zone instead. Therefore, **voluntarily playing Wondrous Labyrinth over the only Thunder Mountain in this 60 is irreversible with ordinary discard recovery**. A later replacement of Wondrous with a different Stadium does not recover Thunder from the Lost Zone.

Wondrous Labyrinth taxes attacks from opposing non-Fairy Pokémon too. Playing it could be strategically correct in some future boards. The verified first attack alone cannot decide that tradeoff. A naive bot that plays every acquired Stadium risks losing the attack-cost reduction it used to begin attacking.

## Unexecuted optional search line worth verifying

The Advanced Player's Rulebook section **I.H, Deck** allows deck searches for a restricted category to select fewer than the stated number, including zero, while exact-number searches for unrestricted “any card” are different. On the printed G&H text, the initial Stadium search is category-restricted and the optional Tool/Special Energy searches follow after discarding two cards.

Consequently, an independently valuable **paper-rules hypothesis** is that the same opening may search DCE as Special Energy after paying the two-card cost and deliberately take **no Stadium**, because Thunder Mountain is already held. That would avoid pulling Wondrous Labyrinth into a hand in which it might later conflict with Thunder, while giving up immediate hand access to Wondrous. The observed source script `simulation/twinleaf/rank6-seed-guzma-hala-fork.cjs` always selects the two-card pair DCE + Wondrous; it does **not** test a zero-Stadium response to the actual `ChooseCardsPrompt`.

The next meaningful source test should validate and dispatch the G&H prompted selection **with DCE alone**, ensuring the same real 140-damage turn and identical pre-fork physical hand and Prize cards. If the pinned Store rejects that category-fail search, distinguish an engine-prompt modeling defect from a paper-rules restriction before changing research policy. Then compare the next real opponent response under a representative decision policy.

## Boundary of the claim

Card facts: local card database printings `sv6-77` (Iron Thorns ex), `sm1-136` (DCE), `sm8-191` (Thunder Mountain), `sm9-158` (Wondrous Labyrinth), `sm12-193` (G&H), and the [published Aichi rank-6 60](full-decklists.json). Mechanics: provided Advanced Player's Rulebook sections **I.B-04**, **I.C**, and **I.H**, alongside printed Prism Star Stadium rules. Demonstrated engine first attack: [compiled CI 38911990792](https://github.com/FlareZ123/experiment-01/actions/runs/38911990792). The no-Stadium search and later self-replacement outcomes are **unexecuted branches**.

**No game win probability is implied; the 99.5% objective remains unverified.**
