# Agent 50: compiled v6 two-world common-policy hidden-order replay

**Date:** 20 October 2026. **Engine pin:** Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. **Source head:** `b6d2029b26b343e40549df234cec00fdd6d86203`.

## Reproduction and evidence

Existing manually dispatched [CI 39369203035](https://github.com/FlareZ123/experiment-01/actions/runs/39369203035) completed successfully, with 87/87 tests passing and the source-dealt four-arm postgame probe completing. The archived [exact JSON artifact 12241285069](https://github.com/FlareZ123/experiment-01/actions/runs/39369203035/artifacts/12241285069) preserves each row and its `tacticScoreComparison`. The native compiled source and all control comparisons are on the cited head; no source gameplay modification was introduced by the postgame observers.

V6 encloses **each detached world's bot construction** inside an independent copy of the same common candidate policy. This corrects the prior V5 timing gap where Star Alchemy's constructor-installed tactic was missing from reconstructed bots. The two detached worlds use identical source State copies except the acting owner's private deck order, and fresh identically seeded policy randomness. They both evaluate only after the authentic game finishes. The four authentic control games' source actions, deals, and native transcripts remained unchanged (`samePlayback=true`, `noninterferenceVerified=true` in all four). Physical-start and policy context is retained in the artifact.

| Source rank, seat, fixed candidate | Actual / replay verdict | First divergent same-action score |
| --- | --- | --- |
| 6, actual candidate A, champion reference | **Fresh baseline veto**: actual Lillie's Determination `PlayCardAction`; fresh reconstructed bot proposes Pale Moon-GX `AttackAction` in both worlds | Lillie scoring -21 vs -17; cannot attribute actual choice |
| 6, actual candidate A, New Moon | **Baseline-matched score sensitivity**: actual and both fresh decisions are `PassTurnAction` | Unown Farewell Letter `UseAbilityAction` scores **50 vs 51** |
| 11, actual candidate B, champion reference | Baseline-matched negative on this root; no score sensitivity | None |
| 11, actual candidate B, New Moon | Baseline-matched negative on this root; no score sensitivity | None |

All sampled decision roots were global turn **3**. Rank 6 uses historical seed `407516727`, rank 11 seed `623585882`. For rank-6 New Moon, five of nine attempted native evaluations produced finite scores; replay produces nine in each world, five finite per world. Its actual Pass is recovered exactly. These are selected historical source-dealt roots; no independent random sample or competitive-win denominator was created.

**Meaning:** the full constructor-scoped common candidate policy still evaluates at least one identical declared candidate action differently when only the unseen physical deck order is reversed. It proves a local *score* information-boundary defect under the specified paired worlds. No observed action flip occurred in the baseline-matched arms. The rank-6 champion arm fails native-action parity and remains a hard inference veto. The exact owner-known top order or K1 deck knowledge at these roots was **not** authenticated; the difference is a sensitivity diagnostic, not proof that a particular physical player's legal knowledge was violated.

## A separate K0 building block (not integrated policy)

`simulation/twinleaf/owner-k0-draw-belief.cjs` consumes **only** the detached `actorObservation` contract and a registered exact-printing 60. It subtracts visible own cards from the 60 to obtain a card-multiplicity pool whose cardinality must equal `deckCount + prizeCount`. When the caller *explicitly certifies* full exchangeability of all unlocated cards across deck and face-down Prize positions, the next unknown draw has rational probability `remainingCopies / unknownTotal`. It refuses authenticated exact K1 membership, over-observed printings, mismatched physical totals, and missing premises. It is not wired into the bilateral policy, does not infer exchangeability from physical State, and cannot yet model revealed Prizes, known top deck, controlled shuffles or actions' state-dependent marginal utilities.

Local Node 22.16 tests of the isolated helper were **5/5 passed** (synthetic 60 and deliberate failure cases). The attempted GitHub creation of the companion regression file was blocked by the host's safety checks. Thus **no repository CI validation is claimed for this helper**. The code itself was committed separately; integrate and certify it only after review.

## Decision-critical next work

1. Compare identical actor-visible snapshot and true bot tactic history for the champion's physical Lillie versus reconstructed Pale Moon-GX to explain baseline mismatch, without treating reversed-deck artifacts as an actual decision flip.
2. Use Agent 23's whole-bot matched-visible opponent-hand witnesses and the strict actor-observation projection to develop a shared **two-player** decision policy. An owner K0/K1 belief ledger with explicit top-order knowledge is needed before any draw expectation can be trusted at live roots.
3. Keep rank-6 Pass and Agent 25's independently compiled Farewell Letter effect-resolution fixture as two distinct facts; joining roots requires actual State-prefix attestation.

**Field status remains 29/32 exact Top-32 60s, zero independently competitive-qualified games, no validated 99.5% performance.**
