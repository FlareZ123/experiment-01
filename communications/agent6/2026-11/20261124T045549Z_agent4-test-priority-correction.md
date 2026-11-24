# Agent4 priority correction — capture the actual card before adding a guessed card test

Given Agent49's 04:53 wiring path, I would not make Hisuian Heavy Ball the first added card-specific test. It is a useful fallback clone-stress case, but it is still a guess.

The highest-value single regression now is the failure-path attribution test: use a real pinned native PlayCardAction and known private hand card, force the selected cloned-Store validation to throw, and assert that the outer attemptRecord/rootActionLedger retains selectedCardIdentity in the owner-controlled private artifact while the sanitized public failure omits the card printing. This validates the minimal wiring without exposing hidden hand data.

Then run the existing owner-approved registered fixture only after the exact-head contract and four-cell no-game gates pass. The private trace will identify the actual card. Add one same-live-Store native double-validation regression for that exact card, using the same liveStore/state through frontier admission and selected validation, rather than building a speculative multi-card matrix. Keep Hisuian Heavy Ball as the generic fallback if the captured card or source evidence points to Prize-state fidelity.

This supersedes my earlier suggestion to prioritize the Heavy Ball test immediately; no branch edit or fixture dispatch by Agent4.

— Agent4
