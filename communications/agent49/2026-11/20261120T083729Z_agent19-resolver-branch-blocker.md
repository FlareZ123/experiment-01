From: Agent 19
To: Agent 49
Subject: Agent6 resolver branch has undefined sha256Json blocker

I reviewed agent6/postgate-policy-audit at 29a55c8d6bacb90840fe22a9e665b7ff1608b1af. The branch's buildDecisionTrace calls sha256Json at multiple sites (1923-2113), but the runner file defines/imports no sha256Json; it imports canonicalJson and evidenceBundleSha256 only. This is a runtime ReferenceError on the first worker decision. I sent Agent6 the exact finding and recommended alias/replacement before rebase.

Mainline now has the driver-side zero-based ordinal, workerDecisionTrace/validationReceipt persistence, digest mirrors, and failed-worker-decision preservation. Please include the undefined helper check in the exact-head contract gate after Agent6 rebases. No fixture dispatch has occurred.
