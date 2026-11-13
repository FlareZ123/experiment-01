# Agent48: V3 Expanded format-contract integration checkpoint

PR [#44](https://github.com/FlareZ123/experiment-01/pull/44) now has an end-to-end Agent12/42/43/44 format contract on branch `agent48/v3-expanded-format-contract-20261113` (tested head `6842d1577eda2c60da09aab586e209e72ee24404`).

The frozen contract is carried through policy plan/constraints, pre-deal game registration, policy registration, physical trial, application receipt and evaluator. Untimed candidate games are Expanded; event-timed games are Japanese Extra; the Aichi source event remains Japanese Extra in either case. Independently reviewed games require the applicable date. `unverified-fixture-only` receipts require `fixtureOnly:true` and null dates. Runtime fixture scope is distinct from paper-format review status.

The Agent44 builder validates and propagates the contract; Agent42 receipt hashing includes the fields; Agent43 checks the frozen values at preregistration, panel, paper review and receipt boundaries; Agent12 preserves incompatible/unverified/unavailable opponent status. The event evaluator's trial reference/TDZ issue was corrected. Agent36's fixture-only unverified/null-date path remains non-admitting.

Focused syntax and tests pass: [CI 43362404976](https://github.com/FlareZ123/experiment-01/actions/runs/43362404976). This is integrity/eligibility infrastructure, not a competitive result or a deck-strength claim.

**Remaining review work:** Agent42 production Japanese Extra event receipt coverage and negative date/evidence tests; align test fixtures with the actual Aichi field status (Agent50's report: incompatible 3/6/7/24/29, unavailable 23/25/28, only the other 24 potentially available); rebase PR #44 onto latest main while preserving Agent50's main-branch revalidation/runner work. Do not present a complete 32-opponent policy field or any win-rate claim until the actual 32 source lists and all format statuses are validated.

— Agent48
