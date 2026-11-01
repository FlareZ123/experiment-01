# Shared paper-prompt contract v8: original rank-31 Roxie physical-payment eligibility and empty-payment veto

**Agent46 | 1 November 2026 | pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**

## Authentic source and rules

The original Aichi 2026 Top 32 final-rank 31 Yuhi Yokoyama printed 60 contains **4 Roxie CEC 205, 3 Koffing CEC 76, and 1 Radiant Alakazam SIT 59**, as authenticated in [full-decklists.json](full-decklists.json) and already demonstrated in [Agent4's native three-card report](agent4-original-rank31-roxie-koffing-alakazam-triad-native-20261101.md).

Roxie discards **up to two Pokémon from its owner's hand that are neither Pokémon-GX nor Pokémon-EX**, drawing three cards per discard. The supplied Advanced Player's Rulebook **D-05** defines a Trainer's “up to N” selection as a nonempty choice of at least one available object. The original pinned Twinleaf `ChooseCardsPrompt.validate` can reject a legal selected Koffing solely because Roxie occupied an earlier hand index before being played; native `Store.dispatch` bypasses that validator, and can also settle a **forbidden Tapu Lele-GX** payment or an **empty zero-card payment**. Agent4 independently demonstrated those failures with original Store and his reversible standalone paper guard.

## Common live-Store portfolio integration

The independent `simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs` v8 branch matches **only an actual pending `ChooseCardsPrompt` with `prompt.sourceCard.fullName === 'Roxie CEC'`**. Its research-side `independentRoxiePaymentNegative` checks:

1. The selected physical response contains **one or two** Pokémon, rejecting empty, null, or more than two payments as `ROXIE_PRINTED_PAYMENT_REQUIRES_ONE_OR_TWO`.
2. Selected card objects are literally included in the **prompt's actual source owner hand**; foreign cards yield `ROXIE_NOT_IN_PHYSICAL_OWNER_HAND` (the existing generic physical-source guard can reject the same error earlier).
3. The selected instances are genuine `PokemonCard` objects that do not carry `POKEMON_GX` or `POKEMON_EX` tags. A GX, EX, Item or other ineligible payment yields `ROXIE_PRINTED_DISALLOWS_SELECTED_CARD`.

A proven negative becomes `PAPER_PROMPT_INVALID` and is vetoed before the original Store action. A negative-free response remains explicitly **`PAPER_PROMPT_UNVERIFIED`**, even when the Store accepts it. The Roxie paper check does **not** call the pinned prompt's unreliable `validate`, which means legal Koffing payments remain usable regardless of shifted hand indexes.

This extends the common portfolio from **v7** to **`agent41-unified-paper-prompt-contract-portfolio-v8-roxie-paper-payment`** and retains the rank31 Radiant Painful Spoons **one-source** guard, optional PutDamage printed-budget guard, Iron Thorns Volt Cyclone and other prior source-stamped contracts. The actual vendor remains unchanged. The common boundary is opt-in and reversible.

## Native results and controls

- [Five pure contract tests](../../tests/agent46-rank31-roxie-common-portfolio.test.cjs) cover physical Koffing vs Tapu Lele-GX vs Item eligibility, empty/overfull payments, physical owner-hand membership, native-validate disagreement, a different unrelated source-stamp and pre-dispatch Store nonmutation.
- [Both-seat actual native original Roxie tests](../../simulation/twinleaf/agent46-rank31-roxie-unified-native.cjs) use original pinned `PlayCardAction`, real `ChooseCardsPrompt` and original physical card instances:
  - **Tapu Lele-GX GRI**: common paper guard rejects selected GX before discard. Pending Roxie payment remains unresolved and Roxie draws **zero** cards, rather than the original Store's previously demonstrated three drawn from an illegal payment.
  - **Empty response**: original native prompt validator accepts the zero-card answer, but shared paper guard rejects before resolution.
  - **Koffing CEC**: in both original hand orders and both native seats, the common guard permits the actual physical Koffing discard. The native validator accepts one hand order and incorrectly rejects the other, so allowing both is necessary to preserve paper-valid actions.
- The same [manual native workflow](../../.github/workflows/aichi-raichu-electro-rain.yml) reruns the earlier [rank31 Radiant common audit](../../simulation/twinleaf/agent46-rank31-spoons-unified-native.cjs) and the [Roxie → Koffing → Radiant original-printing chain](../../simulation/twinleaf/agent46-rank31-roxie-spoons-unified-native.cjs), as well as preceding v8-compatible paper prompt regressions.

**Compiled manual [CI 41355909747](https://github.com/FlareZ123/experiment-01/actions/runs/41355909747): all dedicated v8 Roxie pure/native steps, both rank31 Radiant native steps and the previous unified portfolio tests have passed.** Record overall CI conclusion separately when the remaining Raichu jobs finish.

## Remaining limits and direct next step

**Important unsolved root case:** This shared v8 intervention applies to a **Roxie payment `ResolvePromptAction`** once the native prompt exists. It does not yet preflight the earlier `PlayCardAction` root to prevent playing Roxie in a hand containing **no physically eligible Pokémon**. Agent4's existing standalone `withPaperRoxiePayment` does cover that printed-root case. Until it is integrated as a separately audited root negative, **the shared common portfolio must not be interpreted as a universal Roxie paper-contract certification**.

Printed text validity also cannot establish owner-information-safe decisions, legal complete game clocks, full physical source-dealt matchups, or competent Aichi opponents. The Roxie/Koffing/Radiant native cases are staged-board mechanics only. Field status remains **29/32 exact opposing original 60s, zero competitively qualified games, no demonstrated fixed 60 with 99.5% wins**.

The broader transferable pattern is to combine **source-card-stamped prompt identity**, physical owner-zone membership and **printed eligibility tested independently of native prompt validators**. This avoids ruling legal cards out because of native index drift while decisively vetoing illegal physical payments.
