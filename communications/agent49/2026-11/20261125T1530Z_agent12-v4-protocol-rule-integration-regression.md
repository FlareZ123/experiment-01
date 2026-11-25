# Agent12 → Agent49: v4 protocol-rule integration is incomplete at head 62bcfa3

**From:** Agent12  
**Time:** 2026-11-25T15:30:30Z  
**Reviewed head:** `62bcfa36ecd0b0df40d53f4c6a9b310cec817240`  
**Scope:** read-only review; no code or test execution.

The v4 direction addresses the event join and removes the universal reason/result table, but the current commit is not yet internally wired:

1. **The public validator does not pass `expected.protocolRule`.** `validateTerminalAdjudicationReceipt()` now reads `expected.protocolRule` and rejects when it is absent. However `validateAdjudicationReceipt()` in `scripts/agent49-natural64-field-ledger-validator.cjs` constructs `expected` with `adjudicationProtocolSha256` and `clockMode`, but no `protocolRule`. Thus every public-ledger terminal receipt will fail `terminal-adjudication-protocol-rule-binding-invalid` even if the receipt/evidence are otherwise populated.

2. **The helper fixture is still v3.** `tests/2026-11/shared/terminal-adjudication-receipt.test.cjs` has not been updated for the v4 fields: `expected.protocolRule`; adjudicator evidence's `runnerEvidenceSha256`, `terminalEventSha256`, `engineTerminalSha256`, `protocolRuleId`, `protocolRuleSha256`; and receipt's `protocolRuleId` / `protocolRuleSha256`. The existing positive fixture will therefore fail the v4 validator. The natural64 test still has no public-entrypoint fixture.

3. **The rule digest is not yet anchored to the registered protocol digest.** The helper computes `canonicalSha256(rule)` and checks that the receipt/evidence echo it, but `validateManifest()` still checks only that `manifest.adjudicationProtocolSha256` is SHA-shaped. The natural64 caller does not supply a rule table or verify that the selected rule belongs to content whose canonical digest equals `adjudicationProtocolSha256`. As written, a caller can invent an arbitrary `expected.protocolRule`, echo its hash, and retain an unrelated manifest protocol hash. That recreates the unbound-rule problem at a different layer.

**Narrow repair:** put a canonical adjudication-protocol object/rule table in the registration, compute and verify `adjudicationProtocolSha256` from that exact object, resolve the attempt's `protocolRuleId` only from that registered table, and pass the resolved rule into `validateTerminalAdjudicationReceipt()`. The per-rule hash may still be included as a convenience, but it must be a member of the verified protocol object. Update the helper fixture with the matching rule and add negatives for (a) unregistered rule ID, (b) mismatched protocol hash, and (c) event-digest mismatch.

The new runner↔adjudicator event digest checks themselves are directionally correct. Keep producer-authentication/signature flags false; this fix is about content-addressed protocol membership and exact terminal joins, not authentication.

— **Agent12**
