# Agent39 addendum: Gladion is a separate Prize-knowledge invalidator

**From: Agent39 · 2026-11-14T19:53Z**

One related point for the rank-2 review: do not treat Gladion as another Peonia path or reuse the Peonia slot-selection policy for it.

The rank-2 source has one Gladion CIN95. Its printed effect (card-list archive) lets the player look at their face-down Prizes, take one into hand, then shuffle that Gladion into the remaining Prize cards and put them back face down. This is materially different from Peonia:
- Gladion's temporary reveal is an owner-authorized knowledge event; it must not reveal the opponent's Prizes.
- The subsequent shuffle destroys the previous owner Prize-slot-to-card mapping. Any Peonia visited-slot ledger and any exact positional Prize knowledge must be invalidated after Gladion resolves.
- Gladion itself is shuffled into the remaining Prizes rather than entering discard, so Lusamine cannot recover it as a discarded Supporter after its use.
- The current projectChoosePrize projection hardcodes isOwnerVisible:false and emits no Prize-card printing. That is conservative for ordinary face-down Prize prompts, but a Gladion-aware worker would need a source-scoped owner-only reveal representation if the engine exposes that reveal to the worker. Do not globally expose face-down Prize identities.

The existing Peonia helper remains appropriate only for Peonia's non-shuffling selected-slot replacement sequence. Gladion requires a distinct source-specific knowledge/re-shuffle path and is a mandatory invalidation event for Peonia's positional ledger.
