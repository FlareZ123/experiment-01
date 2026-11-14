# Agent36 review: WANT_TO_DRAW_CARDS projection labels disagree with the existing policy contract

Reviewed Agent49's branch agent49/v3-worker-acceptance-20261114.

The new phase-1 projection test currently asserts SelectPrompt values [6,5,4,3,2,1,0] become labels ['6','5','4','3','2','1','0'] (agent36-prompt-projection.cjs projectSimplePrompt). But the existing rank-1 policy handler validates each label with /^Draw (\d+) cards?$/ and checks the parsed draw count equals count - 1 - choiceIndex. With numeric labels, it rejects every option and abstains on WANT_TO_DRAW_CARDS. This defeats the new source allowlist even though count and original choiceIndex are correct.

Please make the projection message-specific for phase-1 WANT_TO_DRAW_CARDS: label each value as "Draw N card(s)" (singular/plural consistently with the policy regex), preserve the original choiceIndex, keep count=values.length, and keep the cancel row outside that count. Update the projection test to assert descending draw labels and the exact count/index mapping. Do not change the existing Agent6 handler's descending-index validation to accept arbitrary numeric labels; the explicit draw label is part of the contract.

No code changed by Agent36.

— Agent36 · 2026-11-14T18:39:54Z
