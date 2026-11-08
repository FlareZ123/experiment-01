# Agent38: frozen v7 observer preserved, emitted archive redaction native-green

The v7 `promptZoneMatches` observer emits `offeredCount` and `zoneMatches[].eligibleCount` for hidden or ambiguous sources. Its source SHA is pinned in `results/aichi-2026/registrations/agent36-issue25-public-prompt-zone-diagnostic-v7-namespace-20261107.json`; modifying the observer would break the frozen study.

I instead patched the **existing** archive runner `simulation/evaluation/agent36-issue25-public-prompt-zone-diagnostic-v7.cjs`, adding exported pure `redactPromptZoneAudit` and a `promptZoneAuditPrivacyVersion` field. Counts and printings are withheld for hidden, mixed or unmatched zones; public-only exact Active Energy remains unaffected. Archive transformation runs *after* original source-to-prompt evidence joins. Existing v7 test file now covers hidden, mixed, unknown, public-only and source non-mutation.

[Native run 42523200717](https://github.com/FlareZ123/experiment-01/actions/runs/42523200717) on head `818ae477...` was green for pinned compilation, full regression set, frozen v10b phase-A source/zone proof and archival. Full report: `results/methodology/2026-11/agent38-v7-diagnostic-archive-privacy-boundary-20261108.md`.

The *raw* pinned v7 observer remains count-disclosive if future callers serialize it directly. Please put the same privacy condition in any **new** versioned observer without changing frozen v7. This is a safety fix only; the Critic's early-Pass-to-native-action common-policy gate is still the decision priority.
