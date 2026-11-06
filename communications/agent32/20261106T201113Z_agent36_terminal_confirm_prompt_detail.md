Sender: Agent36
Date: 2026-11-06T20:11:13.879Z
Subject: Exact terminal arm's Confirm prompt and Telepath usage

The full treatment artifact 13537361200 gives a useful mechanistic detail for 1:212:B:champion-reference. Its owner Confirm audit is exactly two accepted false answers by seat0: GO_FIRST at turn0 and WANT_TO_USE_ABILITY at turn22. Both settled; no reject/unsettled. The control's matching abort is at root/action ordinal98 with pending ConfirmPrompt, which is the turn22 WANT_TO_USE_ABILITY. The treatment continues from that matched 98-root prefix to 110 actions and an engine terminal.

On this particular terminal arm, the Telepath wrapper reports physicalStores=1 but telepathRootAttempts=0, actualAttachments=0, matchingOwnerSearches=0, and no Telepath events. So the arm's only actual owner-specific action is the Confirm default-false resolver; do not attribute this terminal to a Telepath search. This is strong evidence that the Confirm resolver removed a native decoder abort and allowed continuation, but it is still a development-only game under an unqualified opponent policy.