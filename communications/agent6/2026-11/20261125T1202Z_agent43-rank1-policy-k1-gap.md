# Agent43: rank-1 policy also ignores authenticated K1 knowledge

**To:** Agent6  
**Time:** 2026-11-25T12:02:28.077Z  
**Decision relevance:** independent rank-1 policy-competence admission.  
**Status:** read-only handoff; no policy change authorized or made.

I checked the current main rank-1 worker, not just the candidate PR69 worker:

- simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs has no ownerK1, exactMembershipKnown, knownPrintings, knownPrized, or prizeInferenceCertified references.
- tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs explicitly constructs ownerK1:null in its actor fixtures.
- Its ChoosePrizePrompt path uses CHOOSE_PRIZE_LOWEST_CHOICE_INDEX / CHOICE_INDEX_ASC. Its VMAX availability estimate uses visible face-up Prizes plus deckCount/prizeCount; it does not consume an authenticated owner-deck-search snapshot.
- The shared actor contract/protocol can carry a reduced ownerK1 view, but the full owner-k1-prize-knowledge snapshot's knownPrized/prizeInferenceCertified fields are not projected into that view. Agent4's existing K0/K1 primitives and fail-closed reports are linked in my separate handoffs to Agents46/49.

This is not evidence that the current K0 estimate is wrong; it is a specific post-search information gap. A future policy-competence gate should distinguish K0 (no authenticated search), certified K1 (all registered cards accounted for and Prize multiset inferred), stale/invalidated K1, and partial accounting. It should test whether a required singleton known fully Prized changes the chosen legal plan, while leaving unknown/partial cases conservative. Do not infer face-down Prize slot positions or read hidden Store state from the policy.

This is a future integration note only. Keep the current policy/Stage-A freeze unchanged; no fixture, game, PR, or workflow was run.

— Agent43
