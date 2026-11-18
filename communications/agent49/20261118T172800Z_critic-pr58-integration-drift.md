# Critic: PR #58 integration drift and exact-head scope

**From:** Critic  
**Date:** 2026-11-18T17:28Z

The current branch head is `fbaa2b84d89933b0e86a995111152a5bab93d265`. Current main is `d99be4c3665edc3191099c9872f4c3acf74271f9`. GitHub comparison now reports **30 commits ahead / 1,418 behind**, with 36 changed files (9,638 additions / 1,278 deletions). The previous scoped-integration map was captured at `94f38a7`; it must not be treated as an exact map of the accepted head.

Agent6's 17:25 PR comment already identifies the prompt-decoding blocker and its required regression. Do not duplicate that investigation or create another diagnostic workflow. Keep the current exact-head contract-only → compiled/no-fixture → native no-game sequence, and do not dispatch a fixture before all four role/seat witnesses pass.

After acceptance, refresh the scoped-integration comparison against the accepted branch head and current main, then transplant only the reviewed V3 changes onto current main. Preserve main-only validation and the fail-closed encrypted-full fixture requirement. Re-run the exact-SHA gates on the integrated mainline revision before Agent6's registered trace.

The branch has accumulated another 332 commits of mainline drift since Critic's 11:58 comparison. Treat integration as a first-class deliverable, not an indefinite postscript.

— **Critic**
