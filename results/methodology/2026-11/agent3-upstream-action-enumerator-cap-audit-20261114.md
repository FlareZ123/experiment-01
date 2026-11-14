# Pinned Twinleaf action-enumerator cap is invisible to V3 frontier diagnostics

**Date:** 14 November 2026  
**Owner:** Agent3  
**Status:** source-level finding; research-side detector committed; not yet integrated into the V3 runner

## Finding

The pinned submodule revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05 contains ptcg-server/src/advanced-bot/action-enumerator.ts. Its ActionEnumerator explicitly describes its output as "legal-ish" and defines a per-family candidate maximum of 8.

Eight action families stop or slice their output at that limit:

- evolutions;
- Basic Pokémon plays;
- Energy attachments;
- Tool attachments;
- discard Abilities;
- Item plays;
- Supporter plays;
- in-play Ability uses.

The class returns only a flat Action[]; it does not return per-family counts or a truncation flag. Therefore the V3 adapter cannot infer upstream completeness from candidates.length.

The current research adapter's diagnostics.truncated only detects its own later maxItems cutoff (processedCount < candidates.length). It cannot detect candidates already omitted inside ActionEnumerator. The current V3 resolver then passes frontier.actionFrontier to the worker without checking or preserving frontier.diagnostics. Thus a root can appear locally untruncated while the pinned enumerator has already discarded legal action alternatives.

This is a hard admission issue, not a strength estimate: a game whose policy sees an incomplete root frontier must not be treated as a complete, competitively qualified game.

## Research-side guard

Added:

- simulation/evaluation/2026-11/agent3-action-enumerator-cap-audit.cjs
- tests/2026-11/agent3-action-enumerator-cap-audit.test.cjs

The audit reconstructs the potential count for each of the eight known capped families from the actor's native state and the same card classes/enums used by Twinleaf. It flags a family only when its potential count exceeds eight, and reports the minimum number of omitted alternatives. For example, nine Item cards in hand yield potentialCount 9, emittedMaximum 8, and minimumOmitted 1.

assertKnownActionEnumeratorCapsClear() fails closed with NATIVE_ACTION_ENUMERATOR_UPSTREAM_CAP whenever one of those known caps would omit candidates.

The helper deliberately reports knownUpstreamCapsClear, not complete: a clear result means only that these eight explicit caps are not triggered. It does not certify the entire native action space or detect unsupported action families, other enumerator omissions, or strategic equivalence assumptions.

## Validation and limits

The four pure tests passed locally under Node v22.16.0:

1. no known cap hit;
2. overflow detection for all eight capped families;
3. native turn/Bench gate handling;
4. fail-closed assertion on a known cap hit.

These are synthetic native-shaped tests. The helper has not yet been run against a compiled pinned Twinleaf Store, added to the existing contract-only CI lane, or wired into the V3 runner. No GitHub Actions run, game, matchup, deck comparison, or competitive result is claimed.

## Required integration

Before a V3 root decision is accepted:

1. Run auditKnownActionEnumeratorCaps({state, actorSeat, native}) and reject a non-clear result.
2. After building the adapter frontier, reject diagnostics.truncated === true or omittedCount > 0; the adapter's own cap is a separate failure mode.
3. Preserve the per-root audit in the privacy-safe worker/game ledger so a completed game can prove that no known upstream cap was active.
4. Add this test file to the existing bounded contract-only lane; do not create a new workflow.
5. Longer term, replace the upstream ActionEnumerator with an uncapped research-owned adapter if the project needs roots with more than eight alternatives. Even then, preserve separate proof for unsupported or absent action families.

The deterministic validation-RNG scope added in the current worker branch is orthogonal and should be retained. It prevents validation probes from advancing the physical shuffle stream, but it does not repair action-set truncation.
