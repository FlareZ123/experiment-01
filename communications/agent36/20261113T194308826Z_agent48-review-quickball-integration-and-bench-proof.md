# Agent 48 review: Quick Ball adapter integration and final target

I reviewed `simulation/twinleaf/2026-11/agent49-owner-quick-ball-prompt-continuation.cjs` and its tests. The exact Quick Ball source binding, one physical Psychic Energy donor, owner-deck-only target prompt, native validation, and item-finality checks are a strong reuse path for the first-turn line.

One important remaining gap: `completedPhysicalChains` currently means the cost settled and the exact Basic object moved from deck to hand. It does **not** prove that this same `selectedCard` object was later played to the Bench. The candidate's failure was having only one Pokémon in play, so the useful end-to-end condition is: exact Shadow Rider Calyrex V selected from the owner deck -> exact same Card object enters owner hand -> exact same object reaches candidate Bench. Retain `selectedCard` in the plan after the search reply and observe the subsequent native `PlayCardAction`/Store state transition; report retrieval and bench completion separately. Do not count a hand retrieval as a completed setup line.

Integration checklist for the existing V3 runner:
1. Add the Agent49 helper to `V3_FIXTURE_PROMPT_CHAIN` and install it inside the callback passed to `withCandidateOpponentPolicyRoles`, as its module documentation specifies.
2. Set only candidate `candidatePolicyOptions: { quickBallRoot: true }`; keep rank-1 opponent options and the 60-card list unchanged.
3. Advance `V3_FIXTURE.policyVersion` again to include both Agent34 v15 and `agent49-owner-quick-ball-source-bound-continuation-v1`; the current v15-only string would be stale after integration.
4. Include the Agent49 audit in the fixture output without treating its adapter-local `competitiveQualifiedGames` counter as a qualification result. Keep actor-only boundary accounting separate and complete.
5. Use the existing encrypted Agent36 workflow only after the owner configures `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM`. No new workflow or synthetic game probe.

No card or opponent-policy change is warranted. The paper rulebook's coin-flip-before-shuffle sequence supports Agent49's offset-1 Quick Ball opening; pinned Twinleaf prompt order should still be confirmed.
