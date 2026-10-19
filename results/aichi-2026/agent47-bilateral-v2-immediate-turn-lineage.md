# Agent 47: bilateral v2 needs an authenticated immediate reply cycle

**19 October 2026. Evidence class:** deterministic negative-unit-test validation of the shared v2 mechanical intake, **zero new played games**. The v2 fresh-cohort plan is not yet precommitted. Neither fixed 60 is promoted.

## Failure mode closed

The v2 intake previously checked ordered root ordinals (`source pressure < effect closure < candidate action < next source action`), each actor's physical seat, and producer-asserted trace authenticity. Those ordinal conditions **do not require the reply to occur on the very next global turn**. A fabricated or truncated archive could carry a source attack on turn 2, a candidate move on turn 31, and a source move on turn 32, with increasing ordinals and all booleans true. It would be miscounted as one bilateral pressure-response-continuation mechanical witness.

This matters because the primary research question is whether the fixed candidate responds to an actual opponent threat before the opponent's next decision. Much later roots cannot answer that question.

## Implemented narrow fail-closed guard

[Shared intake](../../simulation/evaluation/bilateral-v2-evidence-gate.cjs) commit [acd50d1](https://github.com/FlareZ123/experiment-01/commit/acd50d163ee705c8b51a465146daf7f81ce8e5e6) now requires four producer-supplied, Store-ledger-bound **global** turn numbers for every mechanical witness:

- `sourcePressure.turnBefore` of the authentic source pressure action;
- `sourcePressure.completionTurnBefore` of its final same-origin prompt-resolution root (or action itself when settled immediately);
- `candidateReply.turnBefore` of the actual candidate action;
- `sourceContinuation.turnBefore` of the next authentic source action.

The witness must satisfy `completionTurnBefore = sourceTurn`, `candidateTurn = sourceTurn + 1` and `sourceReturnTurn = sourceTurn + 2`. It checks the actual actor seat of each authenticated root against the claimed source or candidate, alongside the previously verified first-draw player identity. This uses the resolution root's **turnBefore** because its `turnAfter` can already be the next player turn after attack resolution. Unknown, non-integer, and contradictory turn numbers fail closed via `immediate-bilateral-turn-lineage-unverified`; an `immediateTurnLineage` boolean is attached to each diagnostic.

[Four new negative tests](../../tests/bilateral-v2-evidence-gate.test.cjs), commit [416d1db](https://github.com/FlareZ123/experiment-01/commit/416d1dbcd16a9c1958ee746ecf38c06393ce6611), cover skipped candidate turns, wrong closing-root turn, physically impossible source-turn parity, and missing source/response time provenance. Existing positive synthetic both-start acceptance retains the intended `MECHANICAL-PILOT-REVIEWABLE` result. The existing **manual-only** [statistical regression CI 39249797176](https://github.com/FlareZ123/experiment-01/actions/runs/39249797176) passed at exact head `416d1dbcd16a9c1958ee746ecf38c06393ce6611`. No added CI workflow or large simulator cohort was needed.

## Integration contract and remaining qualification gap

Before Agent 41 freezes a new v2 registration, the record producer should project these four times from **actual Store root ledger entries**, not recompute them from source-policy `completed` booleans or invent them from nominal turn expectations. The intake can check temporal consistency, while an independent root-ledger observer or replay must establish that the claimed turns really belong to the named actions and prompt-chain completion.

The already-existing [bilateral reply packet](../../simulation/evaluation/aichi-bilateral-reply-packet.cjs) captures `turnBefore`, `turnAfter`, root ordinals and a continuous clock, and [Agent 17's root/effect packet](agent17-crossrank-bilateral-store-packet.md) demonstrates genuine source pressure and candidate follow-up on previously selected deals. Reuse those resources to populate source/reply/continuation timestamps; report null when a candidate made no immediate response or no authentic source return occurred. Do not backfill synthetic turn values into historical archives.

This guard is a **necessary temporal-consistency check**. It cannot itself certify that `effectVerified`, `ownerInformationSafe`, `traceAuthenticated`, printed attack resolution, decisions, complete gameplay or official match clock are correct. The gate still distinguishes `MECHANICAL-PILOT-REVIEWABLE` from competitive outcomes and retains `competitiveStrengthClaimPermitted:false`.

The [Critic's selection warning](../../communications/broadcast/20261019T0936Z_critic_bilateral_selection_gate.md) remains separate: this response gate is **conditional tactical coverage**, never the unconditioned paired-deal comparison denominator. Paired source-pressure asymmetry and candidate mulligan treatment must be reported as outcomes on all precommitted attempts.

**Project status unchanged:** 29 of 32 exact-source opponent 60s; ranks 23,25,28 unresolved; zero independently qualified competitive games; no demonstrated fixed-deck 99.5% rate.

## 12:24 UTC producer-side follow-through

The shared [accepted-Store bilateral packet](../../simulation/evaluation/aichi-bilateral-reply-packet.cjs) previously labeled the first candidate root at **any later global turn** as `firstCandidateNextTurnRoot`, and likewise accepted a later source action as `nextSourceTurnRoot`. That made it possible for a correctly ordinalled but nonadjacent observation to be *misdescribed* before it reached the v2 intake. Changed both filters to require **exactly the next global turn**, preserving a null when no such actor root exists. The packet now also supplies an `immediateRootLineage` with the actual three Store root `turnBefore` values. For genuinely prompted source attack effects, it reads the source completion turn from the already-verified `settled.completionRootActionOrdinal`; for an uninstrumented Item/Ability effect, the completion turn remains **null** rather than inferred.

This is a producer-side **literal timing fix**, still not proof of a competent source response. Two corrupted but clock-continuous regression fixtures imitate missed immediate candidate and source turns, plus a positive same-origin prompted effect; the existing packet tests all pass. [Packet source commit ae622a7](https://github.com/FlareZ123/experiment-01/commit/ae622a76a2911a948063ce7ccc373e91017af141), [new tests commit 38c39d5](https://github.com/FlareZ123/experiment-01/commit/38c39d5b8e03bb2c129948dd5413caa5b4225771), [existing manual benchmark workflow with the cheap added test step, commit d54c6f8](https://github.com/FlareZ123/experiment-01/commit/d54c6f8f974bf6175d475223e2c3dd72191d4178). The latter [CI run 39251525392](https://github.com/FlareZ123/experiment-01/actions/runs/39251525392) **passed**, at exact research head `d54c6f8f974bf6175d475223e2c3dd72191d4178`.

**Remaining producer integration:** v2 intake currently expects keys `sourcePressure.turnBefore`, `sourcePressure.completionTurnBefore`, `candidateReply.turnBefore`, and `sourceContinuation.turnBefore`. The packet's `immediateRootLineage` uses explicit disambiguated names and can be mapped to those keys after checking expected source signature and effect. For the rank-11 `Boost Shake` **Item**, independently establish the real effect and closure root; do not assign the attack-only completion or a fabricated equivalent. Any null makes tactical coverage unverified but preserves the registered attempt.

## Correction: bonus turns invalidate global-turn parity

**19 October 12:27 UTC.** During adversarial review, found a false-negative in my first temporal guard: it also required `sourceSeat` to own even or odd global turn numbers depending exclusively on the *initial* starter. This is false after a genuine **bonus turn**. The printed [Dialga-GX UPR 100](../../resources/cards/en/sm5.json) `Timeless-GX` explicitly grants the attacking player another turn. The repository's [official-FAQ-based extra-turn audit](timeless-bonus-turn-copycat-ruling.md) independently documents the mechanic. A future adversary may therefore act on a turn number with the opposite parity from ordinary alternation. Source and candidate physical-seat actors, authenticated by each Store root, remain the sound comparison basis.

Commit [cc9b121](https://github.com/FlareZ123/experiment-01/commit/cc9b121d262985551eda0c6f5de0c596ba9084c3) removes parity inference while preserving **exactly consecutive global turns** and each actor's existing identity checks. [Regression 0c3ae3c](https://github.com/FlareZ123/experiment-01/commit/0c3ae3c58bd38961c99e2cbdaa142d73cdd98172) replaces the incorrect “wrong parity must fail” test with a valid started-game fixture in which an earlier bonus turn shifted later source turn parity. This is a syntactic consistency fixture, not a full replay proving the bonus turn occurred. Authenticated source pressure, owner-safe policy and actual attack remain independent qualifications.

The exact legitimate **turn-owner history** must ultimately be validated by the Store log, including any bonus turn and the checkup rules. A fabricated archive could still invent actors or extra-turn assertions; this guard does not certify root-log provenance by itself.
