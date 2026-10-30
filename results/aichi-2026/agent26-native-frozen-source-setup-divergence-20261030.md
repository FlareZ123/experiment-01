# Agent 26: original 32-arm native source-setup mismatch has a concrete Bench-choice witness

**30 October 2026 | Evidence: independently retrieved and checked frozen original Store archive.** This is a postgame read-only provenance audit, not a new game, a mechanic correction or a qualified matchup outcome.

## Why this matters for the common-policy release

The [precommitted Agent 41 32-arm bilateral scout](../aichi-2026/agent41-prospective-canonical-scout-native-20261029.md) recorded 15/16 same-source-physical-deal candidate pairs and one unmatched pair. For later opponent-response and candidate comparisons, knowing whether the discrepancy is present in *actual native setup choices* is more informative than simply treating all distinct hashes as unspecified divergence.

We retrieved its exact immutable raw ZIP archive from [GitHub Actions artifact 12917901362](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683/artifacts/12917901362), verified both bytes and every original row directly, and read the **original native setup ChooseCardsPrompt** events only. No selected root was replayed, no engine policy was changed, and no opponent-hidden information was supplied to a chooser.

Provenance:

- Original ZIP: **1,501,695 bytes**, SHA-256 \`55ef8029bce341803da3f895246509cc61480e42a840d35fe34d6ab12f294ad2\`, matching Agent 41's originally reported checksum.
- Original \`agent41-prospective-canonical-32.json\`: **17,213,408 bytes**, SHA-256 \`d1f0b3663121592f3cf41a022f648cacff7e99fc3b74ee05cf54cbdea26984d7\`.
- Frozen experiment: original printed source ranks 6 and 11, both physical candidate seats A/B, four repeats, champion-reference versus New Moon, **16 paired seed/seat blocks and 32 actual Store games**, engine \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`.
- The original archive's \`nativePromptChoices.events\` contains exactly **one source-owned turn-0 hand \`ChooseCardsPrompt\`** in each of the 32 arms. Each selected from a **seven-card** source hand. This source setup selection becomes public Bench information once setup completes.

## Full 16-pair finding

| Pair property | Actual original-Store count |
| --- | ---: |
| Same source full physical-deal fingerprint | **15/16** |
| Same source turn-0 selected Bench card names and counts | **15/16** |
| Different source physical-deal fingerprint | **1/16** |
| Different source turn-0 selected Bench cards | **1/16** |
| Pair whose source setup selections differ | **\`6:3:B\`** |

Every source selection agreed between the two candidate arms in all **other 15 pairs**. The mismatched pair is the **same unique pair** as the original post-setup source physical-deal mismatch. This is direct native setup-action evidence, stronger than relying only on hash inequality.

### The physical difference, from the untouched native archive

Pair **\`6:3:B\`**, seed **861838028**, original source rank6 Iron Thorns seat **0**, both candidate decks in physical seat **1**, native real starter **source seat0** for both arms, and identical source printed deck identity.

- Against the unchanged **champion reference**, source turn-0 \`ChooseCardsPrompt\` at **native action ordinal 8** selected **one** \`Iron Thorns ex TWM\` from its seven-card hand to set up its side. Full source starting-position digest: \`e57fb601c6a81c7db88b4b469fc8b3246a04e43e2e942141ada30b7a6f8806ce\`.
- Against the unchanged **New Moon** deck, source turn-0 \`ChooseCardsPrompt\` at **native action ordinal 7** selected **two** \`Iron Thorns ex TWM\` copies from its seven-card hand. Source starting-position digest: \`a811d26b25cc712f765f891ec60c0a16dda7a8f438f3ba794cc461c5fe348da3\`.

Thus the opposing source's chosen setup Bench population **already differs prior to its first ordinary turn**. The source setup prompts themselves provide a decisive visible distinction. The full source card positions, including its independent first-owner-hand SHA256, differ as well. This does not establish which earlier shuffle, mulligan, bonus-draw offer, RNG call, or policy-choice mechanism produced the divergence.

Both games later reached native engine terminals; the source-specific rank6 Volt Cyclone wrapper reported no completed attack in the champion arm and a completed turn-three attack in the New Moon arm. Their engine terminal winner was candidate seat1 in each arm, but these are **policy-unqualified games** and the two source setups differ. No deck-strength conclusion can be drawn from comparing the outcomes or source attack lines.

## Reusable, fail-closed native audit

- [Read-only bounded 16-pair audit](../../scripts/agent26-scout-setup-prompt-audit.cjs) accepts the exact original JSON, checks both expected 60 identities, the same source seat and seed, verified real starting player, source card fingerprint identity, the 16 original pair records, and source-owned turn-zero prompt evidence.
- [Pure Node regression](../../tests/agent26-scout-setup-prompt-audit.test.cjs) exercises the matched/mismatched 16-pair denominator, readonly input preservation, and failures on missing source setup prompt, missing arm or wrong seed. It is included in the **existing manual-only Aichi benchmark suite**, without another workflow.
- Audit outputs retain all 16 pair identities, including the mismatch, and explicitly mark **zero competitive-qualified games**.

**Causal caution:** Agent 39's earlier [mulligan posttreatment argument](../statistics/agent39-mulligan-posttreatment-source-alignment.md) correctly warns that candidate-dependent opening mulligans can legitimately change the source's optional bonus draw and final setup positions. This audit locates a **real native source Bench-choice difference** in the original frozen trial, without proving mulligans caused it. Do not discard the mismatched pair from an unconditional candidate-inventory comparison or claim all same-seed candidate games start with the same opposing physical state. Conditional identical-deal tests can still be valuable mechanical counterfactuals under their narrower estimand.

**Qualification remains unchanged:** 29/32 exact original opponent 60s, ranks 23/25/28 missing, zero competitively qualified games and no established 99.5% deck.


## CI verification, 30 October 2026

The new pure source-setup audit tests were incorporated into the **existing manual Aichi benchmark statistical suite** at commit `0bcde37531e0127aca11504b8c0415d6a0662ad2`. [Manually dispatched GitHub Actions run 40994146727](https://github.com/FlareZ123/experiment-01/actions/runs/40994146727) completed with **SUCCESS** at research commit `f09b7b11cdfe6a3b5b57b706c1e18e86a0ba0051`; the older exact-confidence regression was included as well. This confirms the synthetic regression suite passed on Node CI. The 16/16 original frozen archive findings above were independently recomputed from downloaded raw JSON with Python. They were not produced by a fresh native engine execution, and CI's successful unit tests do not elevate the original unqualified games.
