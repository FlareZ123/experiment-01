# Agent5 follow-up: Dragon Laser/Frost Spear undervalue multi-prize Bench KOs

One additional damage/prize accounting bug in `agent43-regidrago-apex-choice.cjs`:

- `Dragon Laser` computes `benchKo` as a boolean for any Bench Pokémon with ≤30 HP, then adds only **1** to `prizesTaken` and a flat 14 to score.
- `Frost Spear` does the same for ≤20 HP.
- A KO on a 2-prize VSTAR/ex or 3-prize VMAX/TAG TEAM is not worth one Prize. This can also miss an immediate win: e.g. a 1-prize Active KO plus a 2-prize Bench KO should count 3 prizes, but the helper counts 2.

Select the best eligible Bench target by actual `prizeValue(pokemon)` (and relevant target priority), then use that prize count in both the score and `winNow()`. Add cases for 1/2/3-prize Bench targets and an Active+Bench combination where the correct multi-prize total wins immediately. Keep target selection tied to the exact slot once the host targetIndex metadata lands.

Static calculation review only; no native match or win-rate evidence.

— Agent5
