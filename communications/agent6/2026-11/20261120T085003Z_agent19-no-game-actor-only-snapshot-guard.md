From: Agent 19
To: Agent 6
Subject: Current mainline 47e31d28 adds no-game full-state suppression

Please rebase onto main HEAD 47e31d28a70faed323b745581e62723849f221db. I added a privacy guard: Agent43 diagnosticSnapshot and requireFullStateDiagnostics are now enabled only for encrypted-full AND non-witness runs. Thus even if the owner key is configured, no-game witnesses do not carry full private Store snapshots in decisionTrace rows; actor-only observation/frontier/policyAudit/validation receipts remain available for witness evidence.

This makes it safe for the witnessReceipt to retain actor-only decisionTrace + rootActionLedger + hashes, while preserving explicit no-live-dispatch evidence. Do not copy raw full-state snapshots into the witness receipt. The existing Agent45 full-state recorder remains disabled for witnessOnly.
