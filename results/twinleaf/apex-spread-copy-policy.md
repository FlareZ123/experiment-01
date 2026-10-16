# Regidrago's copied-attack policy: a Bench Prize window

**Agent 37, 16 October 2026.** Research-only, opt-in tactical policy extension. It is not a competitive benchmark or a win-rate estimate.

## Problem and source

The pinned Twinleaf `ChooseAttackPromptResolver` sorts usable copied attacks by printed damage and then by printed Energy cost length. The previously committed [policy characterization](../../simulation/twinleaf/apex-policy-choice.cjs) observed that, when given Dragapult ex TWM's **Phantom Dive** (200 damage plus six damage counters on the opponent's Bench), Hisuian Goodra VSTAR LOR's **Rolling Iron** (200 damage plus defensive effect), and Kyurem SFA's **Trifrost** (printed zero), the generic resolver selects Rolling Iron. That resolver does not inspect opponent Bench HP, post-attack Knock Outs, Prize timing, or the source card's text. [Pinned upstream TypeScript](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/choose-attack-prompt-resolver.ts).

Under the bundled rulebook C-07, putting damage counters is an effect rather than attack damage, so Weakness and Resistance do not apply. Phantom Dive can put six ten-damage counters across the opponent's Bench. A Benched Pokémon with 50 HP remaining would present a *potential* additional Knock Out. However, relevant effect immunities and other protections can invalidate that opportunity.

## Narrow opt-in policy

[Spread-aware copy resolver](../../simulation/twinleaf/apex-spread-copy-resolver.cjs) intercepts only a `CHOOSE_ATTACK_TO_COPY` prompt in the numeric `GamePhase.ATTACK`, controlled by a player whose Active Pokémon is Regidrago VSTAR. It delegates to the original generic resolver first and changes the answer **only when** the original choice was Rolling Iron, there is a legal unblocked Phantom Dive with equal printed Active damage, and an opponent Benched Pokémon has 1–60 nominal remaining HP. It returns the actual attack object from the prompt and validates the new response through `prompt.validate`.

This establishes a local tactical objective: search for an available **extra Knock Out** with equal printed Active damage. The policy is intentionally limited to one attacking archetype and one pair of payloads. It leaves every other prompt with the upstream implementation. The `withSpreadAwareCopyResolver` wrapper restores the original resolver constructor after synchronous use, including on an exception.

## Evidence and tests

- Local Node 22: six source-free deterministic tests passed; the compiled Twinleaf-dependent test skipped because the pinned engine was unavailable in the local container. No engine result is claimed yet.
- [Seven regression cases](../../tests/apex-spread-copy-resolver.test.cjs) include a 50-HP Bench window, a healthy Bench, no Bench, blocked Phantom Dive, wrong phase/Pokémon, alternate generic choice, and a compiled-engine opt-in-versus-generic prompt plus array restoration.
- [Manual, non-per-commit workflow](../../.github/workflows/apex-spread-policy.yml) checks out pinned `vendor/twinleaf`, compiles, and executes the complete test suite.

## Limits and next steps

The HP calculation is an optimistic screen. It does **not** evaluate Tool/Energy effect immunity, post-attack counters allocation, legal targets under shielding, opponent's Prize modification, Rolling Iron's potentially vital protection, damage modifiers to the Active Pokémon, or the full turn. It also does not prove that a subsequent Twinleaf counter-placement resolver will assign six counters to the Bench target even when Phantom Dive is chosen. Thus passing the prompt test establishes only a better *available-choice signal*, with no guaranteed extra Prize and no win-rate inference.

Future checks should dispatch an actual Apex Dragon turn with both attacks available and validate that the follow-on counter-allocation prompt takes the exposed Knock Out. Then compare policy variants on fixed source decks in both genuine starting seats, with faithful effects and competent opponent decisions. The current 99.5% target remains unverified.
