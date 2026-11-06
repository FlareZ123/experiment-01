# Agent 2: fail-closed paid-retreat wrapper-activation pure regression

**6 November 2026 | developmental policy integrity, not a gameplay test.**

## Question

The historical v9 A/B/A runner requested a paid-retreat treatment, but the real `scopedRoot` predicate omitted the v1 opt-in flag and returned an empty wrapper configuration. Thus v9 B actually ran the control A. Can the current shared v1/v2 option-selection boundary detect that mistake before a costly new native trial?

## Reproduction and method

The currently exported `actorPaidRetreatRootOptions` and `paidRetreatRootWrapperActivationReceipt` are called directly from the current `simulation/evaluation/agent41-bilateral-v2-development.cjs`, which also invokes the receipt in its live trial loop and preserves it on returned/error rows.

Added `tests/agent2-paid-retreat-root-wrapper-activation.test.cjs`, asserting all of the following cases:

- A control, with no paid-retreat option, correctly reports no opt-in and no wrapper selected.
- B with v1 paid-retreat flag, corresponding typed policy option and live `scopedRoot.root` function records an activated wrapper.
- B with the same paid-retreat flag and missing live `scopedRoot.root` fails closed instead of reporting a success.
- Missing/mismatched v1 root options, missing bilateral actor-only composition and mismatched registered target turn fail closed.
- V2 B with corresponding versioned option and live wrapper records activation; an accidental v1-only option fails closed.

The regression is incorporated into the pre-existing **manual-only** `.github/workflows/agent2-original29-fss-collision-pure.yml`. The exact current-source regression completed successfully on [CI 42281265590](https://github.com/FlareZ123/experiment-01/actions/runs/42281265590), checkout `a68920ac33ba447ebd1e1400acafe872c4db5103`. This job also reran the 309/309 source Pokémon printing resolver regression.

## What it establishes

The current option receipt rejects the historical shape of missing wrapper or wrong-selector configuration in direct pure tests. This avoids silently treating a registered opt-in or an option object as proof that a root wrapper was installed. It also verifies that the currently exported v1/v2 API names are the names used by the source.

**Important limit:** These are direct test calls against shared functions, not a paid retreat executed through a live Twinleaf root Store. The result cannot prove a real Store-accepted RetreatAction, an active v2 chooser in a frozen B run, physical Energy payment, the promoted attacker, meaningful opponent response or any win-rate gain. A 240-root prospectively registered full native successor with an exact physical root Store/ordinal join and non-null first B divergence remains required by the 6 November Critic contract.

## Adjacent evidence

- [Corrected Agent20 historical v9 audit](agent20-v9-paid-retreat-aba-audit-20261106.md), demonstrating **NO TREATMENT APPLIED / A=B=A-REPEAT**.
- [Updated common-policy acceptance packet](agent36-issue25-acceptance-packet-20261106.md), retaining v8 for development and competitive admission FAIL.
- [Critic's actual-wrapper activation contract](../../communications/broadcast/2026-11/20261106T162100Z_critic_v9_wrapper_activation_and_experiment_contract.md).

No selected final fixed 60; 29 original source name/count lists; zero paper-qualified competitive games; no demonstrated 99.5% win rate.
