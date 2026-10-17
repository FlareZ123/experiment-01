# Battle Compressor: paper minimum, headless opt-in, source exposure

**Agent 17, 17 October 2026.** All game outcomes below are unqualified generic-bot diagnostics.

## Card-rule mismatch and reproducible correction

[Official Japanese FAQ 9672](https://www.pokemon-card.com/rules/faq/details.php?id=9672) says Battle Compressor cannot choose zero cards. Pinned Twinleaf at commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` gives its ChooseCardsPrompt `min:0,max:3`, allowing zero. The research-owned [opt-in correction](../../simulation/twinleaf/battle-compressor-minimum-hook.cjs) requires at least one while retaining the upstream original by default.

The pinned trainer lifecycle has a further important timing detail: the Item moves from the play zone to discard only after its card-selection prompt, the ensuing ShuffleDeckPrompt and the animation WaitPrompt all resolve. [Updated Store probe and tests](../../tests/battle-compressor-minimum.test.cjs) assert each intermediate zone and final cleanup. **Manual compiled CI [39033164385](https://github.com/FlareZ123/experiment-01/actions/runs/39033164385) passed**.

## Shared match-runner option

[headless.cjs](../../simulation/twinleaf/headless.cjs) now supports `battleCompressorPositiveSelectionCorrection:true`, always restoring the prior dispatch method after the match. Results include a boolean and the distinct `BattleCompressorMin1-paper-v1` policy suffix. The flag is default-off, preserving historical experiments. The short real-engine option and restoration test **passed [CI 39033983878](https://github.com/FlareZ123/experiment-01/actions/runs/39033983878)**. The Twinleaf vendor submodule is unchanged.

## First bounded source-dealt exposure

The root-only observer in [battle-compressor-source-exposure.cjs](../../simulation/twinleaf/battle-compressor-source-exposure.cjs) watches actual pending Battle Compressor selections and excludes speculative bot Stores. [Manual compiled CI 39034295937](https://github.com/FlareZ123/experiment-01/actions/runs/39034295937) ran rank-1 Shadow Rider versus exact rank-10 Regidrago source cards, two physical seats, seed 20261017 for seat 0 and 20261018 for seat 1, one paired baseline and corrected arm per seat, strict prompt validation, 120 action cap.

| Candidate physical seat | Actual first seat | Baseline selections | Corrected selections | Outcome |
| --- | --- | ---: | ---: | --- |
| 0 | 1 | 0 | 0 | Unfinished, 120 actions |
| 1 | 1 | 0 | 0 | Unfinished, 120 actions |

Each of four arms contained 122 root dispatches including player additions. The paired arms used identical card identities and seed per physical seat; all four recorded **zero Battle Compressor prompt exposure**, so the result says nothing about whether the correction changes genuine play in states where the Item is used. The shared source manifest digest was `653ed6620d742f1f011d729557265e6173902b5fa87c8b4830f886f7be585173`. A later commit extends source telemetry to record Battle Compressor appearances in hands and played-card counts; that change must be assessed under its own CI run.

## Boundary and next step

Search for a genuine source-dealt Battle Compressor prompt before measuring treatment effects. Preserve original zone, prompt, choices and full shuffle/wait completion, paired with a paper-valid alternate and legal opponent continuation. These bounded games do not verify policy competence or any competitive matchup win. The benchmark retains 29/32 exact published lists with missing ranks 23, 25 and 28, zero qualified games and no evidence for the 99.5% win target.
