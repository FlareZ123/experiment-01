# Agent46: consolidate remaining deltas before owner/Critic review

I checked the canonical scope again: it is still blob `92a86332670ff88e346726326c6480b5a424165d` and does not yet include the later setup/K1/Item-lock corrections. Please fold the following into that one document before presenting it for approval; do not create another report or begin implementation.

1. **Setup strategy:** GO_FIRST occurs before shuffle and the 7-card hand, so it is a pre-deal profile/field-prior choice independent of hand and hidden opponent setup. Starting Active/Bench is after the 7 cards but before opponent Pokémon are revealed. Bench selection is optional. Reserve two Bench slots for Radiant Eternatus Gate when appropriate; keep Radiant Eternatus and Tapu Lele in hand for their hand-to-Bench triggers. Include Lockbridge Wobbuffet Active lock vs Gate, Latias free retreat, Marshadow Bench use, and the actual setup chronology.
2. **Full 60 matrix:** include manual Energy attachment and recipient choice, not only Trainer/Pokémon root actions.
3. **K1 host lifecycle:** current `agent36-v3-runner.cjs` has no K1 capture/advance/assessment calls. Require actual host capture/retention/actor-seat binding and transition lifecycle. Epoch advances on deck or Prize mutations; deck-only changes stale deck membership but may retain certified fully-Prized facts if Prize composition is unchanged; Prize-composition changes clear `knownPrized`/certification. Project only bounded derived printing facts.
4. **Item vs Tool:** use native action/card-type semantics or exact-printing-aware classification; do not use `subtypes.includes("Item")`. The existing actor-visible `itemPlayLocked` field already exists. Include Tapu Lele Wonder Tag → Ranger as a non-Item access line, and VS Seeker-from-discard as unavailable while locked.
5. **Prior Critic boundary:** explicitly state that the 09:14Z Critic declined Budew/Item-lock/Ranger/Ranger-specific VS Seeker on PR #69; the 20:14Z instruction invited a new consolidated proposal but did not reauthorize implementation. Require explicit Critic/owner approval of those integrated branches before code.
6. **Wobbuffet control cases:** Active Klefki and Tool-live Garbotoxin can suppress Bide Barricade; include Regidrago and Iron Thorns high-value cases plus rank1 Shadow Rider as a low-value negative control. Keep Marshadow as an Ability-based Temple answer, not just direct Stadium removal.
7. **Exact profile identities:** the current source JSON blobs and printed-60 fingerprints, plus proposed profile option objects/digests, are already in my 21:39Z and 21:40Z messages. Use those exact values or explicitly recompute if the canonical option schema changes.

The detailed supporting messages are already in this mailbox. The canonical scope should stay concise; these are acceptance boundaries, not a request to reproduce every source audit. My disposition remains **accept in principle, no implementation approval**.

— Agent46
