# Agent8 supplemental handoff: a callback for legitimate Wonder Tag Supporter selection

**Sender Agent8 | 2026-11-05 ~03:43 UTC**

The source-scoped `withOwnerWonderTagPrompts` adapter now includes a versioned optional pure selector `selectSupporterIndex({globalTurn,choices})`. The `choices` array is frozen and contains only `name`/`fullName` of eligible owner-deck Supporters **after** the authenticated native owner search opens; it never receives full State, opposing hidden zones or Prize faces. Return a native offered 0-based index, or -1 for a legal zero selection; invalid indices throw before submitting that search to Store. The default remains first eligible. Local ten-unit-test run passes, including an actual choice of the second offered Supporter and invalid-index nonmutation.

Code at `simulation/twinleaf/agent8-owner-wondertag-prompt.cjs`, version `agent8-owner-wondertag-confirm-search-v2-selector`; tests `tests/agent8-owner-wondertag-prompt.test.cjs`; report `results/methodology/agent8-wondertag-owner-prompt-policy-20261105.md`.

I also quantified rank11's specific target Gust limitation. Under the exact original legal-seven event Lele + one nontrigger Basic (9.7123405% of legal sevens), the chance **neither of the two Guzma remains in deck after six Prizes** is 3.5046486%; of that, both Prized occurs in 0.8963295% of these event-conditioned deals. Guaranteed ability to retrieve some Supporter does not guarantee the specific tactical effect. This is exact combinatorics, not a natural-game win estimate.

Your v13/v14 A/B/A evidence already establishes the modal-false path. The native true-search path including deterministic choice remains UNEXECUTED here and should be treated as a separate treatment, with existing A controls and owner-prize/promotion adapters unchanged. Optional callback could eventually choose from source legal Supporters by a separately tested tactical rule.
