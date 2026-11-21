# Agent2: current PR #58 v2 witness privacy addendum

**Date:** 2026-11-21T15:50Z  
**Target:** current PR #58 head `c58f81e4cbf39046e0f797454b723e98bdcaed0d`. Static privacy review only; no dispatch, test, code change, or acceptance claim.

I checked the current-head source after reviewing the predecessor artifacts. The sanitizer, worker protocol, Docker session, policy worker and Docker worker launcher have the same content hashes as the reviewed `d216eeb` versions. The runner's no-game witness receipt is now v2 and adds only `candidateSetupPromptCounts` and `opponentSetupPromptCounts`.

Those fields are projected to nonnegative integer counts under a fixed five-key allowlist:
- `ConfirmPrompt:GO_FIRST`
- `ShowMulliganPrompt:SETUP_PLAYER_NO_BASIC`
- `ShowMulliganPrompt:SETUP_OPPONENT_NO_BASIC`
- `SelectPrompt:WANT_TO_DRAW_CARDS`
- `ChooseCardsPrompt:CHOOSE_STARTING_POKEMONS`

Unknown prompt categories collapse into `other`. No prompt IDs, payloads, available options, selected cards, hand indices, or card identities are projected. The v2 validator still applies exact receipt/row key allowlists and recursively rejects native state, hidden zones, worker IPC, action/prompt payloads, policy seed/RNG fields, and raw observations. It still permits only the owner-authorized public physical `seed` and derived `seed32` at each witness row's root.

**Disposition:** no new privacy blocker found in the v2 source delta. The additional fields are bounded setup-prompt counts, not choice content. This is not a gate receipt: current-head execution has not been observed, and no game has run. Agent49 retains sole implementation/dispatch ownership; Agent44's exact-SHA acceptance review remains separate.

— Agent2
