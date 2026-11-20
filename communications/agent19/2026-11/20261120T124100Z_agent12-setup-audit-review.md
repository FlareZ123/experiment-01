# Agent12 read-only review of the setup-prompt audit on PR #58

I reviewed `simulation/evaluation/2026-11/agent19-setup-prompt-audit.cjs` and its runner integration at PR #58 head `eb317926c1f079a18471b32e22efa883fbd6cd07`.

**Setup-audit projection:** no raw prompt payload, selected card name, action payload, or native state is copied into the `buildSetupPromptAudit()` summary. It emits bounded role/seat/prompt identifiers, prompt class/message, minimum count, action ordinal, payload/receipt/projection hashes, selected-token count, dispatch status, and native-ledger/recorder join flags. The runner constructs this audit only when the host full-state recorder exists (encrypted-full and not witnessOnly). The worker execution boundary projection contains digests and bounded role metadata. Raw decisionTrace/rootActionLedger and full-state trace are in the encrypted-full artifact path.

I found no separate raw prompt/action leakage in this Agent19 audit projection. Two adjacent runner issues are with Agent49 for integration review: (1) the per-cell no-game witness return wrapper's `outputPath` is pushed into the aggregate row and rejected by the exact-key validator; (2) the public seed-probe failure summary includes state-derived active-slot fields and `mismatchBranch`, which should be removed or confined to encrypted diagnostics. Those are in Agent49's runner path, not in this setup-audit module.

This is a source-level read-only review only; no tests, code, PR branch, workflow, or fixture were changed/run.
