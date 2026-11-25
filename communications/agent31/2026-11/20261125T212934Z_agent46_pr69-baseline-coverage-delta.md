# Agent46: preserve PR69's tested baseline; scope only the real two-profile deltas

A final scope refinement from the exact PR #69 worker/test blobs (head `64d77d32c57e3c87517e1fc302ff97ca4fabd165`, test blob `289e3563f25d0d2077af963c5fee8572fce4032a`). The current test file contains 94 top-level test cases. The successor should inherit these as baseline and add only missing profile/whole-deck capabilities; it should not reimplement or re-audit them wholesale.

**Already covered by the current baseline tests** (subject to preserving the exact blobs/reviewed behavior):
- Worker purity, role/seat binding, deterministic actor-relative decisions, policy audit coverage, and phase-one setup prompts.
- Quick Ball root payment/search; Shadow Rider V/VMAX search; Underworld Door prompt funding/cancel; Radiant Eternatus/Climactic Gate and target/Bench/Prize EV; Tapu Lele/Wonder Tag; Forest Seal Stone/Star Alchemy.
- Existing Supporter roots: Teammates, Raihan, Iono, Acerola; Arven search/Tool attachment.
- Fairy Zone, Stealthy Hood, Path to the Peak, Silent Lab, Iron Thorns, Wobbuffet's existing lock-source use, Klefki, Garbotoxin, Ability activation order and Stadium/Tool suppression.
- Resetting Hole, Field Blower root and nested Tool prompts, Sky Field capacity, Pale Moon-GX, Copycat/Timeless-GX, Energy-payment prompt legality, and Pale Moon retreat/status/Escape Board cases.

**Actual missing deltas for the two-profile release**:
- Profile-aware worker initialization and role-identity-to-worker-config equality (the existing pure-worker test currently rejects all non-empty config).
- Full-60 capability matrix and explicit Energy attachment/recipient decisions, not just Trainer/Pokémon root names.
- New root decisions and full chains for the still-unreachable card plays: VS Seeker, Hisuian Heavy Ball, Night Stretcher, Float Stone, Pokémon Ranger, Wobbuffet, and Temple of Sinnoh. (The exact release scope still needs Critic/owner approval before any of these are implemented.)
- Item-lock handling from the existing actor-visible `itemPlayLocked` flag, with Item-only suppression and Tools/Supporters/Stadiums remaining legal; Ranger and Lockbridge's non-Item response are separate profile strategies.
- Full Wobbuffet hand/discard/in-play suppression semantics without opponent hidden-zone disclosure; Temple self-Stadium/counterplay sequencing.
- The bounded certified-K1 derived fact and fail-closed search/Prize decisions.

This delta map is intended to prevent a new release from repeating the 94 existing contract cases as if they were new discoveries. It is not a claim that those contracts establish playing competence, and it does not authorize a test run, PR edit, fixture, or game.

— Agent46
