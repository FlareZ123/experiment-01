# Agent50: original-rank-4 Dedechange v2 resolves the fourth setup arm

**6 November 2026 | frozen four-arm follow-up | native Store development evidence only.** This follow-up completes the missing setup prompt in the earlier retrospective rank-4 Dedechange fixture. It preserves the exact four source physical deals and source/candidate 60-card inventories registered in v1. It does not estimate natural opportunity frequency or matchup performance.

## Registration and execution

- Preregistration: [owner-SelectPrompt v2 continuation](registrations/agent50-rank4-first-turn-dedechange-select-v2-20261105.md), committed before the v2 code and execution.
- Original v1 cohort and physical hand fingerprints: [v1 report](agent50-original4-firstturn-dedechange-20261105.md).
- Source: original Aichi rank 4 printed 60, SHA-256 `3f82c3a7c43d62979ea2196b74bffd22fc51d6e7cc11cc27be9daad10d02b423`.
- Reference: original Aichi rank 1 printed 60, SHA-256 `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`.
- Frozen engine: Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- The only v2 addition was the existing owner-only detached `SelectPrompt` adapter from `simulation/twinleaf/agent8-actor-only-select-prompt.cjs`, installed inside the existing raw-State fallback quarantine and before source turn decisions. It resolves the actual answering owner's offered options by the adapter's existing first-option policy. It does not inspect hidden state or replace the native Store.
- Executed through existing manual workflow `agent50-rank26-koko-dual-recipient-native.yml`, input `rank4_dedechange_select_v2_only=true`; no new workflow was added.
- Workflow [42104904628](https://github.com/FlareZ123/experiment-01/actions/runs/42104904628), commit `d9b9130d02fcaace18486d32b51487d9bd90703a`, completed successfully. Artifact [13450703868](https://github.com/FlareZ123/experiment-01/actions/runs/42104904628/artifacts/13450703868), ZIP SHA-256 `f895837a3e6ee3d993f06f6f8eb92bb6a26299636abb518cdbd31e1d85ec574b`. The downloaded ZIP digest matched the GitHub artifact digest. All four JSON files matched their archived SHA-256 sidecars.

## Frozen arm outcomes

| Source seat | Seed | Initial selected Active | Eligible entry-support Basics left in hand | Dedenne physically Benched | Dedechange confirmed | Physical draw |
| ---: | ---: | --- | --- | --- | --- | ---: |
| 0 | 20261123 | Gengar & Mimikyu-GX TEU | Tapu Lele-GX GRI; Dedenne-GX UNB | Yes | Yes | 6 |
| 1 | 20261125 | Squawkabilly ex PAL | Eldegoss V RCL; Dedenne-GX UNB | Yes | Yes | 6 |
| 1 | 20261129 | Gengar & Mimikyu-GX TEU | Crobat V DAA; Dedenne-GX UNB | Yes | Yes | 6 |
| 1 | 20261132 | Pikachu LOR | Dedenne-GX UNB | Yes | Yes | 6 |

**Primary result: 4/4** frozen arms reached the rank-4 source turn, physically moved the original Dedenne-GX UNB from that owner's hand to that owner's Bench, accepted the genuine printed Ability confirmation, and drew six actual cards from that owner's deck. The fourth arm previously stopped at a reference-seat setup `SelectPrompt`. V2 recorded exactly one actor-only selection there: seat 0, global turn 0, phase 1, message `WANT_TO_DRAW_CARDS`, two offered options, option index 0 selected. The prompt settled and the source seat 1 subsequently completed its Dedechange.

The pinned Twinleaf [setup reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts#L199-L225) constructs the one-card compensation choices as `Draw 1 card(s)` then `Draw 0 card(s)`, with `defaultValue: 0`; index 0 therefore selects the one-card draw. The v2 artifact records the prompt owner, option count, and selected index, but it does not preserve the reference player's before/after deck and hand counts, so it does not independently quantify that compensation's physical movement. The later [32-deal follow-up](agent50-rank4-dedechange-natural32-sourcefirst-20261106.md) adds a Store-level physical receipt and verifies every compensation draw.

In the seed-20261125 arm, five of the six original Dedechange payment cards entered the owner's discard and the original Ditto Prism Star LOT entered the owner's Lost Zone through its replacement rule. The other three arms moved all six original hand cards to discard. Each arm's hand count returned to six after drawing six; these receipts do not establish a net strategic gain from the Ability.

## Failure-inclusive status and limits

All four rows subsequently stopped at the same fail-closed boundary: `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED`, source seat 1, global turn 1, phase 2, before the next unsupported owner root. The original native raw-State decoder executed zero times. There was no opponent continuation, attack, Prize transition, terminal game, or competitive qualification.

This was a deliberately frozen, retrospective four-case continuation. The seeds were selected from earlier known-positive opening receipts; the source was given a controlled first-player choice in all four arms. The 4/4 result is a conditional implementation witness, not an estimate of Dedechange opportunity frequency or a causal policy-strength result. Dedechange consumed the full six-card original hand in every arm, including Trainers and other possible entry support. The desirability of that exchange depends on hand quality, remaining deck, board threat, and later opponent play, none of which this experiment evaluates.

## Next useful test

A decision-relevant follow-up needs a preregistered natural source-deal cohort with no-opportunity and blocked rows retained, matched physical deals, and at least three arms: the default owner-visible policy, Dedechange when offered, and a hand-preserving alternative. Compare actual later source actions and adversarial opponent responses under one frozen policy. Do not promote the hook from these setup-only receipts.

**Benchmark unchanged:** 29/32 authenticated original Aichi 60-card inventories, zero competitively qualified full games, no selected final 60, and no demonstrated 99.5% field win rate.
