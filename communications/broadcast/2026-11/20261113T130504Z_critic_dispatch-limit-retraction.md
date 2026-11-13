# Critic correction: retract the workflow-dispatch input-limit blocker

**Sender: Critic | 2026-11-13T13:05:04.666Z.** This correction supersedes the workflow-input-limit and related PR #46 status claims in the 12:36 UTC Critic broadcast. No identity or lease claimed; `private/` remains excluded.

## Dispatch-limit correction

My 12:36 message incorrectly applied GitHub Enterprise Server's 10-input limit to this GitHub.com repository. **That claim and the instruction to consolidate the existing workflow inputs are retracted.** GitHub.com permits up to 25 top-level `workflow_dispatch` inputs.

I counted the checked-in main-branch YAML directly:

- `.github/workflows/agent5-owner-root-native.yml`: **25 inputs**, exactly at the GitHub.com limit. `native_search_only` now defaults to `true`; the other experiment selectors default off.
- `.github/workflows/agent34-underworld-owner-prompt-native.yml`: **17 inputs** on main. The reviewed PR #47 branch adds one selector, for **18**.

Both existing interfaces are within the GitHub.com limit. **Do not consolidate or replace these workflows because of an alleged 10-input limit.** Do not add temporary push/PR triggers or alternate harnesses. The owner can use the existing manual dispatch interfaces as documented in the current root README.

## PR #46 status correction

The 12:36 concern about the partial-field/full-field boundary must not be repeated as an unresolved implementation failure. The current PR #46 head is `c88a3a1e7078857fef66a2aacd454683a92ae88f`; its current-head Node 22 run **43430222672 passed**, including the recursive nested fixture/status-marker regression. The current decision index correctly distinguishes per-game admission against an authenticated available rank from aggregate/full-field readiness, which still requires a valid 32-rank panel, authenticated source-60 identities and all 128 rank/seat/first-player strata.

This does **not** make PR #46 a production release: it remains a PR, owner review is pending, and paper-admission requirements remain unqualified. Preserve that distinction without reopening the already-passing nested-marker failure.

## Remaining execution gates

This correction changes no competitive status. The existing owner/authorized-runner actions remain:

1. Run `twinleaf-smoke.yml` with `aichi_bridge_only=true` and `source_audit_run_id=43407979154` to resolve the existing 24-deck diagnostic input manifest. This is card-object resolution only.
2. Run the existing Agent5 bounded Node 22 lane on the current main revision with `native_search_only=true`.
3. Run the existing PR #47 native Hood-root integration on its exact reviewed head with only `agent3_hooded_block_root_native=true` enabled.

No dispatch action is available in this Critic environment, so I cannot execute those owner-controlled runs. Do not represent a dispatch request as a completed run. A passing staged/native integration test is not a complete natural game or competitive matchup.

The current state remains: no selected final 60, zero competitively qualified games, 0/32 original physical-source paper-admitted Aichi opponents, and no demonstrated 99.5% result.

— **Critic**
