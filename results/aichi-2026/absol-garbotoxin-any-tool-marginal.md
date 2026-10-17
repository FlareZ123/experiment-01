# First-turn Absol Garbotoxin: Muscle Band is a second qualifying Tool

**Agent 14, 17 October 2026.** A narrow source-count, printed-card, and exact combinatorial extension. No games were played or qualified.

The four published Aichi Absol/Garbodor lists (ranks **8, 11, 16, 22**) each register **one Muscle Band XY121** in addition to Float Stone. The bundled Muscle Band printing allows attachment to any Pokémon without a Pokémon Tool. Both Garbodor LTR68 and BKP57 check whether **a Pokémon Tool** is attached for Garbotoxin. Consequently Muscle Band on Trubbish can survive evolution and immediately enable Garbotoxin, even though it does **not** supply Float Stone's free-retreat benefit.

The previously validated direct first-turn audit used **Float Stone only**. The present read-only source-specific extension adds the single Muscle Band to the compatible Tool population and keeps every other condition and the previously archived result unchanged. The first seven must contain a Basic; the first compulsory turn draw is included; an unprized Garbodor must remain searchable after six Prize cards. The opening cards must contain Trubbish, a compatible Tool, and Boost Shake (either starting order) or Wally (going second only). Boost Shake ends the turn.

| Opponent rank | Float Stone only, first / second | Float Stone or Muscle Band, first / second |
| --- | ---: | ---: |
| 8 | 1.34893% / 2.57604% | **1.61290% / 3.07894%** |
| 11 | 1.93832% / 1.93832% | **2.47061% / 2.47061%** |
| 16 | 2.54620% / 2.54620% | **3.04386% / 3.04386%** |
| 22 | 0% / 1.24959% | **0% / 1.49412%** |

**Verification:** [Manual opening-audit CI 39050124994](https://github.com/FlareZ123/experiment-01/actions/runs/39050124994) passed on head `c1699ad1dc4766f1642492da25d08e6205fc1860`. Source: `results/aichi-2026/full-decklists.json`, printed Muscle Band XY121 `resources/cards/en/xy1.json`. Reproducible tool `scripts/aichi-absol-any-tool-first-turn.cjs`, tested by `tests/aichi-absol-any-tool-first-turn.test.cjs`, saved as JSON in the opening-audit CI artifact. It reuses the previous source-validated first-seven, compulsory draw and all-Garbodor-prized enumerator. Independent Python rational enumeration agreed with the same numeric probabilities.

**Interpretation:** The missing one-copy Tool increases *direct unassisted availability* by about 0.24 to 0.53 percentage points depending on rank and turn order. This is a small, measurable correction to an already narrow resource event. Muscle Band and Float Stone differ in mobility and damage effects. Search connectors, alternative Tools, Prize knowledge, opponent intervention, Supporter contention, and actual decision quality remain outside the model. These percentages are **not** practical Garbotoxin setup rates, game-win rates, or evidence toward 99.5%. Continue to use the prior Float Stone-only model for questions explicitly requiring free retreat.

Related prior result: [Agent 8 direct Float Stone/Wally opener](absol-garbotoxin-direct-wally-opener.md).
