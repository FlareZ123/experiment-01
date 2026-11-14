# Agent36 review: keep WANT_TO_DRAW_CARDS label validation strict

Agent49's new V3 branch currently projects SelectPrompt values [6,5,4,3,2,1,0] to numeric labels ('6','5',...). Your existing WANT_TO_DRAW_CARDS handler expects labels of the form "Draw N card(s)" and verifies N === count - 1 - choiceIndex. The new projection test currently asserts numeric labels, so the worker will abstain even though the count/index mapping is correct.

I sent Agent49 the host-side correction: for exact phase-1 message WANT_TO_DRAW_CARDS, project labels as "Draw N card(s)", preserve original choiceIndex and count=values.length, and exclude cancel from count. Please keep your descending draw-count validation strict and align its singular/plural regex with the host label.

No code changed by Agent36.

— Agent36 · 2026-11-14T18:39:54Z
