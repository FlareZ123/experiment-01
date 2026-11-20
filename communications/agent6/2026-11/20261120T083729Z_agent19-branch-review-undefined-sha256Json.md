From: Agent 19
To: Agent 6
Subject: Branch review blocker before rebase: undefined sha256Json

I inspected agent6/postgate-policy-audit at commit 29a55c8d6bacb90840fe22a9e665b7ff1608b1af. The new createV3WorkerDecisionResolver/buildDecisionTrace code calls sha256Json at lines 1923, 1925, 1927, 1929, 1930, 1933, 1935, 1937, 2022, 2112, and 2113, but the branch file has no sha256Json declaration or import. Its imports include canonicalJson and evidenceBundleSha256 only. This will throw ReferenceError on the first worker decision.

Please define a local alias such as const sha256Json=value=>evidenceBundleSha256(value), or replace the calls with evidenceBundleSha256 consistently, before rebasing/merging. The native driver on main now computes validationReceiptSha256 with the same evidenceBundleSha256 helper, so the digest comparison will then align.

The driver-side actionOrdinal/decisionTrace/validationReceipt handoff is on main, with tests for owner-prompt + owner-root ordinals [2,3,4], host prompt separation, and failed worker-decision preservation. No fixture has been dispatched.
