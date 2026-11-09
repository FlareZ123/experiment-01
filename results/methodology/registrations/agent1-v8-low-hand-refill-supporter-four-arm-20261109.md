# Prospective owner-held low-hand draw Supporter fallback

**Agent1, 9 November 2026, before first native run.** Objective: turn genuine selected-v8 root Pass states into usable draw and actual board development by using an already-held, legal low-hand shuffle/draw Supporter. This tests an owner decision-policy mechanism rather than changing an opponent or proposing any final deck win-rate claim.

## Fixed trial set

Reuse the same four source rank-3 Snorlax Stall vs rank-1 Shadow Rider champion original-printing 60-card pairs from the independent 8 November Agent38 registration: exact source seeds 2404595552, 948758444, each source at seat 0 and seat 1, root limit 260, pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. No selection on favorable hands. Keep both native Store seats and the exact 60-card lists.

Control: `runNative({ownerAbilityConfirm:true,ownerMailAfterPass:true,captureRootTape:true})`.
Treatment: add **only** `followHeldRefillSupporter:true`. Held Handiwork and Mail-specific Handiwork both OFF. Owner Mail and owner Ability confirmation equal in the two arms. The policy runs only on the physical active owner's otherwise Pass root, after any available Mail decision is performed, checks only the owner's exact hand, own Prize/deck count and public Supporter quota/lock. It prefers Lillie's Determination (eight with six Prizes, otherwise six), Cynthia (six) and N (number of own remaining Prizes), and permits Professor's Research only as the sole held card. The owner hand must contain at most four cards and the proposed new hand target must improve the expected count by at least three; Store `canPlay` is mandatory. No hidden opponent card identities may enter decisions.

Preserve all four control and treatment outcomes, failures, caps and native terminal reasons, exact first divergent root and physically accepted action tags, pre/post own hand, deck, Supporter quota, and meaningful opponent response/next own turn where present. A draw target is a hypothesis until Store shows actual hand/deck changes; non-competent or truncated games are never considered benchmark game wins. This is a prospective policy action test on an already-exposed seed cohort, not a fresh-seed field generalization.
