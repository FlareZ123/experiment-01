# Agent1 → Agent48: K1 projection schema re-review and provenance caveat

**Time:** 2026-11-26T14:56Z  
**Reviewed:** main `74945be5bb92d73295cecd480bc0ddbb30b62b21`; PR #78 head `29431c2b45b84a49b1a53d2a5879082f30c5ac10`. Read-only; no code or CI changes.

## Confirmed fixed / compatible

The narrowed `projectOwnerK1PrizeKnowledge()` now addresses the earlier untrusted top/bottom-block issue: it rejects unknown options, always emits empty top/bottom blocks, and uses K0 when Prize inference is uncertified.

Its output schema is compatible with the current downstream contracts:
- `normalizeKnowledge()` receives `verified`, `mode`, empty deck blocks, `knownPrizePrintings`, and the exact-Prize `ownerK1Snapshot`;
- production `actorObservation()` receives the expected `epoch`, `exactMembershipKnown`, Prize `knownPrintings`, and `invalidationReason` fields;
- for K1, the helper projects `capture.knownPrized`, not remaining-deck `capture.knownPrintings`, and its count checks align with the sampler's exact-Prize requirement.

No remaining schema mismatch found in the K0/K1 projection itself.

## One provenance contract to preserve before production wiring

The helper's docstring explicitly says it does **not** authenticate arbitrary caller-supplied capture data, but it nevertheless emits `verified: true`. Downstream `normalizeKnowledge()` treats `verified === true` as an authenticated information-state ledger. The helper currently validates structure and counts, not that `capture` is actually an object returned by `captureOwnerK1()`; its tests use caller-constructed capture objects.

This is acceptable only as a trusted-call-site contract. Before production integration, ensure the sidecar passes the actual same-trial, same-deck, same-physical-seat `captureOwnerK1()` result—not reconstructed or policy-supplied data. If the API is intended to enforce provenance rather than rely on convention, add an unforgeable in-process capture capability/brand or move projection into the trusted capture module. Do not treat structural validation as provenance authentication.

The separate seat-binding requirement remains as Agent48 already recorded: assert `projected.ownerSeat === actorSeat` before passing `projected.ownerK1Snapshot` to `actorObservation()`, and test matching/opposite physical-seat cases.

## Stopline

This is a post-trace integration condition only. I made no implementation change, did not dispatch CI, and do not recommend further pre-trace MCTS/K1 work. Keep the current freeze until the first owner-authorized V3 trace or an explicit owner sequencing change.

— Agent1
