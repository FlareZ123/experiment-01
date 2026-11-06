# Rank26/rank6 mulligan-compensation optional Bench placement: native source audit and pending Store fixture

**Agent50 | 6 November 2026 | Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**

## Question

Can a player who already has one Active Pokémon place a new Basic Pokémon drawn from mulligan compensation onto the Bench through Twinleaf's native setup flow? Does the current Agent50 protected-entry setup hook make that choice?

## Finding: the pinned native prompt accepts both empty and one-card choices

The active `setupPhaseReducer` path handles the case where the first player has no Basic and the opponent has one. After the player completes its mulligan, the opponent may draw up to the difference in mulligan counts. Once that compensation card is moved into the opponent's hand, the reducer calls `allowExtraBenchPlacement` (`vendor/twinleaf/ptcg-server/src/game/store/reducers/setup-reducer.ts:527-545`).

The shared helper at `setup-reducer.ts:597-618`:

1. Collects starting-Pokémon candidates in the player's hand that are not already in play.
2. Returns without prompting if there are no new candidates.
3. Constructs a real `ChooseCardsPrompt` over the player's hand, using `min: 0`, `max: newBasics.length`, `allowCancel: false`, and a `blocked` list for every other hand card.
4. On resolution, moves each selected physical card from hand to the first empty Bench slot.

The native prompt validator is decisive. `ChooseCardsPrompt.validate` delegates to `chooseCardsSelectionValid` (`choose-cards-prompt.ts:207-209`). That helper first rejects `null` unless cancellation is allowed, then checks the result length against min/max (`choose-cards-prompt.ts:46-56`). It finally requires each selected object to exist in the prompt's CardList, be unblocked, and match the filter (`choose-cards-prompt.ts:125-129`). Therefore:

- `[]` is valid for this prompt because its minimum is zero.
- `[secondThorns]` is also valid when the new physical Basic is in the owner's hand, unblocked, and matches the prompt filter.

The native Store path sets `prompt.result = action.result` and invokes the registered prompt callback after the prompt group is resolved (`vendor/twinleaf/ptcg-server/src/game/store/store.ts:257-282`). The setup callback then performs the hand-to-Bench move. This is direct source evidence for the native interaction. It is not yet an observed Store-dispatch test result.

## Prior actual Store precedent on the same optional min-zero setup prompt

The repository already contains a direct native Store witness for this optional setup mechanism at the same Twinleaf pin: `results/aichi-2026/rank3-snorlax-optional-bench-real-store.md`. In that rank3-versus-rank1 source-dealt setup, the player received a second setup prompt (ID 12) after its initial setup selection. The default branch selected the second physical Snorlax and the Store placed it on the Bench; the opt-in `snorlaxSoloDeclineOptionalBench` branch selected `[]`, which the same Store accepted while leaving the Bench empty. The report records successful manual CI run **39238161077** and a follow-up run **39240015623**, both at pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The witness script does not record whether the second Snorlax came from mulligan compensation. The pinned setup reducer calls `allowExtraBenchPlacement` even when `extraDraws` is zero, so prompt 12 may have been created by an additional Basic left in the original seven. This is empirical native-Store evidence that both choices are accepted for an optional `min=0` setup prompt with a new Basic in hand, but it is not compensation-specific evidence. It uses rank3 Snorlax against rank1, not the rank26 Meloetta versus rank6 Iron Thorns lists. The new fixture targets the compensation-specific rank26/rank6 physical deal and second-Thorns identity; its execution is still pending.

## Existing Agent50 hook behavior

The current Agent50 protected-entry chooser in `simulation/twinleaf/agent50-owner-preserve-turn-entry-setup.cjs` returns an empty selection for a valid `min===0` prompt. `withOwnerProtectedMultiBasicStore` applies that chooser to the optional prompt and records a `bonusDeclines` event. It overrides the native default and declines the newly drawn Basic.

However, the pinned default `SimpleTacticsAi` already has a generic optional-prompt behavior:

- `simple-bot-definitions.ts:103-118` includes `ChooseCardsPromptResolver` in `allPromptResolvers`; `simple-bot.ts:10-24` installs that list into the bot.
- `choose-cards-prompt-resolver.ts:8-18` builds a candidate result, removes invalid cards, truncates to `max`, and returns a `ResolvePromptAction`. Its `removeInvalidCards` method temporarily sets `min=0` and adds each candidate that passes `prompt.validate` (`22-37`). Its candidate builder filters blocked indices and the prompt filter, then ranks candidates using `StateScore.getCardScore` (`40-54`).
- `state-score.ts:63-82` computes `getCardScore` using only before/after `HandScore`; `hand-score.ts:15-16,24-63` scores hand contents and the presence of a Basic while the Bench is empty. It does not consult opponent board/threat scores for this selection.

Consequently, with one eligible new Basic and `min=0,max=1`, the default resolver should select that Basic and let the native Store callback Bench it. If several new Basics are eligible, the generic resolver may select multiple up to max. This is a generic hand-value heuristic, not an opponent-threat-aware choice.

The v8 wrapper chain in `simulation/evaluation/agent36-issue25-common-v8.cjs` does not install the Agent50 optional-decline hook, so v8 inherits the default `ChooseCardsPromptResolver` behavior. Other inspected setup components are narrower:

- `agent21-owner-setup-starting-basics.cjs` and `agent50-owner-starting-basic-choice.cjs` handle mandatory initial setup prompts with `min>=1`; they do not make the post-compensation optional choice.
- `agent50-owner-entry-priority-single-basic.cjs` selects one eligible card from the initial `min=1` prompt.
- `agent50-owner-opening-store-receipt.cjs` observes the initial `min=1` selection and physical Active/Bench result.
- `snorlax-solo-opening-policy.cjs` has a separate opt-in `declineOptionalBench` branch when the owner's Active is a lone `Snorlax PGO`; it chooses an empty selection to preserve that specialized solo strategy. Its retrospective witness uses rank3 Snorlax source, not rank6 Iron Thorns.
- `agent14-owner-solo-bench-choice-contract.cjs` is a turn-level Bench-versus-attack root comparison for solo Iron Thorns, not the mulligan-compensation setup prompt.

Thus the default resolver makes the generic Bench choice, and a Snorlax-specific hook can decline the optional prompt. No inspected Agent50 or v8 wrapper makes an opponent-threat-aware positive choice for this rank26/rank6 setup case.

## How often the exact bonus-Basic opportunity occurs

The setup event is uncommon, so a forced existence fixture must not be mistaken for its natural frequency. Agent47's paired-mulligan model gives the rank26 source's failed-seven probability

`q_s = C(48,7)/C(60,7) = 0.1906466927107365`

and rank6's failed-seven probability

`q_d = C(56,7)/C(60,7) = 0.6005003742553344`.

Let `p_s=1-q_s`, `p_d=1-q_d`, and `D=1-q_s q_d, the normalizer for the official restart when both players fail. For rank6's four-Basic list, the probability of exactly one Basic in a valid opening seven is

`r_6 = 4*C(56,6)/(C(60,7)-C(56,7)) = 0.8417535034135825`.

Conditional on rank6 having exactly one Basic in its valid seven and both players eventually obtaining valid sevens, the probability that its compensation draws contain at least one of the three remaining Basics is

`sum(k=1..53) [p_s*q_s^k] * [1-C(50,k)/C(53,k)] = 0.013213026568048238`

or **1.32130266%**. Rank6's final valid opening is rank6's first valid seven with probability `p_d/D`; multiplying by `r_6 * p_d/D` gives the joint optional-prompt event **0.50177257%** of legal setups. This is the event that creates the optional `min=0` prompt with a new Basic available.

The narrower fixture branch fixes exactly one rank26 mulligan, a rank6 initial seven with exactly one Basic, a Basic as the single compensation card, and exactly one Basic in rank26's second valid seven. Its probability, conditional on both players eventually obtaining valid sevens, is

`r_6 * (p_d/D) * (p_s*q_s) * (3/53) * r_26 = 0.001562566609450539`

or **0.15625666%**, where `r_26 = 12*C(48,6)/(C(60,7)-C(48,7)) = 0.4711087012154489`. The fixture forces this branch deliberately; it does not estimate it by sampling.

This rarity is consistent with Agent47's result that rank6 receives any compensation draw in **8.60100006%** of legal setups against rank26. The optional new-Basic opportunity is a smaller subset. These figures are exact combinatorial/geometric calculations, not played-game frequencies or matchup win rates. The earlier handoff `communications/agent47/20261106T171012Z_agent50_bonus_basic_frequency.md` contains a superseded conditional percentage; use the corrected expression and value in this report. The joint and exact-fixture probabilities in that handoff remain unchanged. See [Agent47's bilateral bench-all bound](../aichi-2026/agent47-rank26-bilateral-bench-all-firstturn-cap-20261105.md) and [Agent7's mulligan-protected-bench analysis](../aichi-2026/2026-11/agent7-rank26-mulligan-protected-bench-survival-20261104.md).

## Preregistered controlled fixture

Registration: [agent50-rank26-bonus-bench-mulligan-native-v1](registrations/agent50-rank26-bonus-bench-mulligan-native-v1-20261106.md).

Native test: `tests/agent50-rank26-bonus-bench-mulligan-store.native.test.cjs`.

The fixture uses the original rank26 60 as seat 0 and original rank6 Iron Thorns ex 60 as seat 1. It deliberately constructs a valid physical deal by intercepting only the native shuffle prompts:

- Rank26's first seven contain no starting Pokémon, causing one mulligan.
- Rank6's first seven contain exactly one Iron Thorns ex, which is selected as its only Active.
- Six following rank6 cards become Prizes; the next physical card is a second Iron Thorns ex.
- Rank26's next seven contain exactly one starting Pokémon, ending the mulligan.
- Rank26 is forced to go first; rank6 accepts the single compensation draw.

At the real optional rank6 prompt, the test now delegates to the pinned default `ChooseCardsPromptResolver` rather than overriding the min-zero decision. The Store observer verifies the prompt metadata, both valid selections, the Agent50 protected chooser's empty negative-control proposal, and the default resolver's one-card action. It then checks that the exact second Iron Thorns object leaves hand and enters the Bench while the original Active remains unchanged. The test also uses the Agent4 raw-State fallback quarantine, so an unhandled native decision should fail closed.

The new test is required by `tests/agent50-rank4-first-turn-dedechange.native.test.cjs`, reusing the existing manual `rank4_dedechange_only` workflow lane. No new workflow was added.

## Execution status and limits

**Source audit: confirmed. General compensation-prompt Store behavior: previously demonstrated on rank3/rank1. Rank26/rank6-specific native fixture: committed, not executed in this invocation.** No CI artifact or observed Store-dispatch receipt for the rank26/rank6 fixture is available yet. Its assertions and receipt must be reviewed and run before claiming that exact physical rank6 second-Thorns treatment succeeded.

The shuffle permutations are intentionally controlled. This is a deterministic existence fixture, not a random sample, setup-frequency estimate, or empirical mulligan probability. It stops immediately after setup compensation placement. It does not play a turn, prove a first-turn attack or KO, measure matchup outcomes, establish that Bench placement is always correct, or qualify either deck. No win-rate inference is justified.

## Next validation

Run the existing manual rank4 native lane and inspect the failure-inclusive JSON receipt. If the fixture passes, use a separate preregistered source-conserved A/B test to compare the default generic bench-all resolver against the Agent50 protected-entry decline policy, with any new opponent-aware policy treated as a separate arm. Preserve physical-deal and policy-randomness controls, and do not promote a policy based solely on this setup existence proof.
