# Fixed v7 diagnostic archive privacy without invalidating frozen Snap Trap registration

**Agent 38, 8 November 2026.** Output-boundary correction, native-CI validated.

## Decision and scope

The frozen v7 phase-A diagnostic's observer is pinned by Git blob SHA in `results/aichi-2026/registrations/agent36-issue25-public-prompt-zone-diagnostic-v7-namespace-20261107.json`. Its exact module `simulation/twinleaf/agent12/issue25-public-prompt-zone-audit-v7.cjs` (blob `320053d87f18b51de2ad54c96c5183ed5e45b9fe`) emits `offeredCount` and `zoneMatches[].eligibleCount` for an owner hidden Hand, Deck or Prize prompt, despite withholding the selected printings. Agent30's parallel v7 observer also has that field behavior.

**Do not overwrite the pinned observer**: the active frozen diagnostic validates its blob and refuses any mutation. Instead, add `redactPromptZoneAudit` to its **existing** output runner, `simulation/evaluation/agent36-issue25-public-prompt-zone-diagnostic-v7.cjs`. It runs only on the serializable artifact's `promptZoneAudit` after the original source-to-prompt same-object proof has already been evaluated and selected. It preserves all public-only, unambiguous count and printing fields. For a hidden match, a mixed hidden/public match, an unmatched/unknown zone or absent match metadata, it redacts both offered count and printings plus all match-local eligible counts. It produces new object copies and retains the original frozen observer audit for internal proof before archival.

The archive includes `promptZoneAuditPrivacyVersion: 'agent38-v7-archive-redaction-v1'` and its runner Git blob, distinguishing the corrected artifact from older v7 archives.

## Tests and genuine native execution

- [Output boundary patch c584c7d](https://github.com/FlareZ123/experiment-01/commit/c584c7d0e257b6a7ba147041fe5bcbdac497f4d4).
- [Pure regression 21bcacf](https://github.com/FlareZ123/experiment-01/commit/21bcacf658ab5350878ddf1bc7d89f9b72324460) in existing v7 diagnostic test. Checks hidden-only, mixed hidden/public, unmatched, public-only control and non-mutation of source audit.
- [Existing native workflow 42523200717](https://github.com/FlareZ123/experiment-01/actions/runs/42523200717), head `818ae477701351d34ac96707a064f2fd17db2043`: **success**. The pinned Twinleaf submodule compiled, all marker/zone/prompt and direct native tests passed, the frozen v10b phase-A source/zone proof executed and succeeded, and the artifact [13633329673](https://github.com/FlareZ123/experiment-01/actions/runs/42523200717/artifacts/13633329673) was uploaded.
- Earlier v6 observer itself received [match-level privacy redaction](https://github.com/FlareZ123/experiment-01/commit/5834793946c7e5a58f070a2fdfbbc2eecd7eab5f), with [pure tests](https://github.com/FlareZ123/experiment-01/commit/b92768b660f39d481297e07d89c965e2fff8f03c) passing shared [contract-only run 42522722333](https://github.com/FlareZ123/experiment-01/actions/runs/42522722333).

## What this did and did not prove

The real observed Snap Trap event remains a **public-only opponent Active Pokémon Energy** subzone with eight eligible attached Energy cards, so its public count remains available to exact source/Store joins and native validation. The observer module's behavior is unchanged for frozen reproducibility. The archive is privacy safer; the old raw v7 observer could still reveal hidden counts to a new caller who serializes it directly without using the corrected runner. The frozen v7 records also remain historical artifacts.

This code changes no printed Pokémon card rule, active player decision policy, decklist or matchup. It does not resolve a game choice, complete a competitive game or demonstrate a 99.5% win rate. A shared successor owner-policy vertical slice should reuse the stricter archived boundary and focus on actual first-turn actions, Store settlement and opponent replies.
