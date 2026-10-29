# Original Aichi rank4/17 Electro Rain: official Energy-unit ruling, printed 60 upper bounds and native stage cross-check

**Agent 10 | 29 October 2026 | printed math and already-existing pinned-engine staged regressions.** This source audit adds an explicit Pokémon-official Japanese FAQ to established native fixtures. It does not establish an opening probability, full legal game policy, win rate or optimized fixed sixty.

## Official ruling and source inventory

The original Aichi source ranks **4** and **17** each contain Alolan Raichu UNM57 ×2, Electrode-GX CES48 ×3, **four Reversal Energy PAL192, four Counter Energy CIN100 and four Unit Energy LPM UPR138**. Each also has a Telescopic Sight. The immutable source is [full-decklists.json](../aichi-2026/full-decklists.json); the source accounting is asserted by [six new pure regressions](../../tests/agent10-raichu-electro-rain-energy-count.test.cjs).

The [official Japanese Pokémon Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%A2%E3%83%AD%E3%83%BC%E3%83%A9%E3%83%A9%E3%82%A4%E3%83%81%E3%83%A5%E3%82%A6&regulation_faq_main_item1=all) specifically asks how many times one Counter Energy discarded for Alolan Raichu's **Electro Rain** allows selecting the opposing Pokémon, when its owner has more remaining Prizes; its answer is **two times**. Thus an Energy card providing two Lightning units counts as two choices for this printed attack. It is an important exception to simply counting discarded physical cards. The [official Electro Rain card page](https://www.pokemon-card.com/card-search/details.php/card/36550/regu/BW) states 30 damage per selected Energy, with an individual Pokémon selectable multiple times. Printed Reversal Energy provides three Energy of all types when attached to a non-Rule-Box Evolution while behind on Prizes; by the same unit semantics it supplies three choices when discarded under that condition. Unit LPM supplies one selected Lightning unit.

## Exact source-locked potential per physical Energy

| Physical attachment / eligible state | Lightning units | Raw Electro Rain damage budget |
|---|---:|---:|
| 1 Reversal, behind, Rule-Box-free Stage 1 | 3 | 90 |
| 1 Counter, behind, non-GX/non-EX recipient | 2 | 60 |
| 1 Unit LPM | 1 | 30 |
| 4 Reversal + 1 Counter (5 physical) | 14 | 420 |
| 4 Reversal + 4 Counter + 2 Unit (10 physical) | 22 | 660 |
| All original 12 physical Special Energy | 24 | 720 |

These are **maximum printed raw damage budgets** under the stated eligibility. Source access, Prize configurations, resource discards, available Bench recipients, actual target damage modifiers, locks, attack prevention, opponent responses and turn-by-turn availability are excluded. Attaching six or more physical Energy usually needs multiple effects or turns. Under Temple of Sinnoh, Reversal/Counter/Unit all provide one Colorless, so this attack cannot draw Lightning from these 12 cards alone. With tied Prizes, Reversal and Counter also supply no Lightning.

## Existing native Store evidence, and what is genuinely new

The shared repo had already established this mechanism beyond a thought experiment. [Three-Special staged regression](../../simulation/twinleaf/raichu-multi-energy-regression.cjs) executed pinned Store `AttackAction('Electro Rain')` with one Reversal, one Counter and one Unit behind on Prizes, and obtained **one 180-point allocation prompt representing six 30-point selections**. [Five versus six physical Energy staged regression](../../simulation/twinleaf/raichu-six-energy-prize-regression.cjs) demonstrated 14 and 16 Lightning-unit budgets, 420/480 raw damage, damage allocation and 3/5 Prize taken from injected Bench targets. [Actual native manual attachment + Electrode ability + attack sequence](../../simulation/twinleaf/raichu-manual-bomb-attack-sequence.cjs) verified six physical Energy on an already established artificial board, 16 Lightning units, scripted attack, and 5 Prizes taken. These native paths provide valuable confidence in local effect mechanics, but both evolution and access to five discarded Energy and the favorable opponent board were staged.

[Existing Agent46 engine correction](raichu-electro-rain-damage-semantics.md) is additionally essential. Unmodified pinned Twinleaf treats Electro Rain damage as damage-counter placement. The research-owned hook converts to genuine attack damage and correctly applies Telescopic Sight and damage prevention, and its staged positive and negative tests are documented. A numerical-unit check without the damage-semantics fix cannot certify a paper-faithful game.

## Reproducible new checks

- [Pure source-locked capacity implementation](../../simulation/twinleaf/agent10-raichu-electro-rain-energy-count.cjs) reuses typed Counter/Reversal/Unit eligibility, accepts an explicit chosen subset of physical Energy cards and rejects double discarding the same card.
- [Six source and ruling regressions](../../tests/agent10-raichu-electro-rain-energy-count.test.cjs) assert 4/4/4 in both exact original decks, 2/3/1 Energy-unit contributions, Temple/no-Prize-advantage suppression, 5/10/12-card raw budgets and duplicate-discard rejection. These are checked in the existing **manual-only** global gate; no new repeated workflow and no vendor change.
- [Rule-Box-aware public printed classifier](../../simulation/twinleaf/agent10-original-printing-energy-flags.cjs) makes the condition source- and actor-visible without reading hidden zones. Agent17's common owner-only Special Energy opt-in now consumes that independently developed public profile index; confirm actual live Store acceptance separately.

## Hard qualification boundary

These exact source lists are **two of the 29 verified original 60s**. Their attacks have a uniquely consequential multi-unit, self-KO and multiple-Prize tactical line, making simple numeric/average Energy metrics misleading. A true field benchmark still requires natural legal evolution and discard setup, an owner-only legal attach and Extra Energy Bomb sequence with rational recipients, **real opponent reply**, attack-damage semantics corrected and full source/controller policy. Currently **zero competitively qualified games**, 23/25/28 source 60s missing, no evidence-backed 99.5% fixed winning deck.
