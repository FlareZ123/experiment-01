# Agent 1: Guzma & Hala CEC exact physical discard and Prism Star destination

**Date:** 4 November 2026. **Status:** pinned-native component proof, default-off, **zero qualified games**.

## Question and relevant original-source context

The previous G&H paper-payment guard incremented acceptedPayments after checking two distinct prompt objects existed in the owner hand. That pre-Store test was useful for rejecting an empty or one-card answer, but it did not establish that the two selected physical cards moved into their paper-required destinations.

The uploaded English card database gives **Guzma & Hala CEC** (Cosmic Eclipse 193/229) an optional two-other-card discard to add Tool and Special Energy searches to its Stadium search. **Wondrous Labyrinth Prism Star TEU** (Team Up 158) has a Prism Star rule redirecting a would-be discard into the **Lost Zone**. Original ranks 6, 24 and 29 contain the relevant G&H and Prism choices according to [Agent 36's handoff](../../communications/agent1/20261104T0410Z_agent36_ghala_prism_payment_scope.md).

## Implemented boundary

- Expanded the existing default-off [agent1-ghala-paper-payment-guard.cjs](../../simulation/twinleaf/agent1-ghala-paper-payment-guard.cjs) while preserving its withGuard(run) entry point.
- Before Store: require G&H source stamp and CHOOSE_CARD_TO_DISCARD prompt with exact min/max 2, two distinct owner-hand physical objects also in prompt choices, excluding the played Supporter.
- After Store: record separate native prompt acceptance and exact physical custody. Each ordinary selected card must leave owner hand for owner discard. Each Prism Star selected card must leave owner hand for owner Lost Zone. The original object identity is preserved.
- The observer follows later Store dispatches if payment is delayed and distinguishes settled versus unresolved at the end. It never promotes a prompt acceptance alone into a paper-payment witness.
- The scope remains one payment boundary with paperQualifiedGames=0. This option is not selected in the common bilateral policy.

## Reproducible tests and observations

**Pin:** upstream twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. **Research head for native test:** ba32744e29fdbcc0fb5d1aa1ac3eebb02420b35e. **Manual compiled CI:** [run #41832522674](https://github.com/FlareZ123/experiment-01/actions/runs/41832522674), success.

- [Four isolated cases](../../tests/agent1-ghala-physical-custody.test.cjs) passed: both seats with ordinary and Prism costs, wrong Prism destination negative, deferred physical movement, and duplicate physical object pre-Store rejection.
- [Native guard tests](../../tests/agent1-ghala-paper-payment-guard.test.cjs) passed inside [the original optional-payment suite](../../tests/agent30-guzma-hala-optional-payment-native.test.cjs), nine suite tests passed. Both physical seats rejected 0/1 selected G&H enhanced cost cards and accepted two ordinary cards into owner discard.
- The [prepared native fixture option](../../simulation/twinleaf/agent30-guzma-hala-optional-payment-native.cjs) paid with actual Plumeria BUS and Wondrous Labyrinth Prism Star TEU physical card instances in both seats. Both native Store prompts completed without error. Receipts verified Plumeria in owner discard and Wondrous Labyrinth in owner Lost Zone, settledPhysicalPayments=1 and unresolvedPhysicalPayments=0 per seat.
- Both compiled and isolated tests used the existing manually dispatched [aichi-bunnelby-k0-action.yml](../../.github/workflows/aichi-bunnelby-k0-action.yml). No extra workflow was added.

## Limits and integration requirement

This is **actual pinned Store settlement for a prepared original-printing fixture**. It is not an exact shuffled original rank-6 game, an organically offered G&H branch, an action chosen by a selected owner-safe bilateral policy, or a completed qualified game. It does not certify G&H's entire text, prior shuffle, supporter quota, opponent response, overall paper legality, or game outcome.

[Issue #25](https://github.com/FlareZ123/experiment-01/issues/25) can consume this receipt in a frozen two-seat release, ideally with a natural original deal and meaningful continuation. The benchmark remains 29/32 authenticated original name/count inventories, no selected final fixed 60, zero competitively qualified games and no demonstrated 99.5% win rate.
