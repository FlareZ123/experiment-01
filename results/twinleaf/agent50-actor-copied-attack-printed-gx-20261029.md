# Actor-only copied-attack prompt: public printed-GX quota normalization

**Agent 50 | 29 October 2026 | native-actor policy correctness, no competitive win-rate evidence.**

## Mechanism and regression hypothesis

The canonical actor root selector already recognizes `attack.gxAttack===true || attack.name.endsWith('-GX')` when deciding whether an attack consumes the single GX allowance. The separately composed actor-only `ChooseAttackPrompt` selector previously translated GX status as only `attack.gxAttack===true`. That discrepancy matters because Agent 30 [reproduced](../aichi-2026/agent30-powerglass-printed-gx-corrected-sourcefirst-completion-20261021.md) a missing `gxAttack:true` attribute on pinned Mewtwo & Mew-GX's printed `Miraculous Duo-GX`, with native enforcement producing `LABEL_GX_USED`. The exact affected history does not establish that a copied-attack prompt, as opposed to root attack selection, caused a particular historical abort. This change closes the independent, testable prompt-level possibility.

Under the Advanced Rulebook's priority of current card text over generic rules and the printed GX naming convention, the actor selector must classify a printed `-GX` attack as GX even when the static metadata boolean is missing. The GX allowance is a **one-use, game-scoped resource**. [Official Pokémon GX explanation](https://www.pokemon.com/us/strategy/big-changes-in-pokemon-tcg-sun-moon/).

## Implemented boundary

Source file: [actor-only ChooseAttack](../../simulation/twinleaf/agent13-actor-only-choose-attack.cjs), policy version `agent13-actor-only-copied-attack-choice-v4-public-gx-lock`. The pure helper `isPrintedGxAttack` tests either explicit GX metadata or printed attack name ending `-GX`. Both the frozen owner-visible prompt DTO and the pure menu selector use that same helper. A used GX allowance, or an active public `cannotUseGXAttacks` restriction, excludes the printed GX entry even if the native metadata is false. The original typed source/attack indices and native printed Attack reference are preserved. No vendor code or opponent hidden state is read.

[Regression tests](../../tests/agent13-actor-only-choose-attack.test.cjs) assert: (1) missing-flag `Miraculous Duo-GX` and `Horror House-GX` classification; (2) spent-quota avoidance in favor of a non-GX entry; (3) cancellation/fail-closed handling of an all-spent menu; (4) DTO construction from a printed missing-flag mock while preserving the original card object and filtering hidden state.

**Completed evidence:** the [first actor-policy workflow run 40919751432](https://github.com/FlareZ123/experiment-01/actions/runs/40919751432) passed the added pure selector tests at commit `b99ca9df4b2102e0ef6530c56ca7c69c88f6d9d6`. The [second workflow run 40920474702](https://github.com/FlareZ123/experiment-01/actions/runs/40920474702) passed the real pinned-Store fixture [agent50-printed-gx-copied-prompt.native.test.cjs](../../tests/agent50-printed-gx-copied-prompt.native.test.cjs): a genuine owner `Perfection` prompt was reached from a staged published GX donor with `gxAttack` missing, the owner had previously consumed its GX allowance, the actor selector chose the non-GX `Poltergeist` attack, the genuine native `prompt.validate` accepted it, and `ResolvePromptAction` was accepted by native Store. The [third workflow run 40920854767](https://github.com/FlareZ123/experiment-01/actions/runs/40920854767) passed the public `cannotUseGXAttacks` pure regression and the pinned native prompt fixture. The three manual validation runs all succeeded, with zero competitive-strength qualification.

## Qualification and follow-up

This is a narrowly scoped proposal-selection correction. Full-game opponent policy, native attack settlement, 25-minute tournament clock, full-field coverage, and a competitive-strength delta are unproven. The 29/32 authenticated opponent-list count, zero competitively qualified games, and absence of a demonstrated 99.5% deck remain unchanged. Any actual game or percentage inferred from these pure regressions would be invalid.

Further falsification: evaluate the selector on a real full-game information boundary and multiple owner printings, compare native attack settlement and controlled candidate/source policies on unchanged physical deals, and preserve all aborts and caps. The staged fixture proves one paid native choice; it does not estimate how often the decision occurs in play.
