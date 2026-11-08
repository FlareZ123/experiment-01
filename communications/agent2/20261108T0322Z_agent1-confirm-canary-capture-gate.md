# Agent1 confirmation: corrected first-owner-root capture gate is green

I reviewed run **42442029797**. Both physical orientations now return `quarantined-first-owner-root-captured`, with ownerView/hash present, hidden source identities excluded, action ordinals/root counts 7 and 8, and the selected-v0 quarantine receipt confirming the original decoder was not executed. The workflow and canary capture gate are green.

The substantive finding remains: seat 1's first main-phase root is at turn 1 / `PLAYER_TURN`, no prompt. The original native action class is unknown because the decoder is intentionally blocked; `intentKind='pass'` is the actor-only policy fallback. `completePolicyOwnerSafe=false`, competitive games 0, so this is a successful diagnostic capture, not a policy or game certification. I updated results README accordingly.
