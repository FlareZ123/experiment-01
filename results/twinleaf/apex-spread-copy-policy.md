# Regidrago's copied-attack policy: a Bench Prize window

**Agent 37, 16 October 2026.** Research-only, opt-in tactical policy extension. It is not a competitive benchmark or a win-rate estimate.

## Problem and source

The pinned Twinleaf `ChooseAttackPromptResolver` sorts usable copied attacks by printed damage and then by printed Energy cost length. The previously committed [policy characterization](../../simulation/twinleaf/apex-policy-choice.cjs) observed that, when given Dragapult ex TWM's **Phantom Dive** (200 damage plus six damage counters on the opponent's Bench), Hisuian Goodra VSTAR LOR's **Rolling Iron** (200 damage plus defensive effect), and Kyurem SFA's **Trifrost** (printed zero), the generic resolver selects Rolling Iron. That resolver does not inspect opponent Bench HP, post-attack Knock Outs, Prize timing, or the source card's text. [Pinned upstream TypeScript](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/choose-attack-prompt-resolver.ts).

Under the bundled rulebook C-07, putting damage counters is an effect rather than attack damage, so Weakness and Resistance do not apply. Phantom Dive can put six ten-damage counters across the opponent's Bench. A Benched Pokémon with 50 HP remaining would present a *potential* additional Knock Out. However, relevant effect immunities and other protections can invalidate that opportunity.

## Narrow opt-in policy

[Spread-aware copy resolver](../../simulation/twinleaf/apex-spread-copy-resolver.cjs) intercepts only a `CHOOSE_ATTACK_TO_COPY` prompt in the numeric `GamePhase.ATTACK`, controlled by a player whose Active Pokémon is Regidrago VSTAR. It delegates to the original generic resolver first and changes the answer **only when** the original choice was Rolling Iron, there is a legal unblocked Phantom Dive with equal printed Active damage, and an opponent Benched Pokémon has 1–60 nominal remaining HP. It returns the actual attack object from the prompt and validates the new response through `prompt.validate`.

This establishes a local tactical objective: search for an available **extra Knock Out** with equal printed Active damage. The policy is intentionally limited to one attacking archetype and one pair of payloads. It leaves every other prompt with the upstream implementation. The `withSpreadAwareCopyResolver` wrapper restores the original resolver constructor after synchronous use, including on an exception.

## Evidence and tests

- The six local, source-free deterministic tests passed. The seventh test ran against the compiled pinned engine in [manual CI 38833670312](https://github.com/FlareZ123/experiment-01/actions/runs/38833670312); all seven passed.
- [Seven regression cases](../../tests/apex-spread-copy-resolver.test.cjs) include a 50-HP Bench window, a healthy Bench, no Bench, blocked Phantom Dive, wrong phase/Pokémon, alternate generic choice, and a compiled-engine opt-in-versus-generic prompt plus array restoration.
- [Manual, non-per-commit workflow](../../.github/workflows/apex-spread-policy.yml) checks out pinned `vendor/twinleaf`, compiles, and executes the complete test suite.

## Multi-KO counter placement and verified Prize transition

A second, distinct opt-in [counter-allocation resolver](../../simulation/twinleaf/apex-spread-damage-resolver.cjs) replaces the pinned `PutDamagePromptResolver` on a 60-damage opposing-Bench prompt while an Active Regidrago VSTAR is attacking. It enumerates the at-most-32 subsets of vulnerable Benched Pokémon, selects the subset with the largest number of immediate nominal Knock Outs whose required counters sum to at most six, and supplies a complete validated damage map. This is an optimistic one-ply **KO-count** heuristic rather than a general Prize-value or opponent-response policy.

[Seven further tests](../../tests/apex-spread-damage-resolver.test.cjs) cover one-target and two-target placement, maximizing Knock Outs, blocked/protected targets, strict gating, default fallback, and a compiled pinned-engine `AttackAction` fixture. In that fixture, Regidrago's Apex Dragon is paid using Grass+Grass+Fire, the opponent's Active Mimikyu PAL has Safeguard, and two 30-HP Budew ASC occupy opponent Bench slots. Goodra's Rolling Iron and Dragapult's Phantom Dive are available from the attacking discard. The generic copied-attack resolver selects Rolling Iron; the opt-in copy resolver selects Phantom Dive and the opt-in counter resolver produces two allocations of 30 damage each. After dispatching the engine's pending animation `WaitPrompt` and ordinary `ChoosePrizePrompt` via the pinned generic Prize resolver, **both Budew are in the opponent discard and two Prize cards are actually taken**.

[Manual CI 38835339980 passed](https://github.com/FlareZ123/experiment-01/actions/runs/38835339980) with all compiled tests, pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Earlier red CI runs were useful diagnostics: before finishing the animation, damage appeared on both Benches while KOs remained pending; before selecting Prize cards, the KO results were visible but the count of taken Prizes remained zero. These represent normal engine phase progression. Correct Prize counts use `Player.getPrizeLeft()`, whereas `Player.prizes.length` counts fixed Prize slots and can remain six after cards have been removed from them.

Source context: `results/aichi-2026/full-decklists.json` contains nine published Regidrago inventories, **all nine with Dragapult ex**, and five with Hisuian Goodra VSTAR. The published rank-15 Lopunny Vileplume inventory contains **two Budew ASC**. The proof fixture nevertheless mixes its Budew with Active Mimikyu PAL, which belongs to the published rank-3 Snorlax list. It is a legal-effect synthetic board, **not a played game or a source-faithful rank-15 matchup**.

The prior [Agent 3 single-target Regidrago Prize-window resolver](../../simulation/twinleaf/regidrago-prize-window-resolver.cjs) and [injected one-Budew interaction](../../simulation/twinleaf/regidrago-prize-window-interaction.cjs) address a closely related selection gap. Agent 37's addition is a reversible generic-resolver subclass and the **automatic six-counter, multi-target distribution** with completed KO/Prize handling. This overlap is explicit to preserve attribution and avoid claiming independent discovery of the original tactical idea.

## Limits and next steps

The local HP and KO-count calculation excludes any target with printed powers or Tools, but does **not** prove immunity handling for indirect protection, Special Energy, external abilities, target-specific restrictions, or evolving HP. It does not compare the damage-allocation line's strategic value with Goodra's protection, Timeless-GX extra-turn lines, attacks from other discarded Dragons, opponent responses, or a multi-turn Prize route. The engine's copied effect and Prize transition are verified only in the injected position. No win rate follows from this result.

The next tests should substitute a source-inventory-consistent opponent board, compare the generic and opt-in complete action traces under identical conditions, and eventually test the policy in qualified full matches after evolution, Double Dragon attachment, game RNG isolation, and opponent decisions are calibrated. The current 99.5% goal remains unverified.
