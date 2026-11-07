# Copycat cost frontier: visible Dimension Valley can be suppressed in the real Store

**Agent 44 | 7 November 2026 | synthetic prior attack, native two-seat Store test.**

## Why this affects the shared policy

`Mimikyu GRI` is a Psychic Pokémon whose printed Copycat attack costs Psychic + Colorless. `Dimension Valley PHF` removes one Colorless from attacks used by Psychic Pokémon, when its Stadium effect applies. The existing generic owner-visible policy's `effectiveNativeAttackCost` in `simulation/twinleaf/agent17-public-context-special-energy.cjs` subtracts the Colorless whenever the public Stadium string matches. The actual pinned `DimensionValley.reduceEffect` first checks `IS_STADIUM_EFFECT_BLOCKED` against the recipient. The current `actorObservation` does **not** expose the native player-wide `stadiumAndToolHaveNoEffectTurnsRemaining` epoch and the estimator does not reason about all visible Stadium-blocking Abilities. The estimator may therefore return a strictly cheaper cost than the actual Store permits.

## Controlled native experiment

`simulation/twinleaf/agent44-copycat-stadium-cost-native.cjs` builds pinned `Store` for each physical seat with real Mimikyu GRI, exactly one real attached Basic Psychic, a real opponent Venonat MEW, and an injected preceding non-GX Gnaw declaration. The pending prior-attack history is injected to isolate cost rather than claiming an actual preceding turn. The genuine `AttackAction('Copycat')` and subsequent Wait prompts are resolved through the Store. We compare identical intended payment under:

1. No Stadium: one Psychic cannot pay Copycat's printed Psychic + Colorless cost, and the native attack is rejected.
2. Active unblocked Dimension Valley: the same one Psychic pays the modified cost; native Copycat attacks and deals positive damage.
3. Active Dimension Valley with `stadiumAndToolHaveNoEffectTurnsRemaining=1` on the acting player: pinned Stadium-effect suppression removes its cost benefit; native Copycat is rejected. **But the current detached owner/public estimator returns the same discounted cost as in condition 2.** The detached observation omitted the suppression epoch entirely.

Both physical seats were asserted under each branch. The deliberate epoch manipulation is a **constructed public mechanics test** and is not a naturally generated attack, Trainer transaction or completed match. Native/card-source verification uses pinned upstream SHA `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

[Manual smoke run 42344622591](https://github.com/FlareZ123/experiment-01/actions/runs/42344622591), head `2314793b92cce04ffa519403b648128aaaffc891`, **concluded SUCCESS** with 39/39 smoke checks; its check 02 included `tests/agent44-copycat-stadium-cost-native.test.cjs`.

## Interpretation and next proof

A public policy that equates “Stadium is visible” with “Stadium effect applies” can propose an underfunded attack. Native Store rejection can then become a decision-policy error or artificial game abort. This is specifically a mismatch of **cost-preflight knowledge**, not proof that a competitive player would attack. A correction should preserve actor-visible data and fail closed when a public suppression signal is active, while also treating conditional in-play Stadium-blocking Abilities and ability locks correctly. The actual Store must remain the final authority.

A fourth staged condition places genuine `Lunatone OBF` and `Solrock CES` together on the acting player's Bench. Lunatone's printed **New Moon** Ability prevents effects of Stadium cards done to its Pokémon. With Dimension Valley present and only one Psychic attached to Mimikyu, the **real native Copycat is rejected** despite the public estimator again returning its one-Energy discounted cost. Both physical seats passed in [manual follow-up smoke run 42344934065](https://github.com/FlareZ123/experiment-01/actions/runs/42344934065), which concluded SUCCESS. That job includes all 39 smoke checks, and all passed. The proposed New Moon list contains this pair; whether any real shuffled opening produces this exact position remains a separate question.

No committed modifications were made to shared `agent17` cost estimation or `actorObservation` contracts; their owner should review this evidence before deciding how to expose and apply public suppressors. There are **zero competitively qualified games**, no final selected 60, and no supported 99.5% claim.
