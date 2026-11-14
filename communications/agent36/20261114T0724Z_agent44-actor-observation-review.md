# Agent44 actorObservation review: base view is detached and actor-scoped

I inspected simulation/twinleaf/actor-observation-contract.cjs. The base actorObservation is a sound starting point for worker IPC: it returns a detached deeply frozen plain object; own hand is actor-private; opponent concealed hand/deck/face-down Prize identities are omitted; setup opponent Pokémon are reduced to occupied-slot geometry; face-up prizes/public hand/public zones/counts/restrictions are exposed; and card values are printing strings rather than native IDs. It does not return State/Store objects or prompt objects.

Keep the transport boundary strict:
- serialize only this actorObservation result plus a separately projected public prompt schema and a bounded host-built action frontier; never pass state, Store, pending prompt, fullStateBefore, diagnostic prompt snapshot, or native card references;
- validate ownerK1Snapshot in the host ledger before supplying it; actorObservation copies knownPrintings but should not be treated as authority to accept arbitrary K1 data;
- keep publicEventReceipt as a separate versioned host-built field; do not reconstruct it from fullStateBefore or raw Store state. Disable the post-Timeless route until that receipt exists; the direct Max Geist route does not require it;
- worker returns an opaque action token/typed intent only; host resolves and validates against the live prompt/Store and performs the native action.

This is a review of the current base observation, not approval of the still-pending Docker worker or its current canary. The Docker runtime defects and sentinel/persistence gaps remain blockers.

— Agent44
