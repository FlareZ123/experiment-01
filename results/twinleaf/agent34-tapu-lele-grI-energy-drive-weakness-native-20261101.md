# Source-paper Energy Drive Weakness omission in original native Twinleaf

**Agent 34, 1 November 2026.** This is a paper-versus-native damage fidelity result from deliberately staged physical Store positions. It is not a complete-game matchup or win-rate estimate.

## Printed rule and native source

Original `Tapu Lele-GX GRI 60` (`sm2-60`) says: “This attack does 20 damage times the amount of Energy attached to both Active Pokémon. This damage isn't affected by Weakness or Resistance.” `Galarian Zapdos V CRE 80` (`swsh6-80`) has Psychic ×2 Weakness. The supplied Advanced Player's Rulebook v3.4 section B-06 directs attacks that ignore Weakness and Resistance to skip both modifiers in damage calculation.

Research-native fixture: [source test](../../tests/agent34-tapu-lele-energy-drive.native.test.cjs). Each fixture instantiates the **actual executable** `Tapu Lele-GX GRI` physical card via the pinned CardManager, attaches basic Psychic or `Double Colorless Energy SUM`, assigns active player seat 0 or 1 in the original real `Store`, dispatches native `AttackAction('Energy Drive')`, and resolves all three real `WaitPrompt` completions. Defender uses `Shadow Rider Calyrex V CRE` for neutral controls or Psychic-weak `Galarian Zapdos V CRE`. Setup is explicitly staged, with Prizes and decks present to avoid spurious native sudden death. No shuffle, seven-card opening, actual opponent reply, Prize win or clock result is inferred.

## Compiled results

- **Native control PASS:** [CI 41361413192](https://github.com/FlareZ123/experiment-01/actions/runs/41361413192), pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. For two Basic Psychic on Tapu Lele and 0/1/2 Basic Psychic on a neutral defender, actual native physical damage was **40/60/80**, as printed, in all six variants across both physical seats.
- **Printed Weakness mismatch:** [CI 41361747206](https://github.com/FlareZ123/experiment-01/actions/runs/41361747206) compiled and finished with one intentional failed paper assertion out of 23 tests, confirming a genuine red test. Against `Galarian Zapdos V CRE` with one basic Psychic Energy, native damage was **120** although printed Energy Drive requires **60**, in all four variants: both attacking seats and both either two Psychic Basics or one Double Colorless attached to the attacker. All four attacks resolved their complete three-WaitPrompt chains; no dummy damage was injected.
- **Double Colorless positive control:** Against neutral `Shadow Rider Calyrex V CRE`, a **single** attached Double Colorless provided the two attack-cost units and the correctly printed 60 damage with one defending Basic Psychic. This passed both physical seats. It narrows the failure to the Weakness-bypass property rather than the two-unit Energy arithmetic.

**Native negative denominator:** four Psychic-weak combinations, all four returned 120 vs paper 60; the two DCE neutral cases returned 60 vs paper 60. This is a specific direct native paper-fidelity defect. It does not demonstrate incorrect attack damage on all Pokémon, other modifiers or all settings.

## Consequence and next validation

The original native engine cannot currently be treated as an authority for this exact source attack's printed Weakness exemption. A paper-faithful, **default-off and reversible research adapter** should correct only this attack's Weakness/Resistance handling while preserving the original native arithmetic and physically executed card path. Before game-level promotion, independently verify post-damage Knock Out, Prizes, prompt payment and opponent response. Avoid treating engine win counters under this unresolved effect as competitive-paper wins.

Communicated to canonical integration owner Agent41 and dynamic-effect auditor Agent50. No vendor code changed. Overall benchmark remains **29/32** authenticated opposing original 60s and **zero** competitively qualified games.
