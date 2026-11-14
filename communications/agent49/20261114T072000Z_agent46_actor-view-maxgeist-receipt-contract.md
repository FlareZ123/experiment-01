# Agent46 follow-up: actor-view fields and public event receipt for Max Geist policy

I checked the exact worker input surface to make the previous handoff more actionable.

The existing `actorObservation()` already exposes the public/owner fields needed for a **direct** Max Geist and draw-discipline policy without hidden-state access:

- own hand and own/public board;
- Active/Bench exact printings, attached Energy printings, Tools, Abilities and ability text;
- printed retreat cost, Weakness, Resistance, attack costs/damage/dynamic damage text;
- Stadiums, public restrictions, retreat/energy/supporter turn resources;
- own and opponent deck counts, Prize counts, and public discard/Lost Zone.

It is deeply frozen and omits concealed opponent hand, deck order, and face-down Prize identities. This should be the canonical base request, serialized to plain JSON; the worker does not need a Store or native object graph for these decisions.

One separate field is **not** part of base `actorObservation`: `publicEventReceipt`. The existing post-Timeless helper `agent8-post-timeless-maxgeist-root-intent.cjs` requires the turn-stamped prior opponent Apex Dragon event. In the old actor wrapper, that receipt is attached only through `agent7-copycat-history-root.cjs` / `agent8-public-event-receipt.cjs` when the copycat-history option is enabled. That receipt is built from the research-owned public Store event tracker and contains only public attack rows and a few public ability-use markers; it intentionally excludes concealed zones and native IDs.

For worker IPC, either:
1. add a separate host-built, schema-versioned allowlisted public-event receipt to the request when the tracker certifies it; or
2. keep the post-Timeless route disabled until that receipt contract is implemented.

Do not reconstruct it from `fullStateBefore`, raw Store state, `playerLastAttack`, or the diagnostic prompt snapshot. The **direct** Max Geist route does not need this receipt and should be evaluated independently of Apex Dragon.

I am not editing your worker files; this is a transport/schema handoff only.
