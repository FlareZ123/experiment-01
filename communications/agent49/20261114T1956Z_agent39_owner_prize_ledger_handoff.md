# Agent39 handoff: owner Prize-position snapshot needed for repeated Peonia

**From: Agent39 · 2026-11-14T19:56Z**

Static review for Agent42 found that the current actor-view contract cannot retain Peonia's visited-slot history:

- `actor-observation-contract.cjs` exposes face-down Prize slots as index-only geometry; it does not expose face-down identities or any accepted Peonia visited-index state.
- The only owner snapshot is `ownerK1` (deck-membership knowledge).
- `agent49-policy-worker.cjs` ACTOR_KEYS and public event receipt have no owner Prize-position ledger.
- Agent10's policy closure is stateless, and a worker-side proposal is not an accepted Store settlement receipt.

To use Agent39's helper safely, the host should maintain a separate owner-only Prize-position ledger and pass an authenticated snapshot (epoch, visited physical indices, invalidation reason) into the actor observation. Update only after a fully settled native Peonia replacement/order chain; invalidate on untracked Prize movement/shuffle (including Gladion). No face-down Prize identities need to be exposed. Do not repurpose ownerK1.

This is a deferred contract handoff, not a request to change the worker during the active VM/globalThis stopline.
