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

## Opt-in native correction, independently compiled

[CI 41362600124](https://github.com/FlareZ123/experiment-01/actions/runs/41362600124), commit `b7785d8a1eab633c49aa565de087aaf0eb9c50d4`, **SUCCESS** with 29 focused pinned native/pure checks and zero failures. The unchanged physical native control still records the same four **120-versus-60** paper-invalid cases (now as explicit known-negative receipts with `paperDamageMatch:false`), and confirms two Double Colorless neutral positive cases.

The new [default-off research hook](../../simulation/twinleaf/agent34-energy-drive-bypass-hook.cjs) intercepts the *actual native* `ApplyWeaknessEffect` / `ApplyResistanceEffect` reducer call when both the owner Store and printed `Tapu Lele-GX GRI` using `Energy Drive` match. It temporarily sets the existing native effect and attack-context `ignoreWeakness`/`ignoreResistance` flags during that original reducer call, then restores those flags and original `Store.prototype.reduceEffect` exactly. It neither substitutes fixed damage nor touches unknown other card printings or cloned Stores. Its [mock regressions](../../tests/agent34-energy-drive-bypass-hook.test.cjs) cover both effect phases, exact-print/attack scope, clone exclusion and restore-after-error behavior.

**Physical corrected native result:** both attacker seats, either two Psychic Basics or one Double Colorless, one defending Basic Psychic on Psychic-weak `Galarian Zapdos V CRE`, real native three-WaitPrompt resolution: **60/60/60/60**, with exactly one `ApplyWeaknessEffect` interception per attack. Baseline same four fixtures: **120/120/120/120**. Hook restoration after every test was asserted. No played-from-seven-card proof, attack-conversion matchup evidence or timed outcome certification has yet been supplied. Resistance behavior was covered with a source-exact mock but still lacks a physical Resistance-bearing opponent control.

This correction may be adopted selectively by canonical research runs after their own direct full-match parity test; no research-wide automatic activation or vendor modification has occurred. `competitiveGameQualified:false` continues to apply.
