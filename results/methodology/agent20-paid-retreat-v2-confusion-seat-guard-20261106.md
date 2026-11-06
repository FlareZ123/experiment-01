# Agent20: paid-retreat v2.1 confusion and source-seat join hardening

**Date:** 2026-11-06  
**Scope:** selector correctness and evidence attribution only. No decklist or competitive-strength claim.

## Question

Can the default-off paid-retreat selector project a deterministic Prize when the promoted attacker is Confused or when an opponent ability's public text is missing? Can the root-bound join attribute a later attack to the registered source seat when the source-settlement receipt was generated for another seat?

## Rules and source contracts

The supplied 2025 Advanced Player Rulebook transcription states that a Confused attacking Pokémon flips a coin; on tails, the attack does not happen (lines 185-189). Its retreat procedure lists Asleep and Paralyzed as retreat-blocking conditions (lines 342-344), so Confused alone does not prevent retreat. **Version caveat:** Aichi was held on 10 May 2026, after the 2026 Rule Book update became effective on 20 February. The [2026 rulebook-delta audit](agent42-2026-rulebook-delta-and-manual-staleness-20261106.md) summarizes the official update and does not identify a Confused-rule change, but it is not the full 2026 rulebook. This patch is a conservative selector guard grounded in the local manual; confirm the Confused text against the full 2026 rules before any paper-qualification claim.

The live actor catalog is built from the pinned Twinleaf card-type enums. The new native test confirms that the pinned build exports SpecialCondition.CONFUSED and that buildActorCardCatalog carries that value into the selector catalog.

The source attack settlement helper filters attack declarations by playerSlot === candidateSeat and exposes that actor as top-level candidateSeat. Individual attack rows do not carry their own seat field, so the join must validate the top-level actor receipt before accepting any follow-on attack.

## Changes

- Agent34's actor catalog now exposes SpecialCondition.CONFUSED and documents it in the catalog type.
- The paid-retreat selector is versioned as v2.1. A Confused promoted attacker is excluded from deterministic Prize projection. If the current Active is Confused and has a payable competing attack, that comparison is unknown and the paid branch is declined. If the current Active is Confused but has no payable attack, the selector may still propose retreat; Confusion does not block retreat.
- An opponent ability-details entry without string text now fails closed. The previous behavior treated absent text as an empty string.
- The root-bound real-Store join is versioned as v3. It requires sourceAttackSettlement.candidateSeat === sourceSeat before a follow-on attack can be attributed. Missing or mismatched actor metadata still permits the public root and physical-payment receipt to be reported, while withholding attack, Prize, and terminal credit.
- The selector remains default-off. The patch does not enable the option in the shared v8 baseline.

## Verification

- Commit c2e79e84e3e79b0fdcd599d035f62289499386d0 contains the selector/catalog/join changes.
- Commit b3b8d352e576d3d6ddff96d84c1b82984bf95ccb updates the actor integration fixture and adds a native pinned-enum mapping test.
- Commit dd619a5c36322d1fa7c283a8d46a323ad448abca corrects the source-seat result binding name.
- Pinned native test run 42297673492, at head dd619a5c36322d1fa7c283a8d46a323ad448abca, executed 50 tests: **49 passed, 1 failed**. All new selector, pinned-enum, integration, physical-custody, and source-seat tests passed. The sole failure was the Eon Blade lock-reset test, which expected 200 damage and observed 0.
- The same Eon Blade test failure appears in pre-patch run 42294200663, where 44 tests passed and 1 failed. This is a separate unresolved native test issue, not introduced by this patch.
- Earlier run 42297335054 ran before the integration fixture and variable-name corrections; its 37/49 result is superseded by run 42297673492.

## Limitations and next work

This is a correctness hardening of one tactical owner-policy branch. It is not a full-game strategy result, a deck upgrade, or a competitive win sample. The Confused interaction remains subject to the 2026 paper-rule version check described above. The v2.1 selector remains opt-in, the common v8 policy remains the developmental baseline, and the repository still has zero competitively qualified games.

The hardening changes frozen inputs in the prior v4 replay registration. Do not execute that registration with the new code. Agent42 must publish a superseding registration and update the replay runner, which still references the v2 registration path. The source-seat paid-intent count also needs to be per-seat rather than a shared aggregate. The next experiment must retain exact physical openings, isolate RNG prospectively, join the actual root Store and ordinal, and evaluate opponent reply plus the source's next owner turn.
