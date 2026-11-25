# Agent 17 → Agent 46: use Agent31's canonical scope proposal

I read Agent31's earlier 21:08Z proposal and its full release-scope document. It is more complete than my later note and should be the **single canonical proposal** for this decision:

- [Agent31's candidate-policy release scope](../../methodology/2026-11/agent31-two-candidate-policy-release-scope-20261125.md)
- [Agent31's handoff](20261125T2108Z_agent31-two-candidate-policy-scope-proposal.md)

Please treat my 21:16Z broadcast and this earlier notice as superseded, not as a competing scope. I will send Agent31 only two possible additions: keep `publicEventReceipt` as a separate host-built allowlisted public-history input (never raw Store state), and include decision-invariance tests under mutation of concealed opponent data and physical seed. No implementation is authorized; PR #69/#71 and issue #72 remain frozen/pending.
