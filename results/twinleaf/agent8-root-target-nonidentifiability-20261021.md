# Accepted action labels cannot certify identical physical decisions

**Agent 8 | 21 October 2026 UTC | read-only implementation audit and independently archived native counterexample.** This finding concerns the strength of evidence. It is neither a new simulated game nor evidence that any fixed deck has gained competitive strength.

## Exact information-loss mechanism

The canonical `simulation/twinleaf/headless.cjs`, near the `rootActionLedger.push` block, stores an accepted root's ordinal, before/after turn, player slot, action class, prompt lineage, played card label, and selected ability/attack labels. It deliberately does **not** retain the accepted `PlayCardAction.target` geometry (`player`, `slot`, `index`), despite that action carrying a target when dispatched into the genuine Store. A `RetreatAction` target is similarly absent from the compact root ledger, although other selective evidence channels may capture its transition.

Consequently the projection from real decisions to root labels is **many-to-one**. Two plays of the same visible Darkness Energy from the same hand on the same turn and physical player can share every field of the compact archived root, yet one targets the Active Garbodor and the other targets Benched Crobat V. A SHA-256 digest of those compact labels cannot distinguish them. This is a representational limitation rather than a hash collision.

The helper `simulation/evaluation/action-ledger-first-observable-difference.cjs` already documents that its selective decision rows omit some recipients and chosen action details. It can correctly find represented prompt-card and retreat choices, but it cannot recover Energy targets that were never recorded in its input.

## Real native counterexample and consequence

[Agent 50's native rank11 source-first paired experiment](../aichi-2026/agent50-guzma-energy-staging-native-reversal-20261021.md) held the published source 60, New Moon 60, seed 482443328, physical players and genuine Store fixed. The source-only actor Energy recipient changed at **T7 root49** and **T9 root64**: control chose Active Garbodor BKP; treatment chose Benched Crobat V DAA. Original root action **labels** remained indistinguishable through root143, with the first different *recorded label* only at **T29 root144**. Nonetheless the changed target decisions were Store accepted, produced later settled attacks and reversed the native terminal from candidate win to source win. Full paired run [39691152188](https://github.com/FlareZ123/experiment-01/actions/runs/39691152188), archived detailed physical evidence in its artifact 12388702681.

This directly disproves the general inference that a long equal root-label prefix implies unchanged physical play. The equal labels are still useful for detecting changes in card names, action classes and turns; their evidential scope is narrower than action identity.

## Safe protocol improvement

A versioned, **opt-in** accepted-action target witness should be recorded immediately around genuine `Store.dispatch`, with the authorized actor action's `PlayCardAction.target` enum triplet and `RetreatAction.benchIndex`. Include the actual Store acceptance status and resulting publicly observable board destination. Capture only owner-declared public geometry; never serialize native PokémonCardList objects, hidden deck search contents, card instance IDs, or opponent concealed zones to a policy-facing observation.

Record this in a new sidecar/extension protocol such as `actual-store-root-declared-target-v1`, leaving the established `rootActionLedgerProtocol: actual-store-root-action-ledger-v1` and its old SHA fingerprints unchanged. Require paired comparisons to report which protocol each arm actually carries. Prefer a **first physically distinct accepted action** index over the first different label, with an explicit `target-unobserved` status when the chosen action's geometry is missing. Restrict claims of noninterference to the fields actually witnessed. A same-deal comparison against the existing Agent50 two-arm archived experiment is an especially discriminating regression because its earliest physical target divergence is known.

The experiment remains single-seed, retrospectively selected and policy-dependent. There are zero competitively qualified field games and no demonstrated 99.5% fixed-60 win rate.

## Implementation status

The diagnosis and native counterexample have been verified against the current headless root-row construction and the published native result. No new target-bearing recorder has been merged in this report. A separate opt-in implementation should receive a regression for both *equal labels/different targets* and *identical accepted targets*, compiled Store confirmation, and a noninterference check proving that legacy v1 root digests remain byte-identical.
