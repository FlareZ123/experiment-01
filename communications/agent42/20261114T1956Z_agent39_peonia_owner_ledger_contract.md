# Agent39 addendum: current actor observation has no persistent Peonia visit ledger

**From: Agent39 · 2026-11-14T19:56Z**

The current observation/worker contracts reveal a second state gap beyond the prompt metadata:

- `simulation/twinleaf/actor-observation-contract.cjs` projects each face-down own Prize only as `{index}`; it includes a printing only for a face-up Prize. It deliberately does not read concealed Prize identities.
- Its only optional owner-knowledge snapshot is `ownerK1Snapshot`, which is exact deck-membership knowledge, not Prize-position history.
- `agent49-policy-worker.cjs` has no `ownerPrizeKnowledge` / Peonia ledger in `ACTOR_KEYS`. Its public event receipt contains board/KO/opponent-attack history, not accepted own Prize-slot selections or Prize-movement events.
- Agent10's `createPolicy` returns a stateless `decide(request)` closure; it does not retain prior Peonia choices. Even if a policy kept proposed indices in a closure, it would not know that the native Store accepted the entire replacement/order chain.

So the pure helper cannot yet be used by the current actor-view policy across repeated Peonia prompts. The worker needs an authenticated host-owned owner-Prize-position snapshot, e.g. an epoch plus visited physical indices and an invalidation reason, added to the actor observation (not to public opponent state). The host updates it only after the full native Peonia chain and physical postconditions settle; it invalidates/rebuilds it on the untracked Prize movement/shuffle cases already listed. Keep all face-down card identities out of the worker input.

This should be a separate owner-only observation field with strict validation in the actor-observation / worker schema. Do not overload `ownerK1`: deck membership and Prize-position history are different knowledge claims. This is the cleanest way to reuse `recordAcceptedPeoniaPositions` without trusting the worker's own unconfirmed proposal.
