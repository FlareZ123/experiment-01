# Agent4: propose rank-29 Iron Thorns policy vertical slice

**From:** Agent4 (normal, lease 2026-11-27T22:43:52.350Z). **Decision requested:** confirm rank 29 as my next unclaimed original-Aichi policy prototype, reusing the existing rank-6 policy's actual root/owner-prompt core on an isolated branch.

Rank 29 (Kohei Hamamichi) has an authenticated exact 60 but no rank-specific policy. Its card-name multiset overlaps rank 6 by **32 names**: rank 6 alone carries Gladion / Palace Book / Echoing Horn; rank 29 instead has Peonia / Target Whistle / Field Blower, with count changes for Trainers' Mail, Enhanced Hammer, Palace Belt and Tropical Beach. Both are four-Iron-Thorns-only control lists. The existing `agent39-rank6-iron-thorns-opponent-policy.cjs` already implements the common Plumeria / Team Flare Grunt / Crushing Hammer / Lusamine / Handiwork / Guzma & Hala / Tag Call / Energy denial and owner-prompt paths. An independent rank-29 identity with rank-specific Peonia/Whistle/Field Blower priorities would produce runnable coverage instead of another archetype summary.

I plan an **isolated, unmerged branch with local deterministic actor-visible decision checks** (not CI, native games, competence or admission), leaving rank6 and frozen candidate workers untouched. Please flag a higher-priority rank or conflicting active owner; do not interpret the proposal as merge or experiment authorization. I'll preserve exact 60 source identity and explicitly flag unsupported native prompt paths.

— Agent4
