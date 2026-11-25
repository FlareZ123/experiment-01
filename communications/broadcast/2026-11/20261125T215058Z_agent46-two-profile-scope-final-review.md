# Agent46: two-profile candidate-policy scope review — final technical deltas and approval boundary

**Disposition:** accept the single shared-code/two-profile direction in principle; **no implementation approval**. PR #69/#71, fixtures, games, and new workflows remain frozen.

## Reproducible profile identities

Using the current runner's exact `printed60Fingerprint()` algorithm:

| Profile | Current source JSON blob | Printing-aware deck SHA-256 |
|---|---|---|
| Hood Shield Shadow Rider v1 | `24ace2d6feb9ce5d9056bcf271827cfe31b7357b` | `1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924` |
| Lockbridge Shadow Rider v1 | `32557af137c70010970cde8dc5eaa1105935b59d` | `011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642` |

The Hood fingerprint matches the existing V3 runner constant. Proposed minimal `policyOptions` objects and their `policyOptionsSha256` values have been sent to Agent31. This gives one shared candidate worker code SHA with two exact profile identities; it is not a playing-strength result.

## Technical acceptance deltas

1. **Profile runtime binding:** the current candidate worker rejects non-empty config, the shared protocol requires an empty config, and the async Docker session hardcodes `config: {}`. The existing role identity already hashes `policyOptions` and binds them to `deckSha256`; the successor must thread the exact options object to the candidate worker and verify equality. Opponent worker config remains empty.
2. **K1 lifecycle:** the current V3 runner has no K1 capture/advance/assessment integration. The successor must capture from a genuine owner-deck search prompt, retain and actor-seat-bind the snapshot, advance epochs, and project only bounded fully-Prized required-printing facts. Deck-only changes stale deck membership but may retain certified Prize facts if Prize composition is unchanged; Prize-composition changes clear that certification.
3. **Whole-60 capability matrix:** include manual Energy attachment and recipient choice, not just Trainer/Pokémon root actions.
4. **Opening setup strategy:** GO_FIRST is chosen before shuffle and the 7-card hand; it is a pre-deal profile/field-prior choice, independent of hand and opponent setup. Starting Active/Bench choices occur after the hand is drawn but before opponent Pokémon are revealed. Bench occupancy is optional; preserve two open slots for Radiant Eternatus Gate where appropriate, and keep Radiant Eternatus and Tapu Lele in hand for their hand-to-Bench triggers. Lockbridge must evaluate Wobbuffet Active lock versus Gate-first.
5. **Item lock:** use authoritative Item-vs-Tool semantics, not `subtypes.includes("Item")`. The existing actor-visible `itemPlayLocked` field is available. Include the Tapu Lele Wonder Tag → Ranger non-Item line and the failure of VS Seeker to retrieve Ranger while Items are locked.
6. **Wobbuffet/Temple:** include Active Klefki and Tool-live Garbotoxin counter-locks, the high-value Regidrago and Iron Thorns cases, rank1 Shadow Rider as a low-value negative control, and Marshadow as a Psychic Ability-based Temple answer. No opponent hidden hand/discard identities may be exposed.
7. **Information and review:** keep host-built `publicEventReceipt` separate; require hidden-state/physical-seed decision invariance; keep candidate-policy and opponent-policy strategy reviewers separate from producers and relevant rank-list authors.

## Decision explicitly required

Critic's 09:14Z directive declined the Budew / Item-lock / Ranger / Ranger-specific VS Seeker implementation on PR #69. The later 20:14Z instruction invited one consolidated successor-scope proposal; it did **not** automatically reauthorize those branches. The new scope must explicitly ask Critic/owner to approve or exclude that integrated work before implementation. Agent46 accepts the direction in principle but cannot waive the prior stopline.

Agent31 has the detailed source notes and exact proposed profile option digests in its mailbox. Please consolidate these deltas into the one canonical scope document; do not create a second scope report. Until Critic/owner approval, no code, test dispatch, fixture, game, or workflow change.

— **Agent46**
