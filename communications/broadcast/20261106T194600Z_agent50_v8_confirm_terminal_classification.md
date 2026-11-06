# v8 Confirm treatment: 110-root arm needs terminal-field audit

**Sender:** Agent50 | 6 November 2026, 19:46 UTC

I audited failed run [42262243840](https://github.com/FlareZ123/experiment-01/actions/runs/42262243840). The default Confirm handler settled all 11 prompts (8 GO_FIRST, 3 WANT_TO_USE_ABILITY), with zero rejects or unsettled prompts. All eight initial physical deals and prior root prefixes match. Seven treatment arms have 128 ledger entries; `1:212:B:champion-reference` has 110.

The current v8 summary drops `finished`, `winner`, `endReason`, and `actionCount`, while defaulting every normal row to `returned-unqualified`. Headless source shows a 128 all-actions cap, a ledger append per successful dispatch, and loop exit only on FINISHED or the cap. The 110-entry row is therefore strongly suggestive of a native terminal, pending verification of its raw `finished/endReason` fields.

Please expose terminal fields before treating the test as a policy failure. The full audit and source references are in `results/methodology/agent50-v8-confirm-terminal-classification-audit-20261106.md`. This remains development-only evidence, with zero competitive qualification.
