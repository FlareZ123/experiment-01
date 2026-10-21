# Agent 2: native Store root alignment for paired source-pressure census

**21 October 2026, source-data integrity regression.** Scope: the existing unconditional bilateral paired-attempt census, not new match outcomes or policy improvement.

## Fault

`pressureEvidence(row, sourceSeat)` in `simulation/evaluation/agent2-bilateral-unconditional-census.cjs` previously accepted an `effectVerified` and `traceAuthenticated` producer assertion plus in-range ordinal and same-turn numbers as `verified-effect` without checking those claimed positions against the preserved `rootActionLedger`, even when a full native Store action ledger was supplied. A counterfactual row could relabel a pressure action by the wrong actor or turn while keeping superficial ordinal bounds valid.

The already existing strict gate independently checks complete ledger hashes/clock continuity, but this census's individual pressure classification also needs actor/turn action alignment. Its descriptive, unconditional denominator must not erase censored, mismatched, or missing source starts.

## Fix

Added `pressureLedgerAligned(row,pressure,sourceSeat)` to the census and gated a positive classification on it whenever `row.rootActionLedger` exists. It verifies:
- the ledger is complete for the recorded root count;
- the initiating ordinal exists, names the true physical source seat, matches the global turn and is an initiating rather than a prompt action;
- the completion ordinal exists and matches the claimed turn;
- completion is source owned, or is a genuine `ResolvePromptAction` rooted in an earlier source-owned non-prompt action within the claimed pressure span.

Without a ledger, legacy producer assertions remain labeled `verified-effect` for compatibility. **This backward-compatible behavior is weaker evidence**, and must never be confused with a native-ledger-aligned source pressure witness or independently audited paper effect. This check itself does not inspect whether the printed attack, Ability or lock effect applied correctly.

## Reproduction

- Source commit: [f9ac8c6](https://github.com/FlareZ123/experiment-01/commit/f9ac8c6736d65fa2dfe8341e402171a2b5a76c96).
- New pure Node test `tests/agent2-pressure-ledger-alignment.test.cjs`: [cead83a](https://github.com/FlareZ123/experiment-01/commit/cead83a44b738629d722f76413d58123ab82d3ff). Exercises correct source claim, wrong actor, cross-turn closure, valid neutral prompt closure, unrelated origin, incomplete transcript, and legacy no-ledger branch.
- Existing manual workflow `.github/workflows/aichi-global-field-gate.yml` updated [dfbaf52](https://github.com/FlareZ123/experiment-01/commit/dfbaf524071dfe7f75f87758168e47e5be2a0ea0).
- [Compiled workflow 39563274865](https://github.com/FlareZ123/experiment-01/actions/runs/39563274865) **SUCCESS**, head `dfbaf524071dfe7f75f87758168e47e5be2a0ea0`; includes the existing unconditional census suite and new proof tests. No vendor submodule changed.

## Boundary and next decision

This is a partial integrity gate, not proof that legacy `traceAuthenticated` claims are independently source-grounded. Future prospective archives should preserve all raw ledgers and should report native-root-aligned witness counts separately from legacy producer-claim counts. Preserving the old schema for previously registered synthetic fixtures avoids retroactive outcome mutation.

Field status unchanged: 29/32 complete exact official opponents, missing ranks 23/25/28, zero competitive-qualified games, no validated 99.5% fixed 60.
