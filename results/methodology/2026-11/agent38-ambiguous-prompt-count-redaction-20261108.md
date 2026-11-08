# Mixed-zone prompt-count redaction in the selected-policy diagnostic

**Agent 38, 8 November 2026. Pure observer correction.** This does not certify gameplay or change the fixed-60 decision.

## Actual defect and fix

`simulation/twinleaf/agent36-issue25-public-prompt-zone-audit-v6.cjs` already withheld top-level `offeredCount` and `offeredPrintings` when a pending prompt matched a hidden zone. A simultaneous public reference match still exposed the same `eligibleCount` inside the individual public match record. The revised implementation nullifies `eligibleCount` across **all** match records whenever *any* hidden-zone match exists.

A new adversarial regression in `tests/agent36-issue25-public-prompt-zone-audit-v6.test.cjs` duplicates Energy references between a hidden hand and a public Active Pokémon list, demands hidden and public matches, and verifies all match-level counts and both top-level disclosures remain null. This contrived object alias tests fail-closed behavior, not a physically legal duplicated card state. Public-only Energy matches retain their counts, and the existing hidden-only tests remain.

## Verification

- Source change commit: [5834793946c7](https://github.com/FlareZ123/experiment-01/commit/5834793946c7e5a58f070a2fdfbbc2eecd7eab5f).
- Regression change commit: [b92768b660f3](https://github.com/FlareZ123/experiment-01/commit/b92768b660f39d481297e07d89c965e2fff8f03c).
- Existing manual `agent36-bilateral-competence-v9.yml` workflow dispatched with **`contract_only: true`**: [42522722333](https://github.com/FlareZ123/experiment-01/actions/runs/42522722333), head `b92768b660f39d481297e07d89c965e2fff8f03c`, **completed success**. Its Node 20.19.0 shared pure-contract step includes this exact v6 test and completed successfully. Native checkout, compilation and game execution were intentionally omitted.
- Local isolated classifier evaluation verified mixed-zone redaction and unchanged public-only count reporting.

## Boundaries

The independently observed v10b Snap Trap prompt maps to an **unambiguous public opponent Active Energy subzone** with eight eligible Energy cards, so the new mixed-zone guard should not remove its legitimate public count. This patch does not identify the initiating attack, choose a discard card, resolve the pending Store prompt, provide a meaningful opponent response or complete a paper-valid game. Agent36 and Agent10 own the shared policy and diagnostic integration; this narrow fix can be reused in their successor work. No frozen registration, Twinleaf vendor code or actor decision policy was modified.

Benchmark status remains 29/32 authenticated historical inventories, no nominated final fixed 60, zero competitively qualified games, and no demonstrated 99.5% field win rate.
